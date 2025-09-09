// functions/src/handlers/catalog.handler.ts
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import { AuthService } from "../services/auth.service";
import { WhatsAppService } from "../services/whatsapp.service";
import { MediaService } from "../services/media.service";
import { NotificationService } from "../services/notification.service";
import { Logger } from "../utils/logger";
import { Helpers } from "../utils/helpers";
import { APP_CONFIG } from "../config/constants";
import { SyncCatalogRequest, SyncInventoryRequest } from "../types/requests";
import { Product, ProductOption } from "../types/entities";
import { SyncCatalogResponse, BaseResponse } from "../types/responses";

export class CatalogHandler {
  private static get db() {
    return getFirestore();
  }

  static async syncCatalog(
    request: SyncCatalogRequest,
    userId: string
  ): Promise<SyncCatalogResponse> {
    const { businessId, syncType, productIds, productOptionIds } = request;

    try {
      // Validate access
      await AuthService.validateBusinessAccess(userId, businessId);

      // Get WhatsApp config
      const whatsappConfig = await WhatsAppService.getConfig(businessId);

      // Get product options to sync
      const productOptions = await this.getProductOptionsToSync(
        businessId,
        syncType,
        productIds,
        productOptionIds
      );

      Logger.info("Starting catalog sync", {
        businessId,
        syncType,
        productOptionCount: productOptions.length,
      });

      const results = {
        syncedProducts: 0,
        failedProducts: 0,
        errors: [] as Array<{ productId: string; error: string }>,
      };

      // Process in batches
      const batches = Helpers.chunkArray(
        productOptions,
        APP_CONFIG.WHATSAPP.BATCH_SIZE
      );

      for (const batch of batches) {
        const batchResult = await this.processBatch(
          batch,
          whatsappConfig,
          businessId
        );
        results.syncedProducts += batchResult.successful;
        results.failedProducts += batchResult.failed;
        results.errors.push(...batchResult.errors);
      }

      // Log analytics
      await NotificationService.logAnalytics(businessId, "catalog_sync", {
        sync_type: syncType,
        products_synced: results.syncedProducts,
        errors_count: results.failedProducts,
      });

      Logger.info("Catalog sync completed", { businessId, results });

      return {
        success: true,
        syncedProducts: results.syncedProducts,
        failedProducts: results.failedProducts,
        errors: results.errors,
      };
    } catch (error) {
      Logger.error("Catalog sync failed", error, { businessId, syncType });
      throw new HttpsError("internal", "Sync failed", (error as Error).message);
    }
  }

  static async updateProductOption(
    productOptionId: string,
    businessId: string,
    userId: string,
    updateFields: string[]
  ): Promise<BaseResponse> {
    try {
      await AuthService.validateBusinessAccess(userId, businessId);

      const whatsappConfig = await WhatsAppService.getConfig(businessId);
      const productOptionDoc = await this.db
        .collection("product_options")
        .doc(productOptionId)
        .get();

      if (!productOptionDoc.exists) {
        throw new HttpsError("not-found", "Product option not found");
      }

      const productOption = productOptionDoc.data() as ProductOption;

      // Verify the product option belongs to a product owned by the business
      const productDoc = await this.db
        .collection("products")
        .doc(productOption.product_id)
        .get();

      if (
        !productDoc.exists ||
        (productDoc.data() as Product).business_id !== businessId
      ) {
        throw new HttpsError("not-found", "Product option not found");
      }

      // Build WhatsApp update payload
      const updatePayload = await this.buildProductOptionPayload(
        productOption,
        productOptionId,
        updateFields
      );

      // Update in WhatsApp
      await WhatsAppService.updateCatalogProducts(whatsappConfig, [
        updatePayload,
      ]);

      // Update local status
      await productOptionDoc.ref.update({
        sync_status: "synced",
        sync_error: null,
        last_synced: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      });

      Logger.info("Product option updated successfully", {
        productOptionId,
        updateFields,
      });

      return {
        success: true,
        message: "Product option updated successfully",
      };
    } catch (error) {
      Logger.error("Product option update failed", error, { productOptionId });

      // Update error status
      await this.db
        .collection("product_options")
        .doc(productOptionId)
        .update({
          sync_status: "error",
          sync_error: (error as Error).message,
          last_synced: FieldValue.serverTimestamp(),
        });

      throw new HttpsError(
        "internal",
        "Update failed",
        (error as Error).message
      );
    }
  }

  static async updateProduct(
    productId: string,
    businessId: string,
    userId: string,
    updateFields: string[]
  ): Promise<BaseResponse> {
    try {
      await AuthService.validateBusinessAccess(userId, businessId);

      const whatsappConfig = await WhatsAppService.getConfig(businessId);
      const productDoc = await this.db
        .collection("products")
        .doc(productId)
        .get();

      if (!productDoc.exists) {
        throw new HttpsError("not-found", "Product not found");
      }

      const product = productDoc.data() as Product;

      // Build WhatsApp update payload
      const updatePayload = await this.buildProductPayload(
        product,
        productId,
        updateFields
      );

      // Update in WhatsApp
      await WhatsAppService.updateCatalogProducts(whatsappConfig, [
        updatePayload,
      ]);

      // Update local status
      await productDoc.ref.update({
        sync_status: "synced",
        sync_error: null,
        last_synced: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      });

      Logger.info("Product updated successfully", { productId, updateFields });

      return {
        success: true,
        message: "Product updated successfully",
      };
    } catch (error) {
      Logger.error("Product update failed", error, { productId });

      // Update error status
      await this.db
        .collection("products")
        .doc(productId)
        .update({
          sync_status: "error",
          sync_error: (error as Error).message,
          last_synced: FieldValue.serverTimestamp(),
        });

      throw new HttpsError(
        "internal",
        "Update failed",
        (error as Error).message
      );
    }
  }

  static async syncInventory(
    request: SyncInventoryRequest,
    userId: string
  ): Promise<BaseResponse> {
    const { businessId, productIds, updatePrices } = request;

    try {
      await AuthService.validateBusinessAccess(userId, businessId);

      const whatsappConfig = await WhatsAppService.getConfig(businessId);

      // Get product options to update
      const productOptions = await this.getProductOptionsToSync(
        businessId,
        "full",
        productIds
      );

      const updates = [];
      for (const productOption of productOptions) {
        const updateFields = ["availability"];
        if (updatePrices) {
          updateFields.push("price");
        }

        const payload = await this.buildProductOptionPayload(
          productOption,
          productOption.id,
          updateFields
        );
        updates.push(payload);
      }

      // Update in WhatsApp
      if (updates.length > 0) {
        await WhatsAppService.updateCatalogProducts(whatsappConfig, updates);
      }

      Logger.info("Inventory sync completed", {
        businessId,
        updatedCount: updates.length,
      });

      return {
        success: true,
        message: `Updated ${updates.length} products`,
      };
    } catch (error) {
      Logger.error("Inventory sync failed", error, { businessId });
      throw new HttpsError(
        "internal",
        "Inventory sync failed",
        (error as Error).message
      );
    }
  }

  private static async getProductOptionsToSync(
    businessId: string,
    syncType: "full" | "incremental" | "specific",
    productIds?: string[],
    productOptionIds?: string[]
  ): Promise<ProductOption[]> {
    // If specific product option IDs are provided, fetch directly by IDs first
    if (productOptionIds && productOptionIds.length > 0) {
      const optionIdChunks = Helpers.chunkArray(productOptionIds, 30);
      const collectedById: Record<string, ProductOption> = {};
      for (const idChunk of optionIdChunks) {
        const docSnaps = await Promise.all(
          idChunk.map((id) =>
            this.db.collection("product_options").doc(id).get()
          )
        );
        for (const doc of docSnaps) {
          if (!doc.exists) continue;
          const data = doc.data() as any;
          // If incremental, include only pending/error
          if (
            syncType !== "incremental" ||
            data?.sync_status === "pending" ||
            data?.sync_status === "error"
          ) {
            collectedById[doc.id] = {
              id: doc.id,
              ...data,
            } as ProductOption;
          }
        }
      }
      return Object.values(collectedById);
    }
    // First get products for the business to get their IDs
    const productsQuery = this.db
      .collection("products")
      .where("business_id", "==", businessId);

    const productsSnapshot = await productsQuery.get();
    const productIdsForBusiness = productsSnapshot.docs.map((doc) => doc.id);

    if (productIdsForBusiness.length === 0) {
      return [];
    }

    // Determine target product IDs (business-wide or specific subset)
    let targetProductIds: string[] = productIdsForBusiness;
    if (syncType === "specific") {
      if (
        (!productIds || productIds.length === 0) &&
        (!productOptionIds || productOptionIds.length === 0)
      ) {
        throw new HttpsError(
          "invalid-argument",
          "Product IDs or Product Option IDs required for specific sync"
        );
      }
      const requestedProductIds = Array.isArray(productIds) ? productIds : [];
      const validProductIds = requestedProductIds.filter((id) =>
        productIdsForBusiness.includes(id)
      );
      if (validProductIds.length === 0) {
        return [];
      }
      targetProductIds = validProductIds;
    }

    // If specific product option IDs are provided, fetch directly by IDs
    if (productOptionIds && productOptionIds.length > 0) {
      const optionIdChunks = Helpers.chunkArray(productOptionIds, 30);
      const collectedById: Record<string, ProductOption> = {};
      for (const idChunk of optionIdChunks) {
        const docSnaps = await Promise.all(
          idChunk.map((id) =>
            this.db.collection("product_options").doc(id).get()
          )
        );
        for (const doc of docSnaps) {
          if (!doc.exists) continue;
          const data = doc.data() as any;
          // If incremental, include only pending/error
          if (
            syncType !== "incremental" ||
            data?.sync_status === "pending" ||
            data?.sync_status === "error"
          ) {
            collectedById[doc.id] = {
              id: doc.id,
              ...data,
            } as ProductOption;
          }
        }
      }
      return Object.values(collectedById);
    }

    // Firestore 'in' supports up to 30 values and only one 'in' per query.
    // Chunk the product IDs and merge results. For incremental, avoid a second 'in'
    // by running separate equality queries for each status.
    const chunks = Helpers.chunkArray(targetProductIds, 30);
    const collected: Record<string, ProductOption> = {};

    for (const chunk of chunks) {
      const base = this.db
        .collection("product_options")
        .where("product_id", "in", chunk);

      if (syncType === "incremental") {
        const pendingSnap = await base
          .where("sync_status", "==", "pending")
          .get();
        const errorSnap = await base.where("sync_status", "==", "error").get();

        for (const doc of [...pendingSnap.docs, ...errorSnap.docs]) {
          collected[doc.id] = {
            id: doc.id,
            ...(doc.data() as any),
          } as ProductOption;
        }
      } else {
        const snap = await base.get();
        for (const doc of snap.docs) {
          collected[doc.id] = {
            id: doc.id,
            ...(doc.data() as any),
          } as ProductOption;
        }
      }
    }

    return Object.values(collected);
  }

  private static async processBatch(
    productOptions: ProductOption[],
    whatsappConfig: any,
    businessId: string
  ): Promise<{ successful: number; failed: number; errors: any[] }> {
    const result = {
      successful: 0,
      failed: 0,
      errors: [] as any[],
    };

    try {
      // Ensure media for all product options
      for (const productOption of productOptions) {
        if (productOption.image_url && !productOption.whatsapp_image_id) {
          await this.ensureProductOptionMedia(
            businessId,
            productOption.id,
            productOption
          );
        }
      }

      // Format product options for WhatsApp (with retailer_id fallback)
      const productNameCache: Record<string, string> = {};
      const formattedProducts = await Promise.all(
        productOptions.map((productOption) =>
          this.formatProductOptionForWhatsApp(
            productOption.id,
            productOption,
            productNameCache
          )
        )
      );

      // Send to WhatsApp
      await WhatsAppService.updateCatalogProducts(
        whatsappConfig,
        formattedProducts
      );

      // Update local status and save generated SKUs
      const batch = this.db.batch();
      productOptions.forEach((productOption, index) => {
        const productOptionRef = this.db
          .collection("product_options")
          .doc(productOption.id);

        const updateData: any = {
          sync_status: "synced",
          sync_error: null,
          last_synced: FieldValue.serverTimestamp(),
        };

        // If no SKU exists, save the generated one
        if (!productOption.sku || productOption.sku.trim().length === 0) {
          const generatedSku = formattedProducts[index].retailer_id;
          updateData.sku = generatedSku;
        }

        batch.update(productOptionRef, updateData);
      });

      await batch.commit();
      result.successful = productOptions.length;
    } catch (error) {
      Logger.error("Batch processing failed", error);

      // Mark all product options in batch as failed
      const batch = this.db.batch();
      productOptions.forEach((productOption) => {
        const productOptionRef = this.db
          .collection("product_options")
          .doc(productOption.id);
        batch.update(productOptionRef, {
          sync_status: "error",
          sync_error: (error as Error).message,
          last_synced: FieldValue.serverTimestamp(),
        });

        result.errors.push({
          productOptionId: productOption.id,
          error: (error as Error).message,
        });
      });

      await batch.commit();
      result.failed = productOptions.length;
    }

    return result;
  }

  private static async ensureProductOptionMedia(
    businessId: string,
    productOptionId: string,
    productOption: any
  ): Promise<void> {
    if (!productOption.whatsapp_image_id && productOption.image_url) {
      try {
        // Optimize and upload image
        const imageBuffer = await MediaService.optimizeImage(
          productOption.image_url,
          "product_option"
        );
        const whatsappConfig = await WhatsAppService.getConfig(businessId);
        const whatsappMediaId = await WhatsAppService.uploadMedia(
          whatsappConfig,
          imageBuffer,
          `${productOptionId}.jpg`
        );

        // Store metadata
        await MediaService.storeMediaMetadata({
          businessId,
          whatsappMediaId,
          originalUrl: productOption.image_url,
          purpose: "product_option",
          referenceId: productOptionId,
          referenceType: "product_options",
          fileSize: imageBuffer.length,
        });

        // Update product option reference
        await this.db
          .collection("product_options")
          .doc(productOptionId)
          .update({
            whatsapp_image_id: whatsappMediaId,
            whatsapp_image_url: `https://scontent.whatsapp.net/v/t61.24694-24/${whatsappMediaId}`,
          });

        productOption.whatsapp_image_id = whatsappMediaId;
      } catch (error) {
        Logger.error("Failed to upload product option media", error, {
          productOptionId,
        });
        // Continue without media
      }
    }
  }

  private static async formatProductOptionForWhatsApp(
    productOptionId: string,
    productOption: any,
    productNameCache: Record<string, string>
  ): Promise<any> {
    // Derive retailer_id: prefer SKU; else productName_optionName with underscores
    let displayName = "";
    const productId: string = productOption.product_id;
    console.log("productId:", productId);
    const productDoc = await this.db
      .collection("products")
      .doc(productId)
      .get();

    let productName = (productDoc.data() as any)?.name || "product";
    console.log("productName:", productName);

    displayName = `${productName}: ${productOption.name || ""}`.trim();

    let retailerId = productOption.sku as string | undefined;
    if (!retailerId || retailerId.trim().length === 0) {
      if (!productName) {
        productNameCache[productId] = productName;
      }
      const optionName = productOption.name || "option";
      const normalized = (productName + "_" + optionName)
        .replace(/\s+/g, "_")
        .replace(/_+/g, "_")
        .toLowerCase();
      retailerId = normalized;
    }

    return {
      id: retailerId,
      retailer_id: retailerId,
      name: displayName,
      description: productOption.description || "",
      price: productOption.price || 0,
      availability:
        (productOption.stock || 0) > 0 ? "in stock" : "out of stock",
      brand: "Default Brand", // You might want to get this from the parent product
      image_url: productOption.whatsapp_image_id
        ? `https://scontent.whatsapp.net/v/t61.24694-24/${productOption.whatsapp_image_id}`
        : productOption.image_url,
      url: `https://yourapp.com/product-options/${productOptionId}`,
      category: "General", // You might want to get this from the parent product
    };
  }

  private static async buildProductOptionPayload(
    productOption: ProductOption,
    productOptionId: string,
    updateFields: string[]
  ): Promise<any> {
    // Derive retailer_id: prefer SKU; else productName_optionName with underscores
    let retailerId = productOption.sku as string | undefined;
    if (!retailerId || retailerId.trim().length === 0) {
      const productDoc = await this.db
        .collection("products")
        .doc(productOption.product_id)
        .get();
      const productName = (productDoc.data() as any)?.name || "product";
      const optionName = productOption.name || "option";
      retailerId = (productName + "_" + optionName)
        .replace(/\s+/g, "_")
        .replace(/_+/g, "_")
        .toLowerCase();
    }
    const payload: any = {
      id: retailerId,
      retailer_id: retailerId,
    };

    if (updateFields.includes("name")) {
      payload.name = productOption.name;
    }

    if (updateFields.includes("price")) {
      payload.price = productOption.price || 0;
    }

    if (updateFields.includes("description")) {
      payload.description = productOption.description || "";
    }

    if (updateFields.includes("availability")) {
      payload.availability =
        productOption.stock > 0 ? "in stock" : "out of stock";
    }

    if (updateFields.includes("image_url") && productOption.whatsapp_image_id) {
      payload.image_url = `https://scontent.whatsapp.net/v/t61.24694-24/${productOption.whatsapp_image_id}`;
    }

    // Add brand (you might want to get this from the parent product)
    payload.brand = "Default Brand";

    return payload;
  }

  private static async buildProductPayload(
    product: Product,
    productId: string,
    updateFields: string[]
  ): Promise<any> {
    // Use retailer_id if present, else fallback to productId
    const retailerId = (product as any).retailer_id || productId;
    const payload: any = {
      id: retailerId,
      retailer_id: retailerId,
    };

    if (updateFields.includes("name")) {
      payload.name = product.name;
    }

    if (updateFields.includes("price")) {
      payload.price = product.price || 0;
    }

    if (updateFields.includes("description")) {
      payload.description = product.description || "";
    }

    if (updateFields.includes("availability")) {
      payload.availability =
        product.stock_quantity > 0 ? "in stock" : "out of stock";
    }

    if (updateFields.includes("image_url") && product.whatsapp_image_id) {
      payload.image_url = `https://scontent.whatsapp.net/v/t61.24694-24/${product.whatsapp_image_id}`;
    }

    // Add brand if available
    if ((product as any).brand) {
      payload.brand = (product as any).brand;
    }

    return payload;
  }
}

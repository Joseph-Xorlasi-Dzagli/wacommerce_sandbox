// functions/src/handlers/product-card-carousel.handler.ts
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import { AuthService } from "../services/auth.service.js";
import { WhatsAppService } from "../services/whatsapp.service.js";
import { Logger } from "../utils/logger.js";
import { Helpers } from "../utils/helpers.js";
import {
  CreateProductCardCarouselRequest,
  DeleteProductCardCarouselRequest,
  GetProductCardCarouselRequest,
} from "../types/requests.js";
import {
  CreateProductCardCarouselResponse,
  DeleteProductCardCarouselResponse,
  GetProductCardCarouselResponse,
} from "../types/responses.js";
import { ProductCardCarouselTemplate } from "../types/entities.js";

export class ProductCardCarouselHandler {
  private static get db() {
    return getFirestore();
  }

  static async createProductCardCarouselTemplate(
    request: CreateProductCardCarouselRequest,
    userId: string
  ): Promise<CreateProductCardCarouselResponse> {
    const {
      businessId,
      templateName,
      productName,
      productCount,
      wabaId,
      accessToken,
    } = request;

    try {
      // Validate request
      await AuthService.validateBusinessAccess(userId, businessId);

      if (!templateName || !productName || !productCount || productCount < 1) {
        throw new HttpsError(
          "invalid-argument",
          "Template name, product name, and product count (minimum 1) are required"
        );
      }

      if (!wabaId || !accessToken) {
        throw new HttpsError(
          "invalid-argument",
          "WABA ID and access token are required"
        );
      }

      Logger.info("Starting product card carousel template creation", {
        businessId,
        templateName,
        productName,
        productCount,
        wabaId,
      });

      // Create the product card carousel template
      const createProductCarouselResponse =
        await WhatsAppService.createProductCardCarouselTemplate(
          wabaId,
          accessToken,
          templateName,
          productName,
          productCount
        );

      const templateId = createProductCarouselResponse.templateId;
      const finalTemplateName = createProductCarouselResponse.templateName;

      // Store template metadata
      const template: ProductCardCarouselTemplate = {
        id: Helpers.generateId(),
        business_id: businessId,
        waba_id: wabaId,
        template_name: finalTemplateName,
        product_name: productName,
        product_count: productCount,
        template_id: templateId,
        status: "pending",
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      };

      await this.db
        .collection("product_card_carousel_templates")
        .doc(template.id)
        .set(template);

      Logger.info("Product card carousel template created successfully", {
        templateId,
        templateName: finalTemplateName,
        productName,
        productCount,
      });

      return {
        success: true,
        templateId,
        templateName: finalTemplateName,
        productName,
        productCount,
        wabaId,
        created_at: template.created_at,
        message: "Product card carousel template created successfully",
      };
    } catch (error) {
      Logger.error("Failed to create product card carousel template", error, {
        businessId,
        templateName,
        productName,
        wabaId,
      });

      throw new HttpsError(
        "internal",
        "Failed to create product card carousel template",
        (error as Error).message
      );
    }
  }

  static async deleteProductCardCarouselTemplate(
    request: DeleteProductCardCarouselRequest,
    userId: string
  ): Promise<DeleteProductCardCarouselResponse> {
    const { businessId, templateName, wabaId, accessToken } = request;

    try {
      // Validate request
      await AuthService.validateBusinessAccess(userId, businessId);

      if (!templateName || !wabaId || !accessToken) {
        throw new HttpsError(
          "invalid-argument",
          "Template name, WABA ID, and access token are required"
        );
      }

      Logger.info("Starting product card carousel template deletion", {
        businessId,
        templateName,
        wabaId,
      });

      // Delete from WhatsApp
      await WhatsAppService.deleteProductCardCarouselTemplate(
        wabaId,
        accessToken,
        templateName
      );

      // Find template by name in database
      const templateQuery = await this.db
        .collection("product_card_carousel_templates")
        .where("business_id", "==", businessId)
        .where("template_name", "==", templateName)
        .get();

      if (!templateQuery.empty) {
        const templateDoc = templateQuery.docs[0];
        const templateData = templateDoc.data();

        // Update template status in database
        await templateDoc.ref.update({
          status: "disabled",
          updated_at: FieldValue.serverTimestamp(),
          deleted_at: FieldValue.serverTimestamp(),
        });

        Logger.info("Product card carousel template deleted successfully", {
          templateId: templateData.template_id,
          templateName,
          wabaId,
        });

        return {
          success: true,
          templateId: templateData.template_id,
          templateName,
          deleted_at: FieldValue.serverTimestamp(),
          message: "Product card carousel template deleted successfully",
        };
      } else {
        // Template not found in database, but deleted from WhatsApp
        Logger.info(
          "Product card carousel template deleted from WhatsApp (not found in database)",
          {
            templateName,
            wabaId,
          }
        );

        return {
          success: true,
          templateName,
          deleted_at: FieldValue.serverTimestamp(),
          message: "Product card carousel template deleted successfully",
        };
      }
    } catch (error) {
      Logger.error("Failed to delete product card carousel template", error, {
        businessId,
        templateName,
        wabaId,
      });

      throw new HttpsError(
        "internal",
        "Failed to delete product card carousel template",
        (error as Error).message
      );
    }
  }

  static async getProductCardCarouselTemplates(
    request: GetProductCardCarouselRequest,
    userId: string
  ): Promise<GetProductCardCarouselResponse> {
    const { businessId, wabaId, accessToken, templateName } = request;

    try {
      // Validate request
      await AuthService.validateBusinessAccess(userId, businessId);

      if (!wabaId || !accessToken) {
        throw new HttpsError(
          "invalid-argument",
          "WABA ID and access token are required"
        );
      }

      Logger.info("Retrieving product card carousel templates", {
        businessId,
        wabaId,
        templateName,
      });

      // Get templates from WhatsApp
      const whatsappTemplates =
        await WhatsAppService.getProductCardCarouselTemplates(
          wabaId,
          accessToken,
          templateName
        );

      // Get local template metadata
      let localTemplates: ProductCardCarouselTemplate[] = [];

      if (templateName) {
        const templateQuery = await this.db
          .collection("product_card_carousel_templates")
          .where("business_id", "==", businessId)
          .where("template_name", "==", templateName)
          .get();

        localTemplates = templateQuery.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as ProductCardCarouselTemplate)
        );
      } else {
        const templateQuery = await this.db
          .collection("product_card_carousel_templates")
          .where("business_id", "==", businessId)
          .orderBy("created_at", "desc")
          .get();

        localTemplates = templateQuery.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as ProductCardCarouselTemplate)
        );
      }

      // Combine WhatsApp and local data
      const templates = whatsappTemplates.map((whatsappTemplate: { id: any; name: any; status: any; created_time: any; modified_time: any; }) => {
        const localTemplate = localTemplates.find(
          (local) => local.template_id === whatsappTemplate.id
        );

        return {
          id: whatsappTemplate.id,
          name: whatsappTemplate.name,
          productName: localTemplate?.product_name || "Unknown",
          productCount: localTemplate?.product_count || 0,
          status: whatsappTemplate.status || localTemplate?.status || "unknown",
          created_at:
            whatsappTemplate.created_time || localTemplate?.created_at,
          updated_at:
            whatsappTemplate.modified_time || localTemplate?.updated_at,
        };
      });

      Logger.info("Product card carousel templates retrieved successfully", {
        businessId,
        wabaId,
        templatesCount: templates.length,
      });

      return {
        success: true,
        templates,
        total: templates.length,
        message: "Product card carousel templates retrieved successfully",
      };
    } catch (error) {
      Logger.error("Failed to get product card carousel templates", error, {
        businessId,
        wabaId,
        templateName,
      });

      throw new HttpsError(
        "internal",
        "Failed to get product card carousel templates",
        (error as Error).message
      );
    }
  }
}

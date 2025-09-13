// functions/src/services/whatsapp.service.ts
import { getFirestore } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import axios from "axios";
import { APP_CONFIG } from "../config/constants";
import { Encryption } from "../utils/encryption";
import { Logger } from "../utils/logger";
import type { WhatsAppConfig } from "../types/entities";

export class WhatsAppService {
  private static get db() {
    return getFirestore();
  }

  // static async getConfig(businessId: string): Promise<WhatsAppConfig> {
  //   const configDoc = await this.db
  //     .collection("whatsapp_configs")
  //     .doc(businessId)
  //     .get();

  //   if (!configDoc.exists || !configDoc.data()?.active) {
  //     throw new HttpsError(
  //       "failed-precondition",
  //       ERROR_CODES.WHATSAPP_NOT_CONFIGURED
  //     );
  //   }

  //   const config = configDoc.data() as WhatsAppConfig;

  //   // Decrypt access token
  //   config.access_token = Encryption.decrypt(config.access_token);

  //   return config;
  // }

  static async sendMessage(
    config: WhatsAppConfig,
    phoneNumber: string,
    message: any
  ): Promise<any> {
    const payload = {
      messaging_product: "whatsapp",
      to: this.formatPhoneNumber(phoneNumber),
      ...message,
    };

    const response = await axios.post(
      `${APP_CONFIG.WHATSAPP.BASE_URL}/${APP_CONFIG.WHATSAPP.API_VERSION}/${config.phone_number_id}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${config.access_token}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    Logger.info("WhatsApp message sent", {
      to: phoneNumber,
      messageId: response.data.messages?.[0]?.id,
    });

    return response.data;
  }

  static async uploadMedia(
    config: WhatsAppConfig,
    imageBuffer: Buffer,
    filename: string
  ): Promise<string> {
    const FormData = require("form-data");
    const form = new FormData();

    form.append("file", imageBuffer, {
      filename,
      contentType: "image/jpeg",
    });
    form.append("type", "image/jpeg");
    form.append("messaging_product", "whatsapp");

    const response = await axios.post(
      `${APP_CONFIG.WHATSAPP.BASE_URL}/${APP_CONFIG.WHATSAPP.API_VERSION}/${config.phone_number_id}/media`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${config.access_token}`,
        },
        timeout: 60000,
        maxContentLength: APP_CONFIG.IMAGE.MAX_SIZE_MB * 1024 * 1024,
      }
    );

    Logger.info("Media uploaded to WhatsApp", {
      mediaId: response.data.id,
      filename,
    });

    return response.data.id;
  }

  static async updateCatalogProducts(
    config: WhatsAppConfig,
    products: any[]
  ): Promise<void> {
    const formattedProducts = products.map((product) => ({
      method: "UPDATE",
      data: {
        id: product.retailer_id || product.id,
        title: product.name,
        description: product.description || "",
        price: `${Math.round(product.price || 0)} GHS`,
        availability: product.availability || "in stock",
        condition: "new",
        brand: product.brand || "Default Brand",
        link: product.url || `https://yourapp.com/products/${product.id}`,
        image: product.image_url
          ? [
              {
                url: product.image_url,
              },
            ]
          : undefined,
      },
    }));

    const payload = {
      requests: formattedProducts,
      item_type: "PRODUCT_ITEM",
    };

    const response = await axios.post(
      `${APP_CONFIG.WHATSAPP.BASE_URL}/${APP_CONFIG.WHATSAPP.API_VERSION}/${config.catalog_id}/items_batch`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${config.access_token}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    // Print the HTTP response from WhatsApp API
    console.log("WhatsApp API response (updateCatalogProducts)", {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers,
    });

    console.log("Catalog batch updated", {
      productsCount: products.length,
      catalogId: config.catalog_id,
    });
  }

  static async deleteCatalogProducts(
    config: WhatsAppConfig,
    productIds: string[]
  ): Promise<void> {
    const payload = {
      requests: productIds.map((productId) => ({
        method: "DELETE",
        data: {
          id: productId,
        },
      })),
      item_type: "PRODUCT_ITEM",
    };

    const response = await axios.post(
      `${APP_CONFIG.WHATSAPP.BASE_URL}/${APP_CONFIG.WHATSAPP.API_VERSION}/${config.catalog_id}/items_batch`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${config.access_token}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    // Print the HTTP response from WhatsApp API
    console.log("WhatsApp API response (deleteCatalogProducts)", {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers,
    });

    Logger.info("Catalog products deleted", {
      deletedCount: productIds.length,
      catalogId: config.catalog_id,
    });
  }

  static async getCatalogProducts(
    config: WhatsAppConfig,
    limit = 100
  ): Promise<any[]> {
    const response = await axios.get(
      `${APP_CONFIG.WHATSAPP.BASE_URL}/${APP_CONFIG.WHATSAPP.API_VERSION}/${config.catalog_id}/products`,
      {
        headers: {
          Authorization: `Bearer ${config.access_token}`,
        },
        params: {
          limit,
        },
        timeout: 30000,
      }
    );

    return response.data.data || [];
  }

  private static formatPhoneNumber(phone: string): string {
    // Remove all non-digits and ensure proper format
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.startsWith("233") ? cleaned : `233${cleaned}`;
  }

  // Add this method to handle development tokens
  static async getConfig(businessId: string): Promise<WhatsAppConfig> {
    const configDoc = await this.db
      .collection("whatsapp_configs")
      .doc(businessId)
      .get();

    if (!configDoc.exists || !configDoc.data()?.active) {
      throw new HttpsError(
        "failed-precondition",
        "WhatsApp not configured for this business"
      );
    }

    const config = configDoc.data() as WhatsAppConfig;

    // Handle development - don't decrypt if token doesn't look encrypted
    try {
      if (
        config.access_token &&
        !config.access_token.startsWith("DEV_UNENCRYPTED:")
      ) {
        config.access_token = Encryption.decrypt(config.access_token);
      } else if (config.access_token?.startsWith("DEV_UNENCRYPTED:")) {
        config.access_token = config.access_token.replace(
          "DEV_UNENCRYPTED:",
          ""
        );
      }
    } catch (error) {
      console.warn("⚠️  Development: Using access token as-is");
      // In development, use the token as-is if decryption fails
    }

    return config;
  }

  static async validateWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): Promise<boolean> {
    const crypto = require("crypto");
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    return signature === `sha256=${expectedSignature}`;
  }

  // New methods for media card carousel templates
  static async createResumableUploadSession(
    accessToken: string,
    fileName: string,
    fileSize: number,
    mimeType: string
  ): Promise<string> {
    try {
      const response = await axios.post(
        `${APP_CONFIG.WHATSAPP.BASE_URL}/${APP_CONFIG.WHATSAPP.API_VERSION}/app/uploads/`,
        null,
        {
          params: {
            file_length: fileSize,
            file_type: mimeType,
            file_name: fileName,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 30000,
        }
      );

      Logger.info("Resumable upload session created", {
        fileName,
        fileSize,
        mimeType,
        sessionId: response.data.id,
      });

      return response.data.id;
    } catch (error) {
      Logger.error("Failed to create resumable upload session", error, {
        fileName,
        fileSize,
        mimeType,
      });
      throw new HttpsError(
        "internal",
        "Failed to create resumable upload session",
        (error as Error).message
      );
    }
  }

  // static async uploadFileData(
  //   uploadSessionId: string,
  //   accessToken: string,
  //   fileBuffer: Buffer,
  //   mimeType: string
  // ): Promise<string> {
  //   try {
  //     const response = await axios.post(uploadSessionId, fileBuffer, {
  //       headers: {
  //         "Content-Type": mimeType,
  //         file_offset: "0",
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //       timeout: 60000,
  //     });

  //     Logger.info("File data uploaded successfully", {
  //       sessionId: uploadSessionId,
  //       fileHandle: response.data.h,
  //     });

  //     return response.data.h;
  //   } catch (error) {
  //     Logger.error("Failed to upload file data", error, {
  //       sessionId: uploadSessionId,
  //     });
  //     throw new HttpsError(
  //       "internal",
  //       "Failed to upload file data",
  //       (error as Error).message
  //     );
  //   }
  // }

  static async uploadFileData(
    uploadSessionId: string,
    accessToken: string,
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<string> {
    try {
      // Construct full Graph API URL
      const uploadUrl = `${APP_CONFIG.WHATSAPP.BASE_URL}/${APP_CONFIG.WHATSAPP.API_VERSION}/${uploadSessionId}`;

      const response = await axios.post(uploadUrl, fileBuffer, {
        headers: {
          "Content-Type": mimeType,
          file_offset: "0",
          Authorization: `OAuth ${accessToken}`, // Use "OAuth" prefix (not Bearer) per Meta docs
        },
        timeout: 60000,
      });

      Logger.info("File data uploaded successfully", {
        sessionId: uploadSessionId,
        fileHandle: response.data.h,
      });

      return response.data.h;
    } catch (error) {
      Logger.error("Failed to upload file data", error, {
        sessionId: uploadSessionId,
      });
      throw new HttpsError(
        "internal",
        "Failed to upload file data",
        (error as Error).message
      );
    }
  }

  // static async createMediaCardCarouselTemplate(
  //   wabaId: string,
  //   accessToken: string,
  //   templateName: string,
  //   imageHandles: string[]
  // ): Promise<string> {
  //   try {

  //     // Replace spaces, :, /, - with _ and convert to lower case for templateName
  //     templateName = templateName.replace(/[ :\/-]/g, "_").toLowerCase();
  //     const templatePayload = {
  //       name: templateName,
  //       language: "en_US",
  //       category: "marketing",
  //       components: [
  //         {
  //           type: "body",
  //           text: "Discover our curated collection of products.\n\nChoose any product to explore and order your preferred options.",
  //         },
  //         {
  //           type: "carousel",
  //           cards: imageHandles.map((handle, index) => ({
  //             components: [
  //               {
  //                 type: "header",
  //                 format: "image",
  //                 example: {
  //                   header_handle: [handle],
  //                 },
  //               },
  //               {
  //                 type: "body",
  //                 text: "Get {{1}} now at just GHS {{2}}!\n\nTap to explore your options",
  //                 example: {
  //                   body_text: [[`Product ${index + 1}`, "10.0"]],
  //                 },
  //               },
  //               {
  //                 type: "buttons",
  //                 buttons: [
  //                   {
  //                     type: "quick_reply",
  //                     text: "View Options",
  //                     payload: `view_options_{{3}}`,
  //                     example: [`product-${index + 1}`],
  //                   },
  //                 ],
  //               },
  //             ],
  //           })),
  //         },
  //       ],
  //     };

  //     const response = await axios.post(
  //       `${APP_CONFIG.WHATSAPP.BASE_URL}/${APP_CONFIG.WHATSAPP.API_VERSION}/${wabaId}/message_templates`,
  //       templatePayload,
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //         timeout: 30000,
  //       }
  //     );

  //     Logger.info("Media card carousel template created", {
  //       wabaId,
  //       templateName,
  //       templateId: response.data.id,
  //       imageHandlesCount: imageHandles.length,
  //     });

  //     return response.data.id;
  //   } catch (error) {
  //     Logger.error("Failed to create media card carousel template", error, {
  //       wabaId,
  //       templateName,
  //       imageHandlesCount: imageHandles.length,
  //     });
  //     throw new HttpsError(
  //       "internal",
  //       "Failed to create media card carousel template",
  //       (error as Error).message
  //     );
  //   }
  // }

  static async createMediaCardCarouselTemplate(
    wabaId: string,
    accessToken: string,
    templateName: string,
    imageHandles: string[]
  ): Promise<{ templateId: string; templateName: string }> {
    // Sanitize template name
    
    let newTemplateName = templateName.replace(/[ :\/-]/g, "_").toLowerCase();
    try {
      const templatePayload = {
        name: newTemplateName,
        language: "en_US",
        category: "marketing",
        components: [
          {
            type: "body",
            text: "Discover our curated collection of {{1}}.\n\nChoose any product to explore and order your preferred options.",
            example: {
              body_text: [["Spice Mixes"]], // placeholder example
            },
          },
          {
            type: "carousel",
            cards: imageHandles.map((handle, index) => ({
              components: [
                {
                  type: "header",
                  format: "image",
                  example: {
                    header_handle: [handle],
                  },
                },
                {
                  type: "body",
                  text: "Get {{1}} now at just GHS {{2}}!\n\nTap to explore your options",
                  example: {
                    body_text: [[`Product ${index + 1}`, "10.0"]],
                  },
                },
                {
                  type: "buttons",
                  buttons: [
                    {
                      type: "quick_reply",
                      text: "View Options",
                    },
                  ],
                },
              ],
            })),
          },
        ],
      };

      const response = await axios.post(
        `${APP_CONFIG.WHATSAPP.BASE_URL}/${APP_CONFIG.WHATSAPP.API_VERSION}/${wabaId}/message_templates`,
        templatePayload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 30000,
        }
      );

      
      Logger.info("Media card carousel template created", {
        wabaId,
        newTemplateName,
        templateId: response.data.id,
        imageHandlesCount: imageHandles.length,
      });

      // To return both values, use an array or an object. For example, as an array:
      // return [response.data.id, newTemplateName];
      // Or, as an object (recommended for clarity):
      return { templateId: response.data.id, templateName: newTemplateName };
    } catch (error) {
      console.error(
        "Response from failed media card carousel template creation:",
        (error as any)?.response
      );
      Logger.error("Failed to create media card carousel template", error, {
        wabaId,
        newTemplateName,
        imageHandlesCount: imageHandles.length,
      });
      throw new HttpsError(
        "internal",
        "Failed to create media card carousel template",
        (error as Error).message
      );
    }
  }

  static async deleteMediaCardCarouselTemplate(
    wabaId: string,
    accessToken: string,
    templateName: string
  ): Promise<void> {
    try {
      await axios.delete(
        `${APP_CONFIG.WHATSAPP.BASE_URL}/${APP_CONFIG.WHATSAPP.API_VERSION}/${wabaId}/message_templates?name=${encodeURIComponent(templateName)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 30000,
        }
      );

      Logger.info("Media card carousel template deleted", {
        wabaId,
        templateName,
      });
    } catch (error) {
      Logger.error("Failed to delete media card carousel template", error, {
        wabaId,
        templateName,
      });
      throw new HttpsError(
        "internal",
        "Failed to delete media card carousel template",
        (error as Error).message
      );
    }
  }

  static async getMediaCardCarouselTemplates(
    wabaId: string,
    accessToken: string,
    templateId?: string
  ): Promise<any[]> {
    try {
      const url = templateId
        ? `${APP_CONFIG.WHATSAPP.BASE_URL}/${APP_CONFIG.WHATSAPP.API_VERSION}/${wabaId}/message_templates/${templateId}`
        : `${APP_CONFIG.WHATSAPP.BASE_URL}/${APP_CONFIG.WHATSAPP.API_VERSION}/${wabaId}/message_templates`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 30000,
      });

      const templates = templateId ? [response.data] : response.data.data || [];

      Logger.info("Media card carousel templates retrieved", {
        wabaId,
        templateId,
        templatesCount: templates.length,
      });

      return templates;
    } catch (error) {
      Logger.error("Failed to get media card carousel templates", error, {
        wabaId,
        templateId,
      });
      throw new HttpsError(
        "internal",
        "Failed to get media card carousel templates",
        (error as Error).message
      );
    }
  }
}

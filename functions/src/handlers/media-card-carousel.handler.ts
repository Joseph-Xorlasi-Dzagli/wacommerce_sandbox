// functions/src/handlers/media-card-carousel.handler.ts
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import { AuthService } from "../services/auth.service";
import { WhatsAppService } from "../services/whatsapp.service";
import { MediaService } from "../services/media.service";
import { Logger } from "../utils/logger";
import { Helpers } from "../utils/helpers";
import {
  CreateMediaCardCarouselRequest,
  DeleteMediaCardCarouselRequest,
  GetMediaCardCarouselRequest,
} from "../types/requests";
import {
  CreateMediaCardCarouselResponse,
  DeleteMediaCardCarouselResponse,
  GetMediaCardCarouselResponse,
} from "../types/responses";
import {
  MediaCardCarouselTemplate,
  ResumableUploadSession,
} from "../types/entities";

export class MediaCardCarouselHandler {
  private static get db() {
    return getFirestore();
  }

  static async createMediaCardCarouselTemplate(
    request: CreateMediaCardCarouselRequest,
    userId: string
  ): Promise<CreateMediaCardCarouselResponse> {
    const { businessId, categoryName, images, wabaId, accessToken } = request;

    try {
      // Validate request
      await AuthService.validateBusinessAccess(userId, businessId);

      if (!categoryName || !images || images.length === 0) {
        throw new HttpsError(
          "invalid-argument",
          "Category name and images are required"
        );
      }

      if (!wabaId || !accessToken) {
        throw new HttpsError(
          "invalid-argument",
          "WABA ID and access token are required"
        );
      }

      Logger.info("Starting media card carousel template creation", {
        businessId,
        categoryName,
        imagesCount: images.length,
        wabaId,
      });

      // Generate template name with date and time
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const timeStr = now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      let templateName = `${categoryName}-${dateStr}-${timeStr}`;

      // Process each image
      const imageHandles: string[] = [];
      const uploadSessions: ResumableUploadSession[] = [];

      for (let i = 0; i < images.length; i++) {
        const image = images[i];

        try {
          // Download and optimize image
          // const imageBuffer = await MediaService.downloadImage(image.url);
          const optimizedBuffer = await MediaService.optimizeImage(
            image.url,
            "carousel"
          );

          // Create resumable upload session
          const uploadSessionId =
            await WhatsAppService.createResumableUploadSession(
              accessToken,
              image.filename,
              optimizedBuffer.length,
              image.mimeType
            );

          // Upload file data
          const fileHandle = await WhatsAppService.uploadFileData(
            uploadSessionId,
            accessToken,
            optimizedBuffer,
            image.mimeType
          );

          imageHandles.push(fileHandle);

          // Store upload session metadata
          const uploadSession: ResumableUploadSession = {
            id: Helpers.generateId(),
            business_id: businessId,
            upload_session_id: uploadSessionId,
            file_name: image.filename,
            file_size: optimizedBuffer.length,
            mime_type: image.mimeType,
            file_handle: fileHandle,
            status: "completed",
            created_at: FieldValue.serverTimestamp(),
            completed_at: FieldValue.serverTimestamp(),
          };

          uploadSessions.push(uploadSession);

          Logger.info("Image processed successfully", {
            imageIndex: i + 1,
            filename: image.filename,
            fileHandle,
          });
        } catch (error) {
          Logger.error("Failed to process image", error, {
            imageIndex: i + 1,
            filename: image.filename,
          });
          throw new HttpsError(
            "internal",
            `Failed to process image ${i + 1}: ${(error as Error).message}`
          );
        }
      }

      // Create the media card carousel template
      const createMediaCarouselResponse =
        await WhatsAppService.createMediaCardCarouselTemplate(
          wabaId,
          accessToken,
          templateName,
          imageHandles
        );

      const templateId = createMediaCarouselResponse.templateId;
      templateName = createMediaCarouselResponse.templateName;

      // Store template metadata
      const template: MediaCardCarouselTemplate = {
        id: Helpers.generateId(),
        business_id: businessId,
        waba_id: wabaId,
        template_name: templateName,
        category_name: categoryName,
        template_id: templateId,
        status: "pending",
        image_handles: imageHandles,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      };

      await this.db
        .collection("media_card_carousel_templates")
        .doc(template.id)
        .set(template);

      // Store upload sessions
      for (const session of uploadSessions) {
        await this.db
          .collection("resumable_upload_sessions")
          .doc(session.id)
          .set(session);
      }

      Logger.info("Media card carousel template created successfully", {
        templateId,
        templateName,
        categoryName,
        imageHandlesCount: imageHandles.length,
      });

      return {
        success: true,
        templateId,
        templateName,
        categoryName,
        imageHandles,
        wabaId,
        created_at: template.created_at,
        message: "Media card carousel template created successfully",
      };
    } catch (error) {
      Logger.error("Failed to create media card carousel template", error, {
        businessId,
        categoryName,
        wabaId,
      });

      throw new HttpsError(
        "internal",
        "Failed to create media card carousel template",
        (error as Error).message
      );
    }
  }

  static async deleteMediaCardCarouselTemplate(
    request: DeleteMediaCardCarouselRequest,
    userId: string
  ): Promise<DeleteMediaCardCarouselResponse> {
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

      Logger.info("Starting media card carousel template deletion", {
        businessId,
        templateName,
        wabaId,
      });

      // Delete from WhatsApp
      await WhatsAppService.deleteMediaCardCarouselTemplate(
        wabaId,
        accessToken,
        templateName
      );

      // // Update template status in database
      // const templateQuery = await this.db
      //   .collection("media_card_carousel_templates")
      //   .where("business_id", "==", businessId)
      //   .where("template_name", "==", templateName)
      //   .get();

      // if (templateQuery.empty) {
      //   throw new HttpsError("not-found", "Template not found");
      // }

      // const templateDoc = templateQuery.docs[0];
      // await templateDoc.ref.update({
      //   status: "disabled",
      //   updated_at: FieldValue.serverTimestamp(),
      //   deleted_at: FieldValue.serverTimestamp(),
      // });

      Logger.info("Media card carousel template deleted successfully", {
        templateName,
        wabaId,
      });

      return {
        success: true,
        templateName,
        deleted_at: FieldValue.serverTimestamp(),
        message: "Media card carousel template deleted successfully",
      };
    } catch (error) {
      Logger.error("Failed to delete media card carousel template", error, {
        businessId,
        templateName,
        wabaId,
      });

      throw new HttpsError(
        "internal",
        "Failed to delete media card carousel template",
        (error as Error).message
      );
    }
  }

  static async getMediaCardCarouselTemplates(
    request: GetMediaCardCarouselRequest,
    userId: string
  ): Promise<GetMediaCardCarouselResponse> {
    const { businessId, wabaId, accessToken, templateId } = request;

    try {
      // Validate request
      await AuthService.validateBusinessAccess(userId, businessId);

      if (!wabaId || !accessToken) {
        throw new HttpsError(
          "invalid-argument",
          "WABA ID and access token are required"
        );
      }

      Logger.info("Retrieving media card carousel templates", {
        businessId,
        wabaId,
        templateId,
      });

      // Get templates from WhatsApp
      const whatsappTemplates =
        await WhatsAppService.getMediaCardCarouselTemplates(
          wabaId,
          accessToken,
          templateId
        );

      // Get local template metadata
      let localTemplates: MediaCardCarouselTemplate[] = [];

      if (templateId) {
        const templateQuery = await this.db
          .collection("media_card_carousel_templates")
          .where("business_id", "==", businessId)
          .where("template_id", "==", templateId)
          .get();

        localTemplates = templateQuery.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as MediaCardCarouselTemplate)
        );
      } else {
        const templateQuery = await this.db
          .collection("media_card_carousel_templates")
          .where("business_id", "==", businessId)
          .orderBy("created_at", "desc")
          .get();

        localTemplates = templateQuery.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as MediaCardCarouselTemplate)
        );
      }

      // Combine WhatsApp and local data
      const templates = whatsappTemplates.map((whatsappTemplate) => {
        const localTemplate = localTemplates.find(
          (local) => local.template_id === whatsappTemplate.id
        );

        return {
          id: whatsappTemplate.id,
          name: whatsappTemplate.name,
          category: localTemplate?.category_name || "Unknown",
          status: whatsappTemplate.status || localTemplate?.status || "unknown",
          created_at:
            whatsappTemplate.created_time || localTemplate?.created_at,
          updated_at:
            whatsappTemplate.modified_time || localTemplate?.updated_at,
        };
      });

      Logger.info("Media card carousel templates retrieved successfully", {
        businessId,
        wabaId,
        templatesCount: templates.length,
      });

      return {
        success: true,
        templates,
        total: templates.length,
        message: "Media card carousel templates retrieved successfully",
      };
    } catch (error) {
      Logger.error("Failed to get media card carousel templates", error, {
        businessId,
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

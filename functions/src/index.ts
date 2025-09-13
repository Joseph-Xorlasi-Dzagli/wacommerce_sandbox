// Fixed index.ts - Replace your functions/src/index.ts with this

import { setGlobalOptions } from "firebase-functions/v2";
import { onCall, onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { CatalogHandler } from "./handlers/catalog.handler";
import { MediaHandler } from "./handlers/media.handler";
import { NotificationHandler } from "./handlers/notification.handler";
import { MediaCardCarouselHandler } from "./handlers/media-card-carousel.handler";
import { APP_CONFIG } from "./config/constants";

// Initialize Firebase Admin
initializeApp();

// Set global options
setGlobalOptions({
  region: "us-central1",
  maxInstances: 10,
});

// Simple test function
export const testFunction = onCall(async (request) => {
  console.log("🧪 Test function called");
  console.log("Request data:", request.data);

  return {
    success: true,
    message: "Test function is working!",
    receivedData: request.data,
    timestamp: new Date().toISOString(),
    auth: request.auth ? { uid: request.auth.uid } : null,
  };
});

// Fixed catalog sync function - no circular JSON logging
export const syncProductCatalog = onCall(
  { memory: "1GiB", timeoutSeconds: 540 },
  async (request) => {
    try {
      console.log("🔄 syncProductCatalog called");

      // Safe logging - only log the data, not the entire request
      console.log("📦 Request data:", request.data);
      console.log("👤 Auth UID:", request.auth?.uid || "none");

      const { data, auth } = request;

      // Validate that we have data
      if (!data) {
        console.error("❌ No data received in request");
        throw new Error(
          "No data provided in request. Please ensure you're passing data to the function."
        );
      }

      // Validate required fields
      if (!data.businessId) {
        throw new Error("businessId is required");
      }

      if (!data.syncType) {
        throw new Error(
          "syncType is required (full, incremental, or specific)"
        );
      }

      // TEMPORARY: Skip auth for local testing
      const userId = auth?.uid || "Sj49CwIhb3YMjEFl0HmgbRRrfNH3";
      console.log("👤 Using userId:", userId);

      if (!userId) {
        throw new Error("Authentication required");
      }

      console.log("🚀 Calling CatalogHandler.syncCatalog...");
      const result = await CatalogHandler.syncCatalog(data, userId);
      console.log("✅ CatalogHandler completed successfully");

      return result;
    } catch (error) {
      console.error("❌ syncProductCatalog error:", error);

      // Return a proper error response instead of throwing
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        details: "Check the function logs for more information",
      };
    }
  }
);

/**
 * Example API call format for updateProductInventory:
 *
 * updateProductInventory({
 *   data: {
 *     productId: "your-product-id",
 *     businessId: "your-business-id",
 *     updateFields: ["quantity", "price"] // array of fields to update
 *   },
 *   auth: {
 *     uid: "user-uid" // (optional, provided automatically if authenticated)
 *   }
 * })
 */
export const updateProductInventory = onCall(
  { memory: "512MiB", timeoutSeconds: 300 },
  async (request) => {
    try {
      // The `auth` object is automatically populated by Firebase when the callable function is invoked
      // from a client SDK that is authenticated. It is available as `request.auth` and contains the user's UID.
      // See: https://firebase.google.com/docs/functions/callable#access_user_information
      console.log("📦 updateProductInventory called");
      console.log("Request data:", request.data);

      const { data, auth } = request;

      if (!data) {
        throw new Error("No data provided in request");
      }

      const userId = auth?.uid || "Sj49CwIhb3YMjEFl0HmgbRRrfNH3";

      if (!userId) {
        throw new Error("Authentication required");
      }

      return await CatalogHandler.updateProduct(
        data.productId,
        data.businessId,
        userId,
        data.updateFields
      );
    } catch (error) {
      console.error("❌ updateProductInventory error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
);

export const updateProductOption = onCall(
  { memory: "512MiB", timeoutSeconds: 300 },
  async (request) => {
    try {
      console.log("📦 updateProductOption called");
      console.log("Request data:", request.data);

      const { data, auth } = request;

      if (!data) {
        throw new Error("No data provided in request");
      }

      const userId = auth?.uid || "Sj49CwIhb3YMjEFl0HmgbRRrfNH3";

      if (!userId) {
        throw new Error("Authentication required");
      }

      return await CatalogHandler.updateProductOption(
        data.productOptionId,
        data.businessId,
        userId,
        data.updateFields
      );
    } catch (error) {
      console.error("❌ updateProductOption error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
);

// Media Management Functions
export const uploadProductMedia = onCall(
  { memory: "1GiB", timeoutSeconds: 300 },
  async (request) => {
    try {
      console.log("📸 uploadProductMedia called");
      console.log("Request data:", request.data);

      const { data, auth } = request;

      if (!data) {
        throw new Error("No data provided in request");
      }

      const userId = auth?.uid || "Sj49CwIhb3YMjEFl0HmgbRRrfNH3";

      if (!userId) {
        throw new Error("Authentication required");
      }

      return await MediaHandler.uploadMedia(data, userId);
    } catch (error) {
      console.error("❌ uploadProductMedia error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
);

export const refreshExpiredMedia = onCall(
  { memory: "512MiB", timeoutSeconds: 540 },
  async (request) => {
    try {
      console.log("🔄 refreshExpiredMedia called");
      console.log("Request data:", request.data);

      const { data, auth } = request;

      if (!data) {
        throw new Error("No data provided in request");
      }

      const userId = auth?.uid || "Sj49CwIhb3YMjEFl0HmgbRRrfNH3";

      if (!userId) {
        throw new Error("Authentication required");
      }

      return await MediaHandler.refreshExpiredMedia(
        data.businessId,
        userId,
        data.bufferDays
      );
    } catch (error) {
      console.error("❌ refreshExpiredMedia error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
);

// Notification Functions
export const sendOrderNotification = onCall(
  { memory: "256MiB", timeoutSeconds: 60 },
  async (request) => {
    try {
      console.log("📨 sendOrderNotification called");
      console.log("Request data:", request.data);

      const { data, auth } = request;

      if (!data) {
        throw new Error("No data provided in request");
      }

      const userId = auth?.uid || "Sj49CwIhb3YMjEFl0HmgbRRrfNH3";

      if (!userId) {
        throw new Error("Authentication required");
      }

      return await NotificationHandler.sendOrderNotification(
        data.orderId,
        data.businessId,
        data.notificationType,
        userId,
        data.customMessage
      );
    } catch (error) {
      console.error("❌ sendOrderNotification error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
);

// Webhook Handler
export const whatsappWebhook = onRequest(
  { memory: "256MiB" },
  async (req, res) => {
    try {
      if (req.method === "GET") {
        // Webhook verification
        const mode = req.query["hub.mode"];
        const token = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];

        console.log("🔍 Webhook verification:", { mode, token, challenge });

        if (
          mode === "subscribe" &&
          token === APP_CONFIG.WHATSAPP.WEBHOOK_VERIFY_TOKEN
        ) {
          console.log("✅ Webhook verified successfully");
          res.status(200).send(challenge);
        } else {
          console.log("❌ Webhook verification failed");
          res.status(403).send("Forbidden");
        }
      } else if (req.method === "POST") {
        // Process webhook data - safe logging
        console.log("📨 Processing webhook data");
        console.log("Body keys:", Object.keys(req.body || {}));

        await NotificationHandler.processWebhook(req.body);
        res.status(200).send("OK");
      } else {
        res.status(405).send("Method not allowed");
      }
    } catch (error) {
      console.error("❌ Webhook processing error:", error);
      res.status(500).send("Error");
    }
  }
);

// Media Card Carousel Template Functions
export const createMediaCardCarouselTemplate = onCall(
  { memory: "1GiB", timeoutSeconds: 540 },
  async (request) => {
    try {
      console.log("🎠 createMediaCardCarouselTemplate called");
      console.log("Request data:", request.data);

      const { data, auth } = request;

      if (!data) {
        throw new Error("No data provided in request");
      }

      const userId = auth?.uid || "Sj49CwIhb3YMjEFl0HmgbRRrfNH3";

      if (!userId) {
        throw new Error("Authentication required");
      }

      return await MediaCardCarouselHandler.createMediaCardCarouselTemplate(
        data,
        userId
      );
    } catch (error) {
      console.error("❌ createMediaCardCarouselTemplate error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
);

export const deleteMediaCardCarouselTemplate = onCall(
  { memory: "512MiB", timeoutSeconds: 300 },
  async (request) => {
    try {
      console.log("🗑️ deleteMediaCardCarouselTemplate called");
      console.log("Request data:", request.data);

      const { data, auth } = request;

      if (!data) {
        throw new Error("No data provided in request");
      }

      const userId = auth?.uid || "Sj49CwIhb3YMjEFl0HmgbRRrfNH3";

      if (!userId) {
        throw new Error("Authentication required");
      }

      return await MediaCardCarouselHandler.deleteMediaCardCarouselTemplate(
        data,
        userId
      );
    } catch (error) {
      console.error("❌ deleteMediaCardCarouselTemplate error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
);

export const getMediaCardCarouselTemplates = onCall(
  { memory: "512MiB", timeoutSeconds: 300 },
  async (request) => {
    try {
      console.log("📋 getMediaCardCarouselTemplates called");
      console.log("Request data:", request.data);

      const { data, auth } = request;

      if (!data) {
        throw new Error("No data provided in request");
      }

      const userId = auth?.uid || "Sj49CwIhb3YMjEFl0HmgbRRrfNH3";

      if (!userId) {
        throw new Error("Authentication required");
      }

      return await MediaCardCarouselHandler.getMediaCardCarouselTemplates(
        data,
        userId
      );
    } catch (error) {
      console.error("❌ getMediaCardCarouselTemplates error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
);

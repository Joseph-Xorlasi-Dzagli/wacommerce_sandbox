// functions/src/index.ts
import { setGlobalOptions } from "firebase-functions/v2";
import { onCall, onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { CatalogHandler } from "./handlers/catalog.handler";
import { MediaHandler } from "./handlers/media.handler";
import { NotificationHandler } from "./handlers/notification.handler";
import { APP_CONFIG } from "./config/constants";

// Initialize Firebase Admin
initializeApp();

// Set global options
setGlobalOptions({
  region: "us-central1",
  maxInstances: 10,
});

// Catalog Management Functions
export const syncProductCatalog = onCall(
  { memory: "1GiB", timeoutSeconds: 540 },
  async (request) => {
    const { data, auth } = request;

    // TEMPORARY: Skip auth for local testing
    const userId = auth?.uid || "Sj49CwIhb3YMjEFl0HmgbRRrfNH3";

    if (!userId) {
      throw new Error("Authentication required");
    }

    return await CatalogHandler.syncCatalog(data, userId);
  }
);

export const updateProductInventory = onCall(
  { memory: "512MiB", timeoutSeconds: 300 },
  async (request) => {
    const { data, auth } = request;

    // TEMPORARY: Skip auth for local testing
    const userId = auth?.uid || "test-user-123";

    if (!userId) {
      throw new Error("Authentication required");
    }

    return await CatalogHandler.updateProduct(
      data.productId,
      data.businessId,
      userId,
      data.updateFields
    );
  }
);

// Media Management Functions
export const uploadProductMedia = onCall(
  { memory: "1GiB", timeoutSeconds: 300 },
  async (request) => {
    const { data, auth } = request;

    // TEMPORARY: Skip auth for local testing
    const userId = auth?.uid || "test-user-123";

    if (!userId) {
      throw new Error("Authentication required");
    }

    return await MediaHandler.uploadMedia(data, userId);
  }
);

export const refreshExpiredMedia = onCall(
  { memory: "512MiB", timeoutSeconds: 540 },
  async (request) => {
    const { data, auth } = request;

    // TEMPORARY: Skip auth for local testing
    const userId = auth?.uid || "test-user-123";

    if (!userId) {
      throw new Error("Authentication required");
    }

    return await MediaHandler.refreshExpiredMedia(
      data.businessId,
      userId,
      data.bufferDays
    );
  }
);

// Notification Functions
export const sendOrderNotification = onCall(
  { memory: "256MiB", timeoutSeconds: 60 },
  async (request) => {
    const { data, auth } = request;

    // TEMPORARY: Skip auth for local testing
    const userId = auth?.uid || "test-user-123";

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
  }
);

// Webhook Handler
export const whatsappWebhook = onRequest(
  { memory: "256MiB" },
  async (req, res) => {
    if (req.method === "GET") {
      // Webhook verification
      const mode = req.query["hub.mode"];
      const token = req.query["hub.verify_token"];
      const challenge = req.query["hub.challenge"];

      if (
        mode === "subscribe" &&
        token === APP_CONFIG.WHATSAPP.WEBHOOK_VERIFY_TOKEN
      ) {
        res.status(200).send(challenge);
      } else {
        res.status(403).send("Forbidden");
      }
    } else if (req.method === "POST") {
      // Process webhook data
      try {
        await NotificationHandler.processWebhook(req.body);
        res.status(200).send("OK");
      } catch (error) {
        console.error("Webhook processing error:", error);
        res.status(500).send("Error");
      }
    } else {
      res.status(405).send("Method not allowed");
    }
  }
);

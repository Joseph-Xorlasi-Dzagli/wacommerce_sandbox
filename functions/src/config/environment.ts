// functions/src/config/environment.ts

import { defineSecret, defineString } from "firebase-functions/params";

// Define parameters - these replace functions.config()
const whatsappWebhookSecret = defineSecret("WHATSAPP_WEBHOOK_SECRET");
const encryptionKey = defineSecret("ENCRYPTION_KEY"); 
const storageBucket = defineString("STORAGE_BUCKET");

export class Environment {
  static get whatsappWebhookSecret(): string {
    return whatsappWebhookSecret.value() || "LetsbuildApsel";
  }

  static get encryptionKey(): string {
    return encryptionKey.value() || "KbcLxS5SnRtLIOhkZdOllTK2enJeLr0tmmkgpxCmkhSJVJFSaOmMoDF8LabZHuob";
  }

  static get storageBucket(): string {
    return storageBucket.value() || "gs://apsel-c9e99.firebasestorage.app";
  }

  static get projectId(): string {
    return process.env.GCLOUD_PROJECT || "apsel-c9e99";
  }

  static get isDevelopment(): boolean {
    return process.env.NODE_ENV !== "production";
  }
}
// config/environment.ts

import * as functions from "firebase-functions";

export class Environment {
  static get whatsappWebhookSecret(): string {
    return functions.config().whatsapp?.webhook_secret || "LetsbuildApsel";
  }

  static get encryptionKey(): string {
    return (
      functions.config().encryption?.key || "KbcLxS5SnRtLIOhkZdOllTK2enJeLr0tmmkgpxCmkhSJVJFSaOmMoDF8LabZHuob"
    );
  }

  static get storageBucket(): string {
    return (
      functions.config().storage?.bucket ||
      "gs://apsel-c9e99.firebasestorage.app"
    );
  }

  static get projectId(): string {
    return process.env.GCLOUD_PROJECT || "apsel-c9e99";
  }

  static get isDevelopment(): boolean {
    return process.env.NODE_ENV !== "production";
  }
}

// functions/src/types/requests.ts

export interface SyncCatalogRequest {
  businessId: string;
  syncType: "full" | "incremental" | "specific";
  productIds?: string[];
  productOptionIds?: string[];
  includeCategories?: boolean;
}

export interface UploadMediaRequest {
  businessId: string;
  imageUrl: string;
  purpose: "product" | "category" | "carousel" | "fallback";
  referenceId: string;
  referenceType: "products" | "categories";
}

export interface SendNotificationRequest {
  businessId: string;
  orderId: string;
  notificationType:
    | "status_change"
    | "payment_received"
    | "shipping_update"
    | "order_confirmed"
    | "order_delivered";
  customMessage?: string;
}

export interface SyncInventoryRequest {
  businessId: string;
  productIds?: string[];
  updatePrices?: boolean;
}

export interface BatchUploadMediaRequest {
  businessId: string;
  productIds?: string[];
}

export interface RefreshMediaRequest {
  businessId: string;
  bufferDays?: number;
}

export interface CleanupMediaRequest {
  businessId: string;
  olderThanDays?: number;
}

export interface BulkNotificationRequest {
  businessId: string;
  orderIds: string[];
  notificationType: string;
  customMessage?: string;
}

export interface GetNotificationHistoryRequest {
  businessId: string;
  orderId?: string;
  limit?: number;
}

export interface GetDeliveryStatsRequest {
  businessId: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}

// New interfaces for media card carousel templates
export interface CreateMediaCardCarouselRequest {
  businessId: string;
  categoryName: string;
  images: Array<{
    url: string;
    filename: string;
    mimeType: string;
  }>;
  wabaId: string;
  accessToken: string;
}

export interface DeleteMediaCardCarouselRequest {
  businessId: string;
  templateName: string;
  wabaId: string;
  accessToken: string;
}

export interface GetMediaCardCarouselRequest {
  businessId: string;
  wabaId: string;
  accessToken: string;
  templateId?: string;
}

// New interfaces for product card carousel templates
export interface CreateProductCardCarouselRequest {
  businessId: string;
  templateName: string;
  productName: string;
  productCount: number; // Number of product cards to create
  wabaId: string;
  accessToken: string;
}

export interface DeleteProductCardCarouselRequest {
  businessId: string;
  templateName: string;
  wabaId: string;
  accessToken: string;
}

export interface GetProductCardCarouselRequest {
  businessId: string;
  wabaId: string;
  accessToken: string;
  templateName?: string;
}

// Response interfaces for better type safety
export interface UploadMediaResponse {
  success: boolean;
  whatsappMediaId?: string;
  mediaDocId?: string;
  message?: string;
  error?: string;
}

export interface SendNotificationResponse {
  success: boolean;
  notificationId?: string;
  messageId?: string;
  message?: string;
  error?: string;
}

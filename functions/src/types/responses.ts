// functions/src/types/responses.ts

export interface BaseResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface SyncCatalogResponse extends BaseResponse {
  syncedProducts: number;
  failedProducts: number;
  errors: Array<{ productId: string; error: string }>;
}

export interface UploadMediaResponse extends BaseResponse {
  whatsappMediaId?: string;
  mediaDocId?: string;
}

export interface SendNotificationResponse extends BaseResponse {
  notificationId?: string;
  messageId?: string;
}

export interface BatchOperationResponse extends BaseResponse {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

export interface MediaStatsResponse extends BaseResponse {
  total: number;
  uploaded: number;
  expired: number;
  failed: number;
  totalSize: number;
  byPurpose: Record<string, number>;
}

export interface DeliveryStatsResponse extends BaseResponse {
  total: number;
  delivered: number;
  failed: number;
  pending: number;
  read: number;
  deliveryRate: number;
  readRate: number;
}

export interface NotificationHistoryResponse extends BaseResponse {
  notifications: Array<{
    id: string;
    orderId: string;
    notificationType: string;
    message: string;
    deliveryStatus: string;
    messageId?: string;
    created_at: any;
    delivered_at?: any;
    read_at?: any;
  }>;
  total: number;
}

// New response interfaces for media card carousel templates
export interface CreateMediaCardCarouselResponse extends BaseResponse {
  templateId?: string;
  templateName?: string;
  categoryName?: string;
  imageHandles?: string[];
  wabaId?: string;
  created_at?: any;
}

export interface DeleteMediaCardCarouselResponse extends BaseResponse {
  templateId?: string;
  templateName?: string;
  deleted_at?: any;
}

export interface GetMediaCardCarouselResponse extends BaseResponse {
  templates?: Array<{
    id: string;
    name: string;
    category: string;
    status: string;
    created_at: any;
    updated_at: any;
  }>;
  total?: number;
}

export interface ResumableUploadResponse extends BaseResponse {
  uploadSessionId?: string;
  fileHandle?: string;
  fileSize?: number;
  mimeType?: string;
}

// New response interfaces for product card carousel templates
export interface CreateProductCardCarouselResponse extends BaseResponse {
  templateId?: string;
  templateName?: string;
  productName?: string;
  productCount?: number;
  wabaId?: string;
  created_at?: any;
}

export interface DeleteProductCardCarouselResponse extends BaseResponse {
  templateId?: string;
  templateName?: string;
  deleted_at?: any;
}

export interface GetProductCardCarouselResponse extends BaseResponse {
  templates?: Array<{
    id: string;
    name: string;
    productName: string;
    productCount: number;
    status: string;
    created_at: any;
    updated_at: any;
  }>;
  total?: number;
}

export interface DeleteProductCardCarouselResponse extends BaseResponse {
  templateId?: string;
  templateName?: string;
  deleted_at?: any;
}

export interface GetProductCardCarouselResponse extends BaseResponse {
  templates?: Array<{
    id: string;
    name: string;
    productName: string;
    productCount: number;
    status: string;
    created_at: any;
    updated_at: any;
  }>;
  total?: number;
}

I'll help you outline all the APIs in this project. Let me start by exploring the codebase to understand the API structure and endpoints.

Search files...
Ran tool
Ran tool
Ran tool
Ran tool
Now let me also check the types and services to get a complete picture of the API structure:

Ran tool
Ran tool
Ran tool
Based on my analysis of the codebase, I can now provide you with a comprehensive outline of all the APIs in this project. This is a Firebase Functions-based WhatsApp Commerce API system.

# API Overview - WhatsApp Commerce System

## **Core API Endpoints**

### **1. Test Function**
- **Endpoint**: `testFunction`
- **Type**: Callable Function
- **Purpose**: Basic testing and health check
- **Request**: Any data object
- **Response**: Success status with received data and timestamp

### **2. Catalog Management APIs**

#### **2.1 Sync Product Catalog**
- **Endpoint**: `syncProductCatalog`
- **Type**: Callable Function
- **Memory**: 1GiB, Timeout: 540s
- **Purpose**: Synchronize product catalog with WhatsApp Business
- **Request**:
  ```typescript
  {
    businessId: string;
    syncType: "full" | "incremental" | "specific";
    productIds?: string[];
    includeCategories?: boolean;
  }
  ```
- **Response**: `SyncCatalogResponse` with sync statistics

#### **2.2 Update Product Inventory**
- **Endpoint**: `updateProductInventory`
- **Type**: Callable Function
- **Memory**: 512MiB, Timeout: 300s
- **Purpose**: Update specific product inventory/fields
- **Request**:
  ```typescript
  {
    productId: string;
    businessId: string;
    updateFields: string[];
  }
  ```
- **Response**: `BaseResponse`

### **3. Media Management APIs**

#### **3.1 Upload Product Media**
- **Endpoint**: `uploadProductMedia`
- **Type**: Callable Function
- **Memory**: 1GiB, Timeout: 300s
- **Purpose**: Upload and optimize media for products
- **Request**:
  ```typescript
  {
    businessId: string;
    imageUrl: string;
    purpose: "product" | "category" | "carousel" | "fallback";
    referenceId: string;
    referenceType: "products" | "categories";
  }
  ```
- **Response**: `UploadMediaResponse`

#### **3.2 Refresh Expired Media**
- **Endpoint**: `refreshExpiredMedia`
- **Type**: Callable Function
- **Memory**: 512MiB, Timeout: 540s
- **Purpose**: Refresh media files that are about to expire
- **Request**:
  ```typescript
  {
    businessId: string;
    bufferDays?: number; // Default: 7
  }
  ```
- **Response**: Batch operation results

### **4. Notification APIs**

#### **4.1 Send Order Notification**
- **Endpoint**: `sendOrderNotification`
- **Type**: Callable Function
- **Memory**: 256MiB, Timeout: 60s
- **Purpose**: Send WhatsApp notifications for order updates
- **Request**:
  ```typescript
  {
    orderId: string;
    businessId: string;
    notificationType: "status_change" | "payment_received" | "shipping_update" | "order_confirmed" | "order_delivered";
    customMessage?: string;
  }
  ```
- **Response**: `SendNotificationResponse`

### **5. Webhook API**

#### **5.1 WhatsApp Webhook**
- **Endpoint**: `whatsappWebhook`
- **Type**: HTTP Request Function
- **Memory**: 256MiB
- **Purpose**: Handle WhatsApp webhook events
- **Methods**:
  - **GET**: Webhook verification
    - Query params: `hub.mode`, `hub.verify_token`, `hub.challenge`
  - **POST**: Process webhook data (message status updates, incoming messages)
- **Response**: 
  - GET: Challenge string (200) or "Forbidden" (403)
  - POST: "OK" (200) or "Error" (500)

## **Handler Classes (Internal APIs)**

### **CatalogHandler**
- `syncCatalog()` - Main catalog synchronization logic
- `updateProduct()` - Update individual product
- `syncInventory()` - Sync inventory levels
- `getProductsToSync()` - Get products based on sync type
- `processBatch()` - Process products in batches
- `ensureProductMedia()` - Ensure media is uploaded for products
- `formatProductForWhatsApp()` - Format product data for WhatsApp API
- `buildProductPayload()` - Build update payload for specific fields

### **MediaHandler**
- `uploadMedia()` - Upload single media file
- `batchUploadMedia()` - Upload media for multiple products
- `refreshExpiredMedia()` - Refresh expiring media files
- `cleanupUnusedMedia()` - Clean up unused media files
- `getMediaStats()` - Get media usage statistics

### **NotificationHandler**
- `sendOrderNotification()` - Send order notifications
- `handleDeliveryStatus()` - Handle message delivery status updates
- `processWebhook()` - Process incoming webhook data
- `processMessageUpdate()` - Process message status updates
- `handleIncomingMessage()` - Store incoming messages
- `buildNotificationMessage()` - Build notification messages
- `getNotificationHistory()` - Get notification history
- `getDeliveryStats()` - Get delivery statistics
- `sendBulkNotifications()` - Send notifications to multiple orders

## **Data Models**

### **Core Entities**
- **Product**: Product information with WhatsApp sync status
- **Order**: Order details with customer information
- **Business**: Business account information
- **WhatsAppConfig**: WhatsApp Business API configuration
- **MediaMetadata**: Media file metadata and status
- **Notification**: Notification records and delivery status
- **AnalyticsEvent**: Analytics tracking events
- **IncomingMessage**: Incoming WhatsApp messages

### **Request/Response Types**
- **SyncCatalogRequest/Response**: Catalog synchronization
- **UploadMediaRequest/Response**: Media upload operations
- **SendNotificationRequest/Response**: Notification sending
- **BatchOperationResponse**: Batch operation results
- **MediaStatsResponse**: Media usage statistics
- **DeliveryStatsResponse**: Message delivery statistics
- **NotificationHistoryResponse**: Notification history

## **Configuration**

### **App Constants**
- **WhatsApp API**: v22.0, rate limits, batch sizes
- **Function Settings**: Memory allocation, timeouts, regions
- **Image Processing**: Size limits, quality settings, format specifications
- **Business Limits**: Max products per catalog, max media files
- **Notification Settings**: Message length limits, retry attempts

### **Error Handling**
- Standardized error codes and messages
- Comprehensive logging with structured data
- Graceful error handling with proper HTTP status codes
- Retry mechanisms for failed operations

## **Authentication & Security**
- Firebase Authentication integration
- Business access validation
- Webhook verification with tokens
- Encrypted sensitive data storage

This API system provides a complete WhatsApp Business integration for e-commerce operations, including product catalog management, media handling, and customer notifications.
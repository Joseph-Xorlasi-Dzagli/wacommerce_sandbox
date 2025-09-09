I'll provide you with comprehensive steps for testing the APIs using the Firebase Functions shell and test calls. Let me first check the existing testing documentation and then provide you with detailed testing steps.

Ran tool
Ran tool
Ran tool
Ran tool
Now I'll create a comprehensive testing guide with step-by-step instructions for testing all the APIs.

Ran tool
# Complete API Testing Guide

## 🚀 Prerequisites & Setup

### 1. Install Dependencies
```bash
cd functions
npm install
```

### 2. Start Firebase Emulator
```bash
# Start all emulators (Functions, Firestore, Auth)
npm run dev

# OR start just the functions emulator
npm run serve
```

### 3. Open Emulator UI (Optional)
- Navigate to: `http://localhost:4000`
- Monitor logs, Firestore data, and function executions

## 🧪 Testing Methods

### Method 1: Interactive Shell Testing (Recommended)

#### Step 1: Start the Shell
```bash
# In a new terminal window
cd functions
npm run shell
```

#### Step 2: Test Individual Functions

**1. Test Basic Function**
```javascript
// Test the basic test function
testFunction({ message: "Hello World" })
```

**2. Test Catalog Sync**
```javascript
// Full catalog sync
syncProductCatalog({"data":{
    "businessId": "R7CeDIFCL3BtQRbPrM1X",
    "syncType": "full"}
})



// Incremental sync (only products that need syncing)
syncProductCatalog({"data":{
    "businessId": "R7CeDIFCL3BtQRbPrM1X",
    "syncType": "incremental"}
})

// Specific products sync
syncProductCatalog({"data":{
    "businessId": "R7CeDIFCL3BtQRbPrM1X",
    "syncType": "specific", 
    "productIds": ["1BenFTOLVciKpCDFM5Rg", "2FNio6EFi6aoPAh45Eeb"]
}
})
How Product IDs Work in Sync Catalog
Table Name: products (Firestore collection)
Looking at the code in catalog.handler.ts, here's how the product ID is determined:
// In formatProductForWhatsApp method (lines 376-377):
const retailerId = (product as any).retailer_id || productId;

// In buildProductPayload method (lines 402-403):
const retailerId = (product as any).retailer_id || productId;
Priority Order:
First Priority: retailer_id field (if present)
Fallback: Document id (Firestore document ID)

syncProductCatalog({"data":{
  businessId: "R7CeDIFCL3BtQRbPrM1X",
  syncType: "specific",
  productIds: ["XBZPOpV8By7KJxnOPves", "10077300928955678"]
}
})
```

**3. Test Product Inventory Update**
```javascript
updateProductInventory({
  productId: "test-product-123",
  businessId: "test-business-123",
  updateFields: ["quantity", "price"]
})
```

**4. Test Media Upload**
```javascript
uploadProductMedia({
  businessId: "test-business-123",
  imageUrl: "https://example.com/image.jpg",
  purpose: "product",
  referenceId: "test-product-123",
  referenceType: "products"
})
```

**5. Test Media Refresh**
```javascript
refreshExpiredMedia({
  businessId: "test-business-123",
  bufferDays: 7
})
```

**6. Test Order Notification**
```javascript
sendOrderNotification({
  orderId: "test-order-123",
  businessId: "test-business-123",
  notificationType: "order_confirmed",
  customMessage: "Your order has been confirmed!"
})
```

#### Step 3: Run Complete Test Suite
Copy and paste this complete test script in the shell:

```javascript
// Complete test suite for Firebase Functions shell
console.log("🧪 Starting Complete API Test Suite...\n");

async function runCompleteTests() {
  try {
    // 1. Test basic function
    console.log("1️⃣ Testing basic function...");
    const testResult = await testFunction({ message: "API Test" });
    console.log("✅ Test function result:", testResult);

    // 2. Test catalog sync
    console.log("\n2️⃣ Testing catalog sync...");
    const syncResult = await syncProductCatalog({
      businessId: "test-business-123",
      syncType: "full"
    });
    console.log("✅ Catalog sync result:", syncResult);

    // 3. Test product update
    console.log("\n3️⃣ Testing product update...");
    const updateResult = await updateProductInventory({
      productId: "test-product-123",
      businessId: "test-business-123",
      updateFields: ["quantity", "price"]
    });
    console.log("✅ Product update result:", updateResult);

    // 4. Test media upload
    console.log("\n4️⃣ Testing media upload...");
    const mediaResult = await uploadProductMedia({
      businessId: "test-business-123",
      imageUrl: "https://picsum.photos/800/800",
      purpose: "product",
      referenceId: "test-product-123",
      referenceType: "products"
    });
    console.log("✅ Media upload result:", mediaResult);

    // 5. Test media refresh
    console.log("\n5️⃣ Testing media refresh...");
    const refreshResult = await refreshExpiredMedia({
      businessId: "test-business-123",
      bufferDays: 7
    });
    console.log("✅ Media refresh result:", refreshResult);

    // 6. Test notification
    console.log("\n6️⃣ Testing order notification...");
    const notificationResult = await sendOrderNotification({
      orderId: "test-order-123",
      businessId: "test-business-123",
      notificationType: "order_confirmed",
      customMessage: "Test notification message"
    });
    console.log("✅ Notification result:", notificationResult);

    console.log("\n🎉 All API tests completed successfully!");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the complete test suite
runCompleteTests();
```

### Method 2: HTTP Testing (Webhook Only)

#### Test Webhook Verification (GET)
```bash
curl "http://localhost:5001/your-project-id/us-central1/whatsappWebhook?hub.mode=subscribe&hub.verify_token=LetsbuildApsel&hub.challenge=test-challenge"
```

#### Test Webhook Processing (POST)
```bash
curl -X POST "http://localhost:5001/your-project-id/us-central1/whatsappWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "test-entry",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "messages": [{
            "from": "1234567890",
            "id": "test-message-id",
            "timestamp": "1234567890",
            "text": {
              "body": "Hello, this is a test message!"
            },
            "type": "text"
          }]
        },
        "field": "messages"
      }]
    }]
  }'
```

### Method 3: Automated Test Scripts

#### Run Test Scripts
```bash
# Get testing examples and commands
node test-functions.js

# Test webhook with HTTP requests
node test-webhook.js
```

## 📊 Realistic Test Data Examples

### Business Data
```javascript
const testBusiness = {
  businessId: "R7CeDIFCL3BtQRbPrM1X", // Use your actual business ID
  name: "Test Business",
  ownerId: "test-user-123"
}
```

### Product Data
```javascript
const testProduct = {
  productId: "prod-123456",
  businessId: "R7CeDIFCL3BtQRbPrM1X",
  name: "Test Product",
  description: "A test product for API testing",
  price: 29.99,
  stockQuantity: 100,
  imageUrl: "https://picsum.photos/800/800",
  categoryName: "Electronics"
}
```

### Order Data
```javascript
const testOrder = {
  orderId: "order-123456",
  businessId: "R7CeDIFCL3BtQRbPrM1X",
  customer: {
    name: "John Doe",
    phone: "+1234567890",
    whatsappNumber: "+1234567890",
    email: "john@example.com"
  },
  status: "confirmed",
  total: 59.98,
  source: "web"
}
```

## 🔧 Advanced Testing Scenarios

### 1. Error Handling Tests
```javascript
// Test with invalid business ID
syncProductCatalog({
  businessId: "invalid-business-id",
  syncType: "full"
})

// Test with missing required fields
updateProductInventory({
  productId: "test-product",
  // Missing businessId and updateFields
})
```

### 2. Batch Operations
```javascript
// Test specific product sync
syncProductCatalog({
  businessId: "test-business-123",
  syncType: "specific",
  productIds: ["prod-1", "prod-2", "prod-3"]
})

// Test media refresh with custom buffer
refreshExpiredMedia({
  businessId: "test-business-123",
  bufferDays: 14
})
```

### 3. Different Notification Types
```javascript
// Test different notification types
const notificationTypes = [
  "status_change",
  "payment_received", 
  "shipping_update",
  "order_confirmed",
  "order_delivered"
];

notificationTypes.forEach(async (type) => {
  await sendOrderNotification({
    orderId: "test-order-123",
    businessId: "test-business-123",
    notificationType: type,
    customMessage: `Test ${type} notification`
  });
});
```

## �� Monitoring & Debugging

### 1. Emulator UI Monitoring
- **URL**: `http://localhost:4000`
- **Functions Tab**: View function logs and execution details
- **Firestore Tab**: Monitor database changes
- **Logs Tab**: Real-time function logs

### 2. Console Logging
All functions include comprehensive logging:
- ✅ Success operations
- ❌ Error conditions
- 📊 Performance metrics
- 🔍 Debug information

### 3. Common Debug Commands
```javascript
// Check function availability
typeof syncProductCatalog

// Test with minimal data
testFunction({})

// Check error handling
syncProductCatalog({}) // Should return error
```

## 🐛 Troubleshooting

### Common Issues & Solutions

**1. Functions not found**
```bash
# Rebuild functions
npm run build
# Restart emulator
npm run dev
```

**2. Authentication errors**
- Functions have temporary auth bypass for testing
- Default user ID: `test-user-123`

**3. Port conflicts**
```bash
# Check if ports are in use
netstat -an | findstr :5001
netstat -an | findstr :4000
```

**4. Dependencies missing**
```bash
npm install
npm run build
```

## 🎯 Testing Checklist

- [ ] Basic test function works
- [ ] Catalog sync (full, incremental, specific)
- [ ] Product inventory updates
- [ ] Media upload and optimization
- [ ] Media refresh for expiring files
- [ ] Order notifications (all types)
- [ ] Webhook verification (GET)
- [ ] Webhook processing (POST)
- [ ] Error handling scenarios
- [ ] Performance with larger datasets

Ran tool
## Quick Start Commands

### 1. Start Testing Environment
```bash
cd functions
npm run dev
```

### 2. Open Shell in New Terminal
```bash
cd functions
npm run shell
```

### 3. Copy-Paste This Quick Test
```javascript
// Quick API test - paste this in the shell
testFunction({ message: "Quick test" })
  .then(result => console.log("✅ Basic test:", result))
  .catch(err => console.error("❌ Error:", err));
```

### 4. Test All APIs
```javascript
// Complete test suite - paste this in the shell
async function quickTest() {
  console.log("🚀 Quick API Test Suite");
  
  // Test each API
  const tests = [
    () => testFunction({ message: "test" }),
    () => syncProductCatalog({ businessId: "test-123", syncType: "full" }),
    () => updateProductInventory({ productId: "test", businessId: "test-123", updateFields: ["quantity"] }),
    () => uploadProductMedia({ businessId: "test-123", imageUrl: "https://picsum.photos/400/400", purpose: "product", referenceId: "test", referenceType: "products" }),
    () => refreshExpiredMedia({ businessId: "test-123", bufferDays: 7 }),
    () => sendOrderNotification({ orderId: "test", businessId: "test-123", notificationType: "order_confirmed" })
  ];
  
  for (let i = 0; i < tests.length; i++) {
    try {
      const result = await tests[i]();
      console.log(`✅ Test ${i + 1} passed:`, result.success !== false ? "SUCCESS" : "FAILED");
    } catch (error) {
      console.log(`❌ Test ${i + 1} failed:`, error.message);
    }
  }
}

quickTest();
```

This comprehensive guide provides everything you need to test all APIs in your WhatsApp Commerce system. The shell-based testing is the most effective method for callable functions, while HTTP testing works best for the webhook endpoint.   
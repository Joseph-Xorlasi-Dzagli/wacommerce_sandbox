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
testFunction({ data: { message: "Hello World" } });
```

**2. Test Catalog Sync**

```javascript
// Full catalog sync
syncProductCatalog({
  data: {
    businessId: "R7CeDIFCL3BtQRbPrM1X",
    syncType: "full",
  },
}),
  // Incremental sync (only products that need syncing)
  syncProductCatalog({
    data: {
      businessId: "R7CeDIFCL3BtQRbPrM1X",
      syncType: "incremental",
    },
  });

// Specific products sync
syncProductCatalog({
  data: {
    businessId: "R7CeDIFCL3BtQRbPrM1X",
    syncType: "specific",
    productIds: ["9674011849346532", "29731645503115608"],
  },
});

syncProductCatalog({
  data: {
    businessId: "R7CeDIFCL3BtQRbPrM1X",
    syncType: "specific",
    productOptionIds: ["8WtheSwdFxvh8e0JwoGo", "JtL9BkQXsYH0rN4eNGUF"],
  },
});
```

**3. Test Media Refresh**

```javascript
refreshExpiredMedia({
  data: {
    businessId: "R7CeDIFCL3BtQRbPrM1X",
    bufferDays: 1,
  },
});
```

**4. Test Media Upload**

```javascript
uploadProductMedia({
  data: {
    businessId: "R7CeDIFCL3BtQRbPrM1X",
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/apsel-c9e99.firebasestorage.app/o/businesses%2FR7CeDIFCL3BtQRbPrM1X%2Fproducts%2Fc0d6e2f4-51ad-4acd-ab04-09d822e09d85.jpg?alt=media&token=10ad6b0c-47c4-48be-9540-bd1e208b70f3",
    purpose: "product",
    referenceId: "1BenFTOLVciKpCDFM5Rg",
    referenceType: "product_options",
  },
});

uploadProductMedia({
  businessId: "R7CeDIFCL3BtQRbPrM1X",
  imageUrl:
    "https://firebasestorage.googleapis.com/v0/b/apsel-c9e99.firebasestorage.app/o/businesses%2FR7CeDIFCL3BtQRbPrM1X%2Fproducts%2Fc0d6e2f4-51ad-4acd-ab04-09d822e09d85.jpg?alt=media&token=10ad6b0c-47c4-48be-9540-bd1e208b70f3",
  purpose: "product",
  referenceId: "test-product-123",
  referenceType: "products",
});
```

**5. Test Order Notification**

```javascript
sendOrderNotification({
  data: {
    orderId: "1N6HMXv8MtgOG2PD7ZSz",
    businessId: "R7CeDIFCL3BtQRbPrM1X",
    notificationType: "order_confirmed",
    customMessage: "Your order has been confirmed!",
  },
});
```

**6. Test Product Inventory Update - updateFields: ["quantity", "price"]**

```javascript
updateProductInventory({
  data: {
    productOptionId: "8WtheSwdFxvh8e0JwoGo",
    businessId: "R7CeDIFCL3BtQRbPrM1X",
    updateFields: ["quantity", "price"],
  },
});

createMediaCardCarouselTemplate({
  data: {
    businessId: "R7CeDIFCL3BtQRbPrM1X",
    categoryName: "spice_mixes",
    images: [
      {
        url: "https://ssl-product-images.www8-hp.com/digmedialib/prodimg/lowres/c08780809.jpg",
        filename: "chicken-mix.jpg",
        mimeType: "image/jpg",
      },
      {
        url: "https://ssl-product-images.www8-hp.com/digmedialib/prodimg/lowres/c08780809.jpg",
        filename: "beef-mix.jpg",
        mimeType: "image/jpg",
      },
      {
        url: "https://ssl-product-images.www8-hp.com/digmedialib/prodimg/lowres/c08780809.jpg",
        filename: "fish-mix.jpg",
        mimeType: "image/jpg",
      },
    ],
    wabaId: "1112335964080498",
    accessToken:
      "EAAUcGmSqAegBPbMjlj0MTMqZBiNsl60EfoTZAyAKLFcrMj0X1tCRNoSfkcnAVrBSAYiw4gIYbTFnqZCUmuvn4QKOSjf034ysvN9ZBzAZB4nszu29FRsSylFi2VnACKb8iFAx0CPGqeAhqrcPfhqGPt4b1z8fs3ZC2lP4cB65TVubql2wP8mKt1mKxWN0dSBQZDZD",
  },
});

deleteMediaCardCarouselTemplate({
  data: {
    businessId: "R7CeDIFCL3BtQRbPrM1X",
    templateName: "spice_mixes_13_09_2025_16_37_47",
    wabaId: "1112335964080498",
    accessToken:
      "EAAUcGmSqAegBPbMjlj0MTMqZBiNsl60EfoTZAyAKLFcrMj0X1tCRNoSfkcnAVrBSAYiw4gIYbTFnqZCUmuvn4QKOSjf034ysvN9ZBzAZB4nszu29FRsSylFi2VnACKb8iFAx0CPGqeAhqrcPfhqGPt4b1z8fs3ZC2lP4cB65TVubql2wP8mKt1mKxWN0dSBQZDZD",
  },
});

createProductCardCarouselTemplate({
  data: {
    businessId: "R7CeDIFCL3BtQRbPrM1X",
    templateName: "browse_product_options_v3",
    productName: "Samsung Galaxy S21",
    productCount: 3, // Number of product cards to create
    wabaId: "1112335964080498",
    accessToken:
      "EAAUcGmSqAegBPbMjlj0MTMqZBiNsl60EfoTZAyAKLFcrMj0X1tCRNoSfkcnAVrBSAYiw4gIYbTFnqZCUmuvn4QKOSjf034ysvN9ZBzAZB4nszu29FRsSylFi2VnACKb8iFAx0CPGqeAhqrcPfhqGPt4b1z8fs3ZC2lP4cB65TVubql2wP8mKt1mKxWN0dSBQZDZD",
  },
});
```

```javascript
// 3. Test product update
console.log("\n3️⃣ Testing product update...");
const updateResult = await updateProductInventory({
  productOptionId: "test-product-option-123",
  businessId: "test-business-123",
  updateFields: ["quantity", "price"],
});
console.log("✅ Product update result:", updateResult);
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
  ownerId: "test-user-123",
};
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
  categoryName: "Electronics",
};
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
    email: "john@example.com",
  },
  status: "confirmed",
  total: 59.98,
  source: "web",
};
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
typeof syncProductCatalog;

// Test with minimal data
testFunction({});

// Check error handling
syncProductCatalog({}); // Should return error
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
  .then((result) => console.log("✅ Basic test:", result))
  .catch((err) => console.error("❌ Error:", err));
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
    () =>
      updateProductInventory({
        productOptionId: "test",
        businessId: "test-123",
        updateFields: ["quantity"],
      }),
    () =>
      uploadProductMedia({
        businessId: "test-123",
        imageUrl: "https://picsum.photos/400/400",
        purpose: "product",
        referenceId: "test",
        referenceType: "products",
      }),
    () => refreshExpiredMedia({ businessId: "test-123", bufferDays: 7 }),
    () =>
      sendOrderNotification({
        orderId: "test",
        businessId: "test-123",
        notificationType: "order_confirmed",
      }),
  ];

  for (let i = 0; i < tests.length; i++) {
    try {
      const result = await tests[i]();
      console.log(
        `✅ Test ${i + 1} passed:`,
        result.success !== false ? "SUCCESS" : "FAILED"
      );
    } catch (error) {
      console.log(`❌ Test ${i + 1} failed:`, error.message);
    }
  }
}

quickTest();
```

This comprehensive guide provides everything you need to test all APIs in your WhatsApp Commerce system. The shell-based testing is the most effective method for callable functions, while HTTP testing works best for the webhook endpoint.

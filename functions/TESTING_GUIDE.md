# Firebase Functions Testing Guide

## 🚀 Quick Start

### 1. Start the Emulator

```bash
cd functions
npm run dev
```

This will:

- Build your TypeScript code
- Start Firebase emulators (Functions, Firestore, Auth, Pub/Sub)
- Enable function debugging

### 2. Alternative Commands

- `npm run serve` - Start without debugging
- `npm run shell` - Interactive shell for testing

## 🧪 Testing Methods

### Method 1: Interactive Shell (Recommended for Callable Functions)

**This is the BEST way to test your functions locally!**

```bash
npm run shell
```

In the shell, you can test functions directly:

**Option A: Copy-paste the test script**

```bash
# Copy the content of test-functions-direct.js and paste it in the shell
```

**Option B: Test functions one by one**

```javascript
// Test syncProductCatalog
syncProductCatalog({
  businessId: "test-business-123",
  catalogUrl: "https://example.com/catalog.xml",
});

syncProductCatalog({
    "businessId": "R7CeDIFCL3BtQRbPrM1X",
    "syncType": "full"
})

syncProductCatalog({"data":{
    "businessId": "R7CeDIFCL3BtQRbPrM1X",
    "syncType": "full"}
})

{
    "data": {
        "productId": 123456,
        "quantity": 100
    }
}
syncProductCatalog({
  businessId: "R7CeDIFCL3BtQRbPrM1X,
  syncType: "full",
  includeCategories: true
})


// Test with your actual business ID from Firestore
syncProductCatalog({
  businessId: "your-actual-business-id", // From your businesses collection
  syncType: "full", // Options: "full", "incremental", "specific"
  productIds: [] // Only needed for "specific" sync type
})

// Test incremental sync (only products that need syncing)
syncProductCatalog({
  businessId: "your-actual-business-id",
  syncType: "incremental"
})

// Test specific products
syncProductCatalog({
  businessId: "your-actual-business-id",
  syncType: "specific",
  productIds: ["product-id-1", "product-id-2"]
})

// testFunction({"data":{ message: "hello world" }, "auth": {"uid": "Sj49CwIhb3YMjEFl0HmgbRRrfNH3"}})

// Test updateProductInventory
updateProductInventory({
  productId: "test-product-123",
  businessId: "test-business-123",
  updateFields: { quantity: 100, price: 29.99 },
});

// Test syncProductCatalog
syncProductCatalog({
  businessId: "test-business-123",
  catalogUrl: "https://example.com/catalog.xml",
});

// Test updateProductInventory
updateProductInventory({
  productId: "test-product-123",
  businessId: "test-business-123",
  updateFields: { quantity: 100, price: 29.99 },
});

// Test uploadProductMedia
uploadProductMedia({
  businessId: "test-business-123",
  productId: "test-product-123",
  mediaUrl: "https://example.com/image.jpg",
});

// Test sendOrderNotification
sendOrderNotification({
  orderId: "test-order-123",
  businessId: "test-business-123",
  notificationType: "order_confirmation",
  customMessage: "Test notification message",
});

```

### Method 2: Test Scripts

Run the provided test scripts:

```bash
# Get testing guide and examples
node test-functions.js

# Test webhook function (HTTP requests)
node test-webhook.js

# For direct function testing, use the emulator shell
# Copy and paste the content of test-functions-direct.js
```

### Method 3: HTTP Testing (for Webhook)

Test your `whatsappWebhook` function directly:

**GET Request (Verification):**

```bash
curl "http://localhost:5001/your-project-id/us-central1/whatsappWebhook?hub.mode=subscribe&hub.verify_token=your-token&hub.challenge=test"
```

**POST Request (Processing):**

```bash
curl -X POST "http://localhost:5001/your-project-id/us-central1/whatsappWebhook" \
  -H "Content-Type: application/json" \
  -d '{"object":"whatsapp_business_account","entry":[{"id":"test","changes":[{"value":{"messaging_product":"whatsapp"},"field":"messages"}]}]}'
```

## 🔧 Configuration

### Update Test Scripts

Before running the test scripts, update these values:

1. **In `test-webhook.js`:**

   - Replace `your-project-id` with your actual Firebase project ID
   - Replace `your-verify-token` with your actual WhatsApp webhook verify token

2. **In `test-functions.js`:**
   - Update test data as needed for your specific use case

### Environment Variables

Make sure your environment variables are set in the emulator:

- WhatsApp webhook verify token
- Any API keys or external service credentials

## 📊 Monitoring & Debugging

### Emulator UI

The emulator provides a web UI at `http://localhost:4000` where you can:

- View function logs
- Monitor Firestore data
- Check authentication status
- View function execution details

### Function Logs

In the emulator shell or UI, you can see:

- Function execution logs
- Error messages
- Performance metrics
- Request/response data

## 🐛 Troubleshooting

### Common Issues

1. **Functions not building:**

   ```bash
   npm run build
   ```

2. **Port conflicts:**

   - Check if ports 5001, 4000, 8080 are available
   - Kill existing processes if needed

3. **Authentication errors:**

   - Your functions have temporary auth bypass for testing
   - Use `test-user-123` as the default user ID

4. **Dependencies missing:**
   ```bash
   npm install
   ```

### Debug Mode

The emulator runs with `--inspect-functions` flag, allowing you to:

- Set breakpoints in VS Code
- Debug function execution step-by-step
- Inspect variables and state

## 📝 Test Data Examples

### Catalog Sync

```javascript
{
  businessId: 'business-123',
  catalogUrl: 'https://api.example.com/products.xml'
}
```

### Product Update

```javascript
{
  productId: 'prod-456',
  businessId: 'business-123',
  updateFields: {
    name: 'Updated Product Name',
    price: 29.99,
    quantity: 100,
    description: 'Updated description'
  }
}
```

### Media Upload

```javascript
{
  businessId: 'business-123',
  productId: 'prod-456',
  mediaUrl: 'https://example.com/image.jpg',
  mediaType: 'image'
}
```

## 🎯 Next Steps

1. **Customize test data** for your specific business logic
2. **Add more test cases** for edge cases and error conditions
3. **Set up automated testing** with Jest or similar frameworks
4. **Test with real external APIs** (update URLs and credentials)
5. **Performance testing** with larger datasets

## 📚 Additional Resources

- [Firebase Emulator Documentation](https://firebase.google.com/docs/emulator-suite)
- [Firebase Functions Testing](https://firebase.google.com/docs/functions/test)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

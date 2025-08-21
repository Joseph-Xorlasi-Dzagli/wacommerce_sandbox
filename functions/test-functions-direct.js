// This script should be run in the Firebase emulator shell environment
// Run: npm run shell, then paste this code

console.log("🧪 Testing Firebase Functions Directly...\n");

// Test data
const testData = {
  syncProductCatalog: {
    businessId: "test-business-123",
    catalogUrl: "https://example.com/catalog.xml",
  },
  updateProductInventory: {
    productId: "test-product-123",
    businessId: "test-business-123",
    updateFields: {
      quantity: 100,
      price: 29.99,
    },
  },
  uploadProductMedia: {
    businessId: "test-business-123",
    productId: "test-product-123",
    mediaUrl: "https://example.com/image.jpg",
  },
  sendOrderNotification: {
    orderId: "test-order-123",
    businessId: "test-business-123",
    notificationType: "order_confirmation",
    customMessage: "Test notification message",
  },
};

// Test functions one by one
async function runTests() {
  try {
    console.log("1. Testing syncProductCatalog...");
    const syncResult = await syncProductCatalog(testData.syncProductCatalog);
    console.log("✅ syncProductCatalog result:", syncResult);

    console.log("\n2. Testing updateProductInventory...");
    const updateResult = await updateProductInventory(
      testData.updateProductInventory
    );
    console.log("✅ updateProductInventory result:", updateResult);

    console.log("\n3. Testing uploadProductMedia...");
    const uploadResult = await uploadProductMedia(testData.uploadProductMedia);
    console.log("✅ uploadProductMedia result:", uploadResult);

    console.log("\n4. Testing sendOrderNotification...");
    const notificationResult = await sendOrderNotification(
      testData.sendOrderNotification
    );
    console.log("✅ sendOrderNotification result:", notificationResult);

    console.log("\n5. Testing refreshExpiredMedia...");
    const refreshResult = await refreshExpiredMedia({
      businessId: "test-business-123",
      bufferDays: 7,
    });
    console.log("✅ refreshExpiredMedia result:", refreshResult);

    console.log("\n🎉 All functions tested successfully!");
  } catch (error) {
    console.error("❌ Error testing functions:", error);
  }
}

// Run the tests
runTests();

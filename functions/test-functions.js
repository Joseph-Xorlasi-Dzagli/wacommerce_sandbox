const { initializeApp } = require("firebase-admin/app");
const { getFunctions } = require("firebase-admin/functions");

// Initialize Firebase Admin
initializeApp();

// Get functions instance
const functions = getFunctions();

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
    businessId: "test-product-123",
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

// Test functions using the emulator
async function testFunctions() {
  console.log("🧪 Testing Firebase Functions...\n");
  console.log("⚠️  Note: This script is for reference only.");
  console.log("   To test functions, use the Firebase emulator shell:\n");
  console.log("   1. Start emulator: npm run dev");
  console.log("   2. Open new terminal and run: npm run shell");
  console.log("   3. Test functions directly in the shell\n");

  console.log("📝 Example function calls for the shell:");
  console.log("----------------------------------------");

  // Show example calls for the shell
  console.log("1. syncProductCatalog:");
  console.log(
    `   syncProductCatalog(${JSON.stringify(
      testData.syncProductCatalog,
      null,
      2
    )})`
  );

  console.log("\n2. updateProductInventory:");
  console.log(
    `   updateProductInventory(${JSON.stringify(
      testData.updateProductInventory,
      null,
      2
    )})`
  );

  console.log("\n3. uploadProductMedia:");
  console.log(
    `   uploadProductMedia(${JSON.stringify(
      testData.uploadProductMedia,
      null,
      2
    )})`
  );

  console.log("\n4. sendOrderNotification:");
  console.log(
    `   sendOrderNotification(${JSON.stringify(
      testData.sendOrderNotification,
      null,
      2
    )})`
  );

  console.log("\n5. refreshExpiredMedia:");
  console.log(`   refreshExpiredMedia({
     businessId: "test-business-123",
     bufferDays: 7
   })`);

  console.log("\n6. whatsappWebhook (test with HTTP requests):");
  console.log(
    "   GET: http://localhost:5001/your-project-id/us-central1/whatsappWebhook?hub.mode=subscribe&hub.verify_token=your-token&hub.challenge=test"
  );
  console.log("   POST: Send webhook data to the same endpoint");

  console.log("\n🎯 Next steps:");
  console.log("   1. Start the emulator with: npm run dev");
  console.log("   2. Open the emulator UI at: http://localhost:4000");
  console.log("   3. Use the shell to test functions interactively");
  console.log("   4. Monitor logs in the emulator UI");
}

// Run the guide
testFunctions();

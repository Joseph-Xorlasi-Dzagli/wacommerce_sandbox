// Test file for Product Card Carousel Template API
// This file demonstrates how to use the new product card carousel template functions

const { initializeApp } = require("firebase/app");
const { getFunctions, httpsCallable } = require("firebase/functions");

// Initialize Firebase (replace with your config)
const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

// Test data
const testData = {
  businessId: "your-business-id",
  templateName: "browse_product_options_v3",
  productName: "Samsung Galaxy S21",
  productCount: 3, // Number of product cards to create
  wabaId: "your-waba-id",
  accessToken: "your-access-token",
};

// Test functions
async function testCreateProductCardCarouselTemplate() {
  console.log("🛍️ Testing createProductCardCarouselTemplate...");

  try {
    const createTemplate = httpsCallable(
      functions,
      "createProductCardCarouselTemplate"
    );
    const result = await createTemplate(testData);

    console.log("✅ Template created successfully:", result.data);
    return result.data;
  } catch (error) {
    console.error("❌ Error creating template:", error);
    throw error;
  }
}

async function testGetProductCardCarouselTemplates() {
  console.log("📋 Testing getProductCardCarouselTemplates...");

  try {
    const getTemplates = httpsCallable(
      functions,
      "getProductCardCarouselTemplates"
    );
    const result = await getTemplates({
      businessId: testData.businessId,
      wabaId: testData.wabaId,
      accessToken: testData.accessToken,
    });

    console.log("✅ Templates retrieved successfully:", result.data);
    return result.data;
  } catch (error) {
    console.error("❌ Error getting templates:", error);
    throw error;
  }
}

async function testDeleteProductCardCarouselTemplate(templateName) {
  console.log("🗑️ Testing deleteProductCardCarouselTemplate...");

  try {
    const deleteTemplate = httpsCallable(
      functions,
      "deleteProductCardCarouselTemplate"
    );
    const result = await deleteTemplate({
      businessId: testData.businessId,
      templateName: templateName,
      wabaId: testData.wabaId,
      accessToken: testData.accessToken,
    });

    console.log("✅ Template deleted successfully:", result.data);
    return result.data;
  } catch (error) {
    console.error("❌ Error deleting template:", error);
    throw error;
  }
}

// Run tests
async function runTests() {
  try {
    console.log("🚀 Starting Product Card Carousel Template API Tests...\n");

    // Test 1: Create template
    const createResult = await testCreateProductCardCarouselTemplate();
    const templateName = createResult.templateName;

    console.log("\n" + "=".repeat(50) + "\n");

    // Test 2: Get templates
    await testGetProductCardCarouselTemplates();

    console.log("\n" + "=".repeat(50) + "\n");

    // Test 3: Delete template (uncomment to test deletion)
    // await testDeleteProductCardCarouselTemplate(templateName);

    console.log("\n✅ All tests completed successfully!");
  } catch (error) {
    console.error("\n❌ Tests failed:", error);
  }
}

// Example usage with different products
async function testMultipleProducts() {
  const products = [
    {
      templateName: "browse_samsung_galaxy_v1",
      productName: "Samsung Galaxy S21",
      productCount: 3,
    },
    {
      templateName: "browse_iphone_v1",
      productName: "iPhone 13 Pro",
      productCount: 2,
    },
    {
      templateName: "browse_laptop_v1",
      productName: "MacBook Pro M2",
      productCount: 4,
    },
  ];

  for (const product of products) {
    console.log(`\n🛍️ Creating template for product: ${product.productName}`);

    try {
      const createTemplate = httpsCallable(
        functions,
        "createProductCardCarouselTemplate"
      );
      const result = await createTemplate({
        ...testData,
        templateName: product.templateName,
        productName: product.productName,
        productCount: product.productCount,
      });

      console.log(
        `✅ Template created for ${product.productName}:`,
        result.data.templateName
      );
    } catch (error) {
      console.error(
        `❌ Error creating template for ${product.productName}:`,
        error
      );
    }
  }
}

// Export functions for use in other files
module.exports = {
  testCreateProductCardCarouselTemplate,
  testGetProductCardCarouselTemplates,
  testDeleteProductCardCarouselTemplate,
  runTests,
  testMultipleProducts,
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

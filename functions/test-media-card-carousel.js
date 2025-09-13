// Test file for Media Card Carousel Template API
// This file demonstrates how to use the new media card carousel template functions

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
  categoryName: "Spice Mixes",
  images: [
    {
      url: "hhttps://ssl-product-images.www8-hp.com/digmedialib/prodimg/lowres/c08780809.jpg",
      filename: "chicken-mix.jpg",
      mimeType: "image/jpeg",
    },
    {
      url: "hhttps://ssl-product-images.www8-hp.com/digmedialib/prodimg/lowres/c08780809.jpg",
      filename: "beef-mix.jpg",
      mimeType: "image/jpeg",
    },
    {
      url: "hhttps://ssl-product-images.www8-hp.com/digmedialib/prodimg/lowres/c08780809.jpg",
      filename: "fish-mix.jpg",
      mimeType: "image/jpeg",
    },
  ],
  wabaId: "your-waba-id",
  accessToken: "your-access-token",
};

// Test functions
async function testCreateMediaCardCarouselTemplate() {
  console.log("🎠 Testing createMediaCardCarouselTemplate...");

  try {
    const createTemplate = httpsCallable(
      functions,
      "createMediaCardCarouselTemplate"
    );
    const result = await createTemplate(testData);

    console.log("✅ Template created successfully:", result.data);
    return result.data;
  } catch (error) {
    console.error("❌ Error creating template:", error);
    throw error;
  }
}

async function testGetMediaCardCarouselTemplates() {
  console.log("📋 Testing getMediaCardCarouselTemplates...");

  try {
    const getTemplates = httpsCallable(
      functions,
      "getMediaCardCarouselTemplates"
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

async function testDeleteMediaCardCarouselTemplate(templateName) {
  console.log("🗑️ Testing deleteMediaCardCarouselTemplate...");

  try {
    const deleteTemplate = httpsCallable(
      functions,
      "deleteMediaCardCarouselTemplate"
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
    console.log("🚀 Starting Media Card Carousel Template API Tests...\n");

    // Test 1: Create template
    const createResult = await testCreateMediaCardCarouselTemplate();
    const templateName = createResult.templateName;

    console.log("\n" + "=".repeat(50) + "\n");

    // Test 2: Get templates
    await testGetMediaCardCarouselTemplates();

    console.log("\n" + "=".repeat(50) + "\n");

    // Test 3: Delete template (uncomment to test deletion)
    // await testDeleteMediaCardCarouselTemplate(templateName);

    console.log("\n✅ All tests completed successfully!");
  } catch (error) {
    console.error("\n❌ Tests failed:", error);
  }
}

// Example usage with different category names
async function testMultipleCategories() {
  const categories = [
    {
      categoryName: "Spice Mixes",
      images: [
        {
          url: "https://example.com/spice1.jpg",
          filename: "spice1.jpg",
          mimeType: "image/jpeg",
        },
        {
          url: "https://example.com/spice2.jpg",
          filename: "spice2.jpg",
          mimeType: "image/jpeg",
        },
      ],
    },
    {
      categoryName: "Beverages",
      images: [
        {
          url: "https://example.com/drink1.jpg",
          filename: "drink1.jpg",
          mimeType: "image/jpeg",
        },
        {
          url: "https://example.com/drink2.jpg",
          filename: "drink2.jpg",
          mimeType: "image/jpeg",
        },
      ],
    },
  ];

  for (const category of categories) {
    console.log(
      `\n🎠 Creating template for category: ${category.categoryName}`
    );

    try {
      const createTemplate = httpsCallable(
        functions,
        "createMediaCardCarouselTemplate"
      );
      const result = await createTemplate({
        ...testData,
        categoryName: category.categoryName,
        images: category.images,
      });

      console.log(
        `✅ Template created for ${category.categoryName}:`,
        result.data.templateName
      );
    } catch (error) {
      console.error(
        `❌ Error creating template for ${category.categoryName}:`,
        error
      );
    }
  }
}

// Export functions for use in other files
module.exports = {
  testCreateMediaCardCarouselTemplate,
  testGetMediaCardCarouselTemplates,
  testDeleteMediaCardCarouselTemplate,
  runTests,
  testMultipleCategories,
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

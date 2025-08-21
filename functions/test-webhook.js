const axios = require("axios");

// Webhook test configuration
const WEBHOOK_URL =
  "http://localhost:5001/your-project-id/us-central1/whatsappWebhook";
const VERIFY_TOKEN = "your-verify-token"; // Replace with your actual token

// Test webhook verification (GET request)
async function testWebhookVerification() {
  console.log("🧪 Testing Webhook Verification (GET)...");

  try {
    const response = await axios.get(WEBHOOK_URL, {
      params: {
        "hub.mode": "subscribe",
        "hub.verify_token": VERIFY_TOKEN,
        "hub.challenge": "test-challenge-123",
      },
    });

    console.log("✅ Webhook verification successful!");
    console.log("Status:", response.status);
    console.log("Response:", response.data);
  } catch (error) {
    console.error(
      "❌ Webhook verification failed:",
      error.response?.data || error.message
    );
  }
}

// Test webhook processing (POST request)
async function testWebhookProcessing() {
  console.log("\n🧪 Testing Webhook Processing (POST)...");

  const webhookData = {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "test-entry-id",
        changes: [
          {
            value: {
              messaging_product: "whatsapp",
              metadata: {
                display_phone_number: "+1234567890",
                phone_number_id: "test-phone-id",
              },
              contacts: [
                {
                  profile: {
                    name: "Test User",
                  },
                  wa_id: "test-wa-id",
                },
              ],
              messages: [
                {
                  from: "test-wa-id",
                  id: "test-message-id",
                  timestamp: "1234567890",
                  text: {
                    body: "Hello, this is a test message!",
                  },
                  type: "text",
                },
              ],
            },
            field: "messages",
          },
        ],
      },
    ],
  };

  try {
    const response = await axios.post(WEBHOOK_URL, webhookData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Webhook processing successful!");
    console.log("Status:", response.status);
    console.log("Response:", response.data);
  } catch (error) {
    console.error(
      "❌ Webhook processing failed:",
      error.response?.data || error.message
    );
  }
}

// Run webhook tests
async function runWebhookTests() {
  console.log("🚀 Starting Webhook Tests...\n");

  await testWebhookVerification();
  await testWebhookProcessing();

  console.log("\n🎉 Webhook tests completed!");
}

// Run tests
runWebhookTests();

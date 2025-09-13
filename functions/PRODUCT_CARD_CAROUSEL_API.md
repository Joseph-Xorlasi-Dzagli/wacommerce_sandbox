# Product Card Carousel Template API

This API provides functionality to create, manage, and delete WhatsApp Business Account product card carousel messaging templates. These templates allow businesses to showcase product catalogs in a carousel format with product headers and interactive buttons.

## Overview

The Product Card Carousel Template API consists of three main functions:

1. **createProductCardCarouselTemplate** - Creates a new product card carousel template
2. **getProductCardCarouselTemplates** - Retrieves existing templates
3. **deleteProductCardCarouselTemplate** - Deletes a template

## API Functions

### 1. createProductCardCarouselTemplate

Creates a new product card carousel template for showcasing product catalogs.

**Function Name:** `createProductCardCarouselTemplate`

**Parameters:**

```typescript
{
  businessId: string; // Your business ID
  templateName: string; // Template name (will be sanitized)
  productName: string; // Product name for the template
  productCount: number; // Number of product cards to create
  wabaId: string; // WhatsApp Business Account ID
  accessToken: string; // User access token
}
```

**Response:**

```typescript
{
  success: boolean;
  templateId?: string;         // WhatsApp template ID
  templateName?: string;       // Generated template name
  productName?: string;        // Product name
  productCount?: number;       // Number of product cards
  wabaId?: string;            // WABA ID
  created_at?: any;           // Creation timestamp
  message?: string;           // Success message
}
```

**Example Usage:**

```javascript
const createTemplate = httpsCallable(
  functions,
  "createProductCardCarouselTemplate"
);
const result = await createTemplate({
  businessId: "your-business-id",
  templateName: "browse_product_options_v3",
  productName: "Samsung Galaxy S21",
  productCount: 3,
  wabaId: "your-waba-id",
  accessToken: "your-access-token",
});
```

### 2. getProductCardCarouselTemplates

Retrieves existing product card carousel templates.

**Function Name:** `getProductCardCarouselTemplates`

**Parameters:**

```typescript
{
  businessId: string;          // Your business ID
  wabaId: string;              // WhatsApp Business Account ID
  accessToken: string;         // User access token
  templateName?: string;       // Optional: specific template name
}
```

**Response:**

```typescript
{
  success: boolean;
  templates?: Array<{
    id: string;                // Template ID
    name: string;              // Template name
    productName: string;       // Product name
    productCount: number;      // Number of product cards
    status: string;            // Template status
    created_at: any;           // Creation timestamp
    updated_at: any;           // Last update timestamp
  }>;
  total?: number;              // Total number of templates
  message?: string;            // Success message
}
```

**Example Usage:**

```javascript
const getTemplates = httpsCallable(
  functions,
  "getProductCardCarouselTemplates"
);
const result = await getTemplates({
  businessId: "your-business-id",
  wabaId: "your-waba-id",
  accessToken: "your-access-token",
});
```

### 3. deleteProductCardCarouselTemplate

Deletes a product card carousel template.

**Function Name:** `deleteProductCardCarouselTemplate`

**Parameters:**

```typescript
{
  businessId: string; // Your business ID
  templateName: string; // Template name to delete
  wabaId: string; // WhatsApp Business Account ID
  accessToken: string; // User access token
}
```

**Response:**

```typescript
{
  success: boolean;
  templateId?: string;         // Deleted template ID
  templateName?: string;       // Deleted template name
  deleted_at?: any;            // Deletion timestamp
  message?: string;            // Success message
}
```

**Example Usage:**

```javascript
const deleteTemplate = httpsCallable(
  functions,
  "deleteProductCardCarouselTemplate"
);
const result = await deleteTemplate({
  businessId: "your-business-id",
  templateName: "browse_product_options_v3",
  wabaId: "your-waba-id",
  accessToken: "your-access-token",
});
```

## Template Structure

Each product card carousel template includes:

1. **Body Text**: "Browse available options for: \n*{{1}}*.\n\nTap _\"View\"_ to learn more or order your preferred product option"

2. **Carousel Cards**: Each card contains:
   - **Header**: Product format (displays product from catalog)
   - **Button**: "View" button with SPM (Single Product Message) type

## Template Naming Convention

Templates are automatically sanitized by replacing spaces, colons, slashes, and hyphens with underscores and converting to lowercase:

- `browse_product_options_v3` → `browse_product_options_v3`
- `Samsung Galaxy S21` → `samsung_galaxy_s21`

## Product Count

The `productCount` parameter determines how many product cards are created in the carousel. Each card will display a product from the catalog when the template is used.

## Error Handling

All functions include comprehensive error handling:

- **Validation Errors**: Invalid parameters or missing required fields
- **Authentication Errors**: Invalid access tokens or business access
- **WhatsApp API Errors**: Template creation/deletion failures
- **Template Not Found**: When trying to delete non-existent templates

## Rate Limits

- **Template Creation**: 1 template per minute per business
- **Product Count**: Maximum 10 product cards per template
- **Template Name**: Must be unique within the WABA

## Database Collections

The API uses the following Firestore collections:

- `product_card_carousel_templates` - Template metadata

## Testing

Use the provided test file `test-product-card-carousel.js` to test the API:

```bash
cd functions
node test-product-card-carousel.js
```

## Example Workflow

1. **Create Template**: Call `createProductCardCarouselTemplate` with your product details
2. **Monitor Status**: Check template status via `getProductCardCarouselTemplates`
3. **Use Template**: Once approved, use the template in your WhatsApp messages
4. **Clean Up**: Delete unused templates with `deleteProductCardCarouselTemplate`

## Use Cases

- **Product Catalogs**: Showcase multiple product options
- **Category Browsing**: Allow customers to browse different product categories
- **Product Comparison**: Display similar products for comparison
- **Seasonal Collections**: Create templates for seasonal product collections

## Support

For issues or questions regarding the Product Card Carousel Template API, please check the function logs and ensure all required parameters are provided correctly.

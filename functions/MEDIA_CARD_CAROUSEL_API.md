# Media Card Carousel Template API

This API provides functionality to create, manage, and delete WhatsApp Business Account media card carousel messaging templates. The templates allow businesses to showcase multiple products in a carousel format with images, text, and interactive buttons.

## Overview

The Media Card Carousel Template API consists of three main functions:

1. **createMediaCardCarouselTemplate** - Creates a new media card carousel template
2. **getMediaCardCarouselTemplates** - Retrieves existing templates
3. **deleteMediaCardCarouselTemplate** - Deletes a template

## API Functions

### 1. createMediaCardCarouselTemplate

Creates a new media card carousel template with resumable upload for images.

**Function Name:** `createMediaCardCarouselTemplate`

**Parameters:**

```typescript
{
  businessId: string; // Your business ID
  categoryName: string; // Category name for the template
  images: Array<{
    // Array of images to include
    url: string; // Image URL
    filename: string; // Filename for the image
    mimeType: string; // MIME type (e.g., "image/jpeg")
  }>;
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
  categoryName?: string;       // Category name
  imageHandles?: string[];     // File handles for uploaded images
  wabaId?: string;            // WABA ID
  created_at?: any;           // Creation timestamp
  message?: string;           // Success message
}
```

**Example Usage:**

```javascript
const createTemplate = httpsCallable(
  functions,
  "createMediaCardCarouselTemplate"
);
const result = await createTemplate({
  businessId: "your-business-id",
  categoryName: "Spice Mixes",
  images: [
    {
      url: "https://example.com/chicken-mix.jpg",
      filename: "chicken-mix.jpg",
      mimeType: "image/jpeg",
    },
    {
      url: "https://example.com/beef-mix.jpg",
      filename: "beef-mix.jpg",
      mimeType: "image/jpeg",
    },
  ],
  wabaId: "your-waba-id",
  accessToken: "your-access-token",
});
```

### 2. getMediaCardCarouselTemplates

Retrieves existing media card carousel templates.

**Function Name:** `getMediaCardCarouselTemplates`

**Parameters:**

```typescript
{
  businessId: string;          // Your business ID
  wabaId: string;              // WhatsApp Business Account ID
  accessToken: string;         // User access token
  templateId?: string;         // Optional: specific template ID
}
```

**Response:**

```typescript
{
  success: boolean;
  templates?: Array<{
    id: string;                // Template ID
    name: string;              // Template name
    category: string;          // Category name
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
const getTemplates = httpsCallable(functions, "getMediaCardCarouselTemplates");
const result = await getTemplates({
  businessId: "your-business-id",
  wabaId: "your-waba-id",
  accessToken: "your-access-token",
});
```

### 3. deleteMediaCardCarouselTemplate

Deletes a media card carousel template.

**Function Name:** `deleteMediaCardCarouselTemplate`

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
  "deleteMediaCardCarouselTemplate"
);
const result = await deleteTemplate({
  businessId: "your-business-id",
  templateName: "spice_mixes-15-12-2024-14:30:25",
  wabaId: "your-waba-id",
  accessToken: "your-access-token",
});
```

## Template Naming Convention

Templates are automatically named using the following format:

```
{categoryName}-{DD-MM-YYYY}-{HH:MM:SS}
```

For example:

- `Spice Mixes-15-12-2024-14:30:25`
- `Beverages-15-12-2024-14:35:10`

## Template Structure

Each media card carousel template includes:

1. **Body Text**: "Discover our curated collection of products.\n\nChoose any product to explore and order your preferred options."

2. **Carousel Cards**: Each image becomes a card with:
   - **Header**: The uploaded image
   - **Body**: "Get {{1}} now at just GHS {{2}}!\n\nTap to explore your options"
   - **Button**: "View Options" quick reply button

## Image Requirements

- **Format**: JPEG, PNG, WebP
- **Size**: Optimized automatically (max 50MB per image)
- **Dimensions**: Automatically resized for optimal display
- **Quality**: 85% JPEG quality for optimal file size

## Error Handling

All functions include comprehensive error handling:

- **Validation Errors**: Invalid parameters or missing required fields
- **Authentication Errors**: Invalid access tokens or business access
- **Upload Errors**: Failed image downloads or uploads
- **WhatsApp API Errors**: Template creation/deletion failures

## Rate Limits

- **Image Upload**: 5 images per template
- **Template Creation**: 1 template per minute per business
- **File Size**: Maximum 50MB per image

## Database Collections

The API uses the following Firestore collections:

- `media_card_carousel_templates` - Template metadata
- `resumable_upload_sessions` - Upload session tracking

## Testing

Use the provided test file `test-media-card-carousel.js` to test the API:

```bash
cd functions
node test-media-card-carousel.js
```

## Example Workflow

1. **Prepare Images**: Ensure all images are accessible via HTTPS URLs
2. **Create Template**: Call `createMediaCardCarouselTemplate` with your data
3. **Monitor Status**: Check template status via `getMediaCardCarouselTemplates`
4. **Use Template**: Once approved, use the template in your WhatsApp messages
5. **Clean Up**: Delete unused templates with `deleteMediaCardCarouselTemplate`

## Support

For issues or questions regarding the Media Card Carousel Template API, please check the function logs and ensure all required parameters are provided correctly.

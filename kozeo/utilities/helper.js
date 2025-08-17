/**
 * Helper functions for Kozeo application
 */

// AWS S3 Image Upload Helper
import AWS from "aws-sdk";

// Configure AWS SDK
const configureAWS = () => {
  AWS.config.update({
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
    region: process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1",
  });
};

/**
 * Upload image to Amazon S3 bucket and return public URL
 * @param {File} file - The image file to upload
 * @param {string} folder - Optional folder path in S3 bucket (e.g., 'profiles', 'projects')
 * @param {string} bucketName - Optional custom bucket name (uses env var if not provided)
 * @returns {Promise<string>} - Returns the public URL of the uploaded image
 */
export const uploadImageToS3 = async (
  file,
  folder = "images",
  bucketName = null
) => {
  try {
    // Validate input
    debugger
    if (!file) {
      throw new Error("No file provided for upload");
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        "Invalid file type. Please upload a valid image file (JPEG, PNG, GIF, WebP)"
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error(
        "File size too large. Please upload an image smaller than 5MB"
      );
    }

    // Configure AWS
    configureAWS();

    // Create S3 instance
    const s3 = new AWS.S3();

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split(".").pop();
    const fileName = `${folder}/${timestamp}_${randomString}.${fileExtension}`;

    // Set bucket name
    const bucket = bucketName || process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME;

    if (!bucket) {
      throw new Error(
        "S3 bucket name not configured. Please set NEXT_PUBLIC_AWS_S3_BUCKET_NAME in environment variables"
      );
    }

    // Upload parameters
    const uploadParams = {
      Bucket: bucket,
      Key: fileName,
      Body: file,
      ContentType: file.type,
    //   ACL: "public-read", // Make the file publicly accessible
      Metadata: {
        "original-name": file.name,
        "uploaded-by": "kozeo-app",
        "upload-timestamp": timestamp.toString(),
      },
    };

    // Upload to S3
    console.log("Uploading to S3...", fileName);
    const result = await s3.upload(uploadParams).promise();

    // Return the public URL
    const publicUrl = result.Location;
    console.log("Upload successful:", publicUrl);

    return publicUrl;
  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};

/**
 * Delete image from S3 bucket
 * @param {string} imageUrl - The public URL of the image to delete
 * @param {string} bucketName - Optional custom bucket name
 * @returns {Promise<boolean>} - Returns true if deletion was successful
 */
export const deleteImageFromS3 = async (imageUrl, bucketName = null) => {
  try {
    if (!imageUrl) {
      throw new Error("No image URL provided for deletion");
    }

    // Configure AWS
    configureAWS();

    // Create S3 instance
    const s3 = new AWS.S3();

    // Extract key from URL
    const url = new URL(imageUrl);
    const key = url.pathname.substring(1); // Remove leading slash

    // Set bucket name
    const bucket = bucketName || process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME;

    if (!bucket) {
      throw new Error("S3 bucket name not configured");
    }

    // Delete parameters
    const deleteParams = {
      Bucket: bucket,
      Key: key,
    };

    // Delete from S3
    await s3.deleteObject(deleteParams).promise();
    console.log("Image deleted successfully:", key);

    return true;
  } catch (error) {
    console.error("S3 Delete Error:", error);
    throw new Error(`Delete failed: ${error.message}`);
  }
};

/**
 * Get presigned URL for direct upload (for large files or better performance)
 * @param {string} fileName - The name of the file
 * @param {string} fileType - The MIME type of the file
 * @param {string} folder - Optional folder path in S3 bucket
 * @param {number} expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns {Promise<Object>} - Returns presigned URL and key
 */
export const getPresignedUploadUrl = async (
  fileName,
  fileType,
  folder = "images",
  expiresIn = 3600
) => {
  try {
    // Configure AWS
    configureAWS();

    // Create S3 instance
    const s3 = new AWS.S3();

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = fileName.split(".").pop();
    const key = `${folder}/${timestamp}_${randomString}.${fileExtension}`;

    // Set bucket name
    const bucket = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME;

    if (!bucket) {
      throw new Error("S3 bucket name not configured");
    }

    // Presigned URL parameters
    const params = {
      Bucket: bucket,
      Key: key,
      ContentType: fileType,
      ACL: "public-read",
      Expires: expiresIn,
    };

    // Generate presigned URL
    const presignedUrl = await s3.getSignedUrlPromise("putObject", params);
    const publicUrl = `https://${bucket}.s3.amazonaws.com/${key}`;

    return {
      presignedUrl,
      publicUrl,
      key,
    };
  } catch (error) {
    console.error("Presigned URL Error:", error);
    throw new Error(`Presigned URL generation failed: ${error.message}`);
  }
};

/**
 * Validate image file before upload
 * @param {File} file - The file to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export const validateImageFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ],
    minWidth = 0,
    minHeight = 0,
  } = options;

  const errors = [];

  // Check if file exists
  if (!file) {
    errors.push("No file provided");
    return { isValid: false, errors };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`Invalid file type. Allowed types: ${allowedTypes.join(", ")}`);
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    errors.push(`File size too large. Maximum size: ${maxSizeMB}MB`);
  }

  // For dimensions check, you'd need to create an image element and check naturalWidth/naturalHeight
  // This is a basic validation, for complete validation including dimensions,
  // you might want to use a separate function that loads the image

  return {
    isValid: errors.length === 0,
    errors,
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type,
      sizeInMB: (file.size / (1024 * 1024)).toFixed(2),
    },
  };
};

/**
 * Generate optimized filename for S3
 * @param {string} originalName - Original filename
 * @param {string} prefix - Optional prefix for the filename
 * @returns {string} - Optimized filename
 */
export const generateS3Filename = (originalName, prefix = "") => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split(".").pop();
  const baseName = originalName
    .split(".")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-");

  return prefix
    ? `${prefix}_${baseName}_${timestamp}_${randomString}.${extension}`
    : `${baseName}_${timestamp}_${randomString}.${extension}`;
};

/**
 * Identify website domain from various link formats
 * @param {string} link - The URL or link to parse
 * @returns {string|null} - Returns the clean domain name or null if invalid
 */
export const identifyWebsite = (link) => {
  try {
    // Handle empty or null input
    if (!link || typeof link !== 'string') {
      return null;
    }
    
    // Remove leading/trailing whitespace
    link = link.trim();
    
    // If the link doesn't start with http/https, add https://
    if (!link.match(/^https?:\/\//i)) {
      // Handle cases like "www.example.com" or just "example.com"
      link = 'https://' + link;
    }
    
    // Create URL object to parse the link
    const url = new URL(link);
    
    // Extract hostname and remove 'www.' if present
    let hostname = url.hostname.toLowerCase();
    
    // Remove 'www.' prefix if it exists
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }
    
    return hostname;
    
  } catch (error) {
    // If URL parsing fails, try manual extraction
    try {
      // Remove protocol if present
      let cleanLink = link.replace(/^https?:\/\//i, '');
      
      // Remove path, query parameters, and fragments
      cleanLink = cleanLink.split('/')[0];
      cleanLink = cleanLink.split('?')[0];
      cleanLink = cleanLink.split('#')[0];
      
      // Remove port if present
      cleanLink = cleanLink.split(':')[0];
      
      // Remove 'www.' if present
      if (cleanLink.toLowerCase().startsWith('www.')) {
        cleanLink = cleanLink.substring(4);
      }
      
      return cleanLink.toLowerCase();
      
    } catch (fallbackError) {
      console.error('Error parsing link:', fallbackError);
      return null;
    }
  }
};

/**
 * Test function for identifyWebsite with various link formats
 */
// export const testIdentifyWebsite = () => {
//   const testLinks = [
//     'https://www.google.com',
//     'http://facebook.com/user/profile',
//     'www.youtube.com/watch?v=123',
//     'github.com/user/repo',
//     'https://subdomain.example.com/path',
//     'ftp://files.example.org',
//     'https://www.amazon.co.uk/product?id=123',
//     'localhost:3000/app',
//     'https://drive.google.com/file/d/abc123',
//     'twitter.com/username',
//     '  https://www.reddit.com/r/programming  ', // with whitespace
//     'invalid-url',
//     '',
//     null
//   ];
  
//   console.log('Testing website identification:');
//   console.log('================================');
  
//   testLinks.forEach(link => {
//     const result = identifyWebsite(link);
//     console.log(`Input: "${link}" -> Website: "${result}"`);
//   });
// };

// Export all functions as default for easy import
export default {
  uploadImageToS3,
  deleteImageFromS3,
  getPresignedUploadUrl,
  validateImageFile,
  generateS3Filename,
  identifyWebsite,
  // testIdentifyWebsite,
};

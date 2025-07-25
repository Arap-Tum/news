const sharp = require('sharp');
const cloudinary = require('../config/cloudinary.js');

const processImage = async (buffer, options = {}) => {
    try {
        const {
            width = 800,
             height = 600, 
             format = 'jpg',
             quality = 80, 
             maxFileSize = 150  * 1024, 
            } = options;

            let processedBuffer = await sharp(buffer)
            .resize(width, height, {
                fit: 'cover',
                position: 'center'
            })
            .toFormat(format, { quality })
            .toBuffer();

     let currentQuality = quality;
     while (processedBuffer.length > maxFileSize && currentQuality > 20) {
        currentQuality -= 10;
        processedBuffer = await sharp(buffer)
            .resize(width, height, {
                fit: 'cover',
                position: 'center'
            })
            .toFormat(format, { quality: currentQuality })
            .toBuffer();

        if (processedBuffer.length <= maxFileSize) {
            return processedBuffer;
        }
    }

    console.log(
      `🖼️  Image processed: ${(buffer.length / 1024).toFixed(2)}KB → ${(
        processedBuffer.length / 1024
      ).toFixed(2)}KB`
    );  

    return {
        buffer: processedBuffer,
        size: processedBuffer.length,
        quality: currentQuality,
        dimensions: {
            width: width,
            height: height
        },
    }

} catch (error) {
    console.error("❌ Error processing image:", error);
    throw new Error('Image processing failed');
    }
};

const uploadImageToCloudinary = async (buffer, options = {}) => {
  const defaultOptions = {
    folder: 'news',
    resource_type: 'image',
    format: 'jpg',
    transformation: [{ width: 800, height: 600, crop: 'fill' }],
  };

  const finalOptions = { ...defaultOptions, ...options };

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(finalOptions, (error, result) => {
      if (error) {
        console.error("❌ Cloudinary upload error:", error);
        return reject(new Error('Image upload failed'));
      } else {
        console.log("✅ Uploaded to Cloudinary:", result.public_id);
        resolve(result);
      }
    });

    uploadStream.end(buffer);
  });
};


const deleteImageFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result === 'ok') {
            console.log("✅ Image deleted from Cloudinary:", publicId);
            return true;
        } else {
            console.error("❌ Failed to delete image from Cloudinary:", result);
            return false;
        }
    } catch (error) {
        console.error("❌ Error deleting image from Cloudinary:", error);
        throw new Error('Image deletion failed');
    }
};

//Extract public ID from URL
const extractPublicId = (url) => {
  try {
    const fileName = path.basename(url); // requires: const path = require('path');
    return fileName.split('.')[0];
  } catch (error) {
    console.error("❌ Error extracting public ID from URL:", error);
    throw new Error('Public ID extraction failed');
  }
}


module.exports = {
    processImage, uploadImageToCloudinary, extractPublicId, deleteImageFromCloudinary
}
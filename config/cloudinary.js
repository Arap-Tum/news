const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
dotenv.config();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const verifyCloudinaryConfig = () => {
    const { cloud_name, api_key, api_secret } = cloudinary.config();
    if (!cloud_name || !api_key || !api_secret) {
        throw new Error('Cloudinary configuration is missing');
    }
    console.log('✅ Cloudinary configuration is valid');
    return true;

};


verifyCloudinaryConfig();
module.exports = cloudinary;

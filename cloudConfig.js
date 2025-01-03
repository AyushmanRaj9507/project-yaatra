const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer'); // Import multer

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

// Set a storage object with your Cloudinary settings
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'YAATRA_DEV',
        allowedFormats: ["png", "jpg", "jpeg"],
    },
});
module.exports = {
    cloudinary,
    storage,
};
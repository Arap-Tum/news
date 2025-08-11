const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage(); // Use memory storage for image processing

const upload = multer({
  storage: storage,
  // limits: {
  //   fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
  // },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/; // Allowed file types
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Error: File upload only supports the following filetypes - " + filetypes));
    }
  },
});

module.exports = upload;



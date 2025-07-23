const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });
module.exports = upload;
// This middleware handles file uploads and saves them to the "uploads" directory
// with a unique filename based on the current timestamp and a random number.
// The uploaded files can be accessed via the "uploads" directory in the project root.
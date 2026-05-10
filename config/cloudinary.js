const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Original filename without extension
    const originalName = path.parse(file.originalname).name;

    return {
      folder: 'ats_documents',
      resource_type: 'raw',
      allowed_formats: ['pdf', 'doc', 'docx'],

      // Preserve readable filename
      public_id: `${Date.now()}-${originalName}`,

      // Keep original filename in download
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    };
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOC/DOCX files are allowed'), false);
    }
  },
});

module.exports = { cloudinary, upload };
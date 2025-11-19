const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define allowed extensions for different file types
const FILE_TYPE_CONSTRAINTS = {
  house_plans: ['.pdf', '.dwg', '.dwf', '.dws', '.zip'],
  house_photos: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  license_documents: ['.pdf'],
  licence_files: ['.pdf'], // Support old field name
  house_info_documents: ['.pdf', '.doc', '.docx', '.txt']
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Handle filename encoding
    let originalname;
    try {
      originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
    } catch (error) {
      originalname = file.originalname;
    }

    // Sanitize filename
    const sanitizedName = originalname.replace(/[\0\/\\:*?"<>|]/g, '_');
    
    // Add timestamp to prevent conflicts
    cb(null, `${Date.now()}-${sanitizedName}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 1000 * 1024 * 1024, // 1000MB
    fieldSize: 1000 * 1024 * 1024,
    files: 10
  },
  fileFilter: (req, file, cb) => {
    // Get file field name
    const fieldname = file.fieldname;
    const allowedExtensions = [
        '.pdf', '.dwf', '.dws', '.dwg', '.zip',
        '.jpg', '.jpeg', '.png', '.gif', '.webp',
        '.pdf',
        '.docx', '.doc', '.txt', 'pdf'
    ];
    // Check if field name is valid
    if (!FILE_TYPE_CONSTRAINTS[fieldname]) {
      return cb(new Error(`Unknown file category: ${fieldname}`));
    }
    
    // Get allowed extensions
   
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Validate extension
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type for ${fieldname}. Only ${allowedExtensions.join(', ')} files are allowed.`));
    }
  }
});

module.exports = upload;
const multer = require('multer');

// Store files in system temp directory temporarily before Cloudinary upload
const storage = multer.diskStorage({});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'managerPhoto' || file.fieldname === 'image' || file.fieldname === 'storeImage' || file.fieldname === 'licenseImage') {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed for photos!'), false);
        }
    } else {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF documents are allowed for legal/bank files!'), false);
        }
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

module.exports = upload;

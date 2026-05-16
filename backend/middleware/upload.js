const multer = require('multer');
const os = require('os');
const path = require('path');
const fs = require('fs');

// Vercel's deployed filesystem is read-only, so use the temp directory there.
const uploadDir = process.env.VERCEL
    ? path.join(os.tmpdir(), 'abheepay-uploads')
    : path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });
upload.uploadDir = uploadDir;

module.exports = upload;

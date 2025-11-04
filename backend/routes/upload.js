// backend/routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');
const Document = require('../models/Document');
const User = require('../models/User');

/* --------------------------------------------------------------
   Shared disk storage – all uploads go to the same folder
   -------------------------------------------------------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const prefix = file.fieldname === 'cv' ? 'cv-' : 'doc-';
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
  },
});

/* --------------------------------------------------------------
   Multer instances – each route gets its own rules
   -------------------------------------------------------------- */

/* 1. CV – PDF/DOC/DOCX only, 5 MB */
const cvUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.pdf', '.doc', '.docx'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed for CV'));
    }
  },
});

/* 2. Generic document – PDF/DOC/DOCX only, 10 MB */
const docUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.pdf', '.doc', '.docx'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed for documents'));
    }
  },
});

/* 3. Image (logo / avatar) – JPG/JPEG/PNG/WEBP, 2 MB */
const imageUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, JPEG, PNG, and WEBP images are allowed'));
    }
  },
});

/* --------------------------------------------------------------
   ROUTES
   -------------------------------------------------------------- */

/* ---------- 1. Upload CV ---------- */
router.post('/cv', authMiddleware, cvUpload.single('cv'), async (req, res) => {
  try {
    console.log('CV upload request from:', req.userId);
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    console.log('CV uploaded:', fileUrl);

    // Save to Document collection
    const document = new Document({
      userId: req.userId,
      name: req.file.originalname,
      url: fileUrl,
      size: req.file.size,
      mimeType: req.file.mimetype,
      filename: req.file.filename,
    });
    await document.save();

    // Update user.cvURL
    await User.findByIdAndUpdate(req.userId, { cvURL: fileUrl });

    res.json({
      message: 'CV uploaded successfully',
      cvURL: fileUrl,
      filename: req.file.filename,
      document: {
        id: document._id,
        name: document.name,
        uri: document.url,
        size: document.size,
        mimeType: document.mimeType,
        uploadedAt: document.uploadedAt,
      },
    });
  } catch (error) {
    console.error('CV Upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload CV' });
  }
});

/* ---------- 2. Upload generic document ---------- */
router.post('/document', authMiddleware, docUpload.single('document'), async (req, res) => {
  try {
    console.log('Document upload request from:', req.userId);
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    console.log('Document uploaded:', fileUrl);

    const document = new Document({
      userId: req.userId,
      name: req.file.originalname,
      url: fileUrl,
      size: req.file.size,
      mimeType: req.file.mimetype,
      filename: req.file.filename,
    });
    await document.save();

    res.json({
      message: 'Document uploaded successfully',
      url: fileUrl,
      filename: req.file.filename,
      document: {
        id: document._id,
        name: document.name,
        uri: document.url,
        size: document.size,
        mimeType: document.mimeType,
        uploadedAt: document.uploadedAt,
      },
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload document' });
  }
});

/* ---------- 3. Upload image (logo, avatar, …) ---------- */
router.post('/image', authMiddleware, imageUpload.single('image'), async (req, res) => {
  try {
    console.log('Image upload request from:', req.userId);
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    console.log('Image uploaded:', fileUrl);

    res.json({
      message: 'Image uploaded successfully',
      imageURL: fileUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload image' });
  }
});

/* ---------- 4. Get all user documents ---------- */
router.get('/documents', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching documents for user:', req.userId);
    const documents = await Document.find({ userId: req.userId }).sort({ uploadedAt: -1 });

    const formattedDocs = documents.map(doc => ({
      id: doc._id,
      name: doc.name,
      uri: doc.url,
      size: doc.size,
      mimeType: doc.mimeType,
      uploadedAt: doc.uploadedAt,
      isUploaded: true,
    }));

    console.log(`Found ${formattedDocs.length} documents`);
    res.json({ documents: formattedDocs });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

/* ---------- 5. Delete document ---------- */
router.delete('/documents/:id', authMiddleware, async (req, res) => {
  try {
    console.log('Deleting document:', req.params.id);
    const document = await Document.findOne({ _id: req.params.id, userId: req.userId });

    if (!document) return res.status(404).json({ error: 'Document not found' });

    // Remove file from disk
    const filePath = path.join(__dirname, '../uploads', document.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('File deleted from filesystem');
    }

    // Remove from DB
    await Document.findByIdAndDelete(req.params.id);

    // If it was the user's CV, clear the reference
    const user = await User.findById(req.userId);
    if (user && user.cvURL === document.url) {
      await User.findByIdAndUpdate(req.userId, { cvURL: '' });
      console.log('Cleared CV from user profile');
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

module.exports = router;
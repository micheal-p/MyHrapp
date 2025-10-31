// backend/routes/applications.js (Updated - Uses req.userId; Full Routes for Applications)
const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');  // For refs if needed
const authMiddleware = require('../middleware/auth');  // Your middleware

// FIXED: GET /api/applications/count (for employer dashboard badge)
router.get('/count', authMiddleware, async (req, res) => {
  try {
    const employerId = req.userId;  // FIXED: Uses your middleware's req.userId
    const count = await Application.countDocuments({ 
      job: { $in: await Job.find({ employer: employerId }, '_id') },  // Query jobs by employer, then apps
      status: { $ne: 'Rejected' }  // Count pending/active
    });
    res.json({ count });
  } catch (err) {
    console.error('Count error:', err);
    res.status(500).json({ error: 'Failed to fetch count' });
  }
});

// GET /api/applications (list for JobApplications screen)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const employerId = req.userId;  // FIXED: Uses req.userId
    const jobs = await Job.find({ employer: employerId }, '_id');
    const applications = await Application.find({ job: { $in: jobs } })
      .populate('applicant', 'fullName stack score email cvURL')  // Populate candidate fields
      .populate('job', 'title companyName');  // Populate job fields (add companyName to Job schema if needed)
    res.json({ applications });
  } catch (err) {
    console.error('List error:', err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// PUT /api/applications/:id/status (for accept/reject)
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;  // e.g., 'Accepted' or 'Rejected'
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('applicant', 'fullName');
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json({ application });
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;
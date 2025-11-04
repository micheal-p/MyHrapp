// backend/routes/applications.js
const express = require('express');
const router = express.Router();
const JobApplication = require('../models/JobApplication');
const auth = require('../middleware/auth');

router.get('/count', auth, async (req, res) => {
  try {
    const count = await JobApplication.countDocuments({ applicant: req.userId });
    res.json({ count });
  } catch (error) {
    console.error('Get application count error:', error);
    res.status(500).json({ error: 'Failed to get count' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const applications = await JobApplication.find({ applicant: req.userId })
      .populate('job', 'title company location')
      .populate({
        path: 'job',
        populate: {
          path: 'company',
          select: 'fullName companyName'
        }
      })
      .sort({ appliedAt: -1 });

    res.json({ applications });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

router.put('/:appId/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const application = await JobApplication.findByIdAndUpdate(
      req.params.appId,
      { status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ message: 'Status updated', application });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;
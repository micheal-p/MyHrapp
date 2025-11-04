// backend/routes/jobs.js (COMPLETE - Fixed & Clean)
const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const User = require('../models/User');
const auth = require('../middleware/auth');

// ===============================
// 📝 POST NEW JOB (EMPLOYER)
// ===============================
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'employer') {
      return res.status(403).json({ error: 'Only employers can post jobs' });
    }

    const job = new Job({
      ...req.body,
      company: req.userId,
    });

    await job.save();

    user.jobsPosted = (user.jobsPosted || 0) + 1;
    await user.save();

    res.status(201).json({ message: 'Job posted successfully', job });
  } catch (error) {
    console.error('Post job error:', error);
    res.status(500).json({ error: 'Failed to post job' });
  }
});

// ===============================
// 📋 GET ALL JOBS (EMPLOYEE VIEW)
// ===============================
router.get('/', auth, async (req, res) => {
  try {
    const { stack, location, salaryMin } = req.query;
    let query = { status: 'open' };

    if (stack) query.stack = stack;
    if (location) query.location = location;
    if (salaryMin) query['salaryRange.min'] = { $gte: parseInt(salaryMin) };

    const jobs = await Job.find(query)
      .populate('company', 'fullName companyName')
      .sort({ createdAt: -1 })
      .limit(50);

    const userId = req.userId;
    const jobsWithApplied = jobs.map(job => ({
      ...job.toObject(),
      hasApplied: job.applicants.includes(userId),
    }));

    res.json({ jobs: jobsWithApplied });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// ===============================
// ✅ APPLY TO JOB (EMPLOYEE)
// ===============================
router.post('/:jobId/apply', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'employee') {
      return res.status(403).json({ error: 'Only employees can apply' });
    }

    const job = await Job.findById(req.params.jobId);
    if (!job || job.status !== 'open') {
      return res.status(400).json({ error: 'Job not available' });
    }

    if (job.applicants.includes(req.userId)) {
      return res.status(400).json({ error: 'Already applied' });
    }

    // Handle questions if present
    if (job.applicationQuestions && job.applicationQuestions.length > 0) {
      const answers = req.body.answers;
      if (!answers || Object.keys(answers).length !== job.applicationQuestions.length) {
        return res.status(400).json({ error: 'All questions must be answered' });
      }
    }

    // ✅ FIXED: Handle resumeUrl from request OR fallback to user's profile CV
    let resumeUrl = req.body.resumeUrl || user.cvURL;
    
    if (!resumeUrl) {
      return res.status(400).json({ error: 'A CV is required to apply' });
    }

    // Calculate match score
    let matchScore = 0;
    if (user.stack === job.stack) matchScore += 20;
    const skillMatch = user.skills.filter(s => job.requirements?.includes(s)).length;
    matchScore += skillMatch * 5;
    matchScore += (user.score / 100) * 30;

    const application = new JobApplication({
      job: req.params.jobId,
      applicant: req.userId,
      answers: req.body.answers || {},
      resumeUrl,  // ✅ Application-specific resume
      coverLetter: req.body.coverLetter,
      matchScore: Math.round(matchScore),
    });

    await application.save();

    job.applicants.push(req.userId);
    await job.save();

    res.json({ 
      message: 'Applied successfully', 
      matchScore: application.matchScore 
    });
  } catch (error) {
    console.error('Apply job error:', error);
    res.status(500).json({ error: 'Failed to apply' });
  }
});

// ===============================
// 👥 GET MY JOBS (EMPLOYER)
// ===============================
router.get('/my', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'employer') {
      return res.status(403).json({ error: 'Only employers can view their jobs' });
    }

    const jobs = await Job.find({ company: req.userId })
      .populate('applicants', 'fullName email score')
      .sort({ createdAt: -1 });

    res.json({ jobs });
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// ===============================
// 📊 GET JOB APPLICATIONS (EMPLOYER)
// ===============================
router.get('/:jobId/applications', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job || job.company.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const applications = await JobApplication.find({ job: req.params.jobId })
      .populate('applicant', 'fullName email score stack skills cvURL')
      .populate('job', 'title')
      .sort({ appliedAt: -1 });

    res.json({ applications });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// ===============================
// 🔄 UPDATE APPLICATION STATUS (EMPLOYER/ADMIN)
// ===============================
router.put('/applications/:applicationId', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const application = await JobApplication.findByIdAndUpdate(
      req.params.applicationId,
      { status },
      { new: true }
    ).populate('applicant job');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const user = await User.findById(req.userId);
    if (user.role !== 'admin' && application.job.company.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ message: 'Status updated', application });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

module.exports = router;
const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Event = require('../models/Event');

const router = express.Router();

// Create event
router.post('/',
  auth,
  [
    body('name').notEmpty(),
    body('date').isISO8601(),
    body('category').isIn(['Meeting', 'Birthday', 'Appointment', 'Other']),
    body('reminder.time').optional().isISO8601()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const event = new Event({
        ...req.body,
        user: req.user.id
      });
      await event.save();

      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get all events
router.get('/', auth, async (req, res) => {
  try {
    const { category, sort = 'date' } = req.query;
    const query = { user: req.user.id };
    
    if (category) {
      query.category = category;
    }

    const events = await Event.find(query)
      .sort({ [sort]: 1 })
      .exec();

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get upcoming events
router.get('/upcoming', auth, async (req, res) => {
  try {
    const events = await Event.find({
      user: req.user.id,
      date: { $gte: new Date() }
    })
    .sort({ date: 1 })
    .exec();

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event
router.put('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
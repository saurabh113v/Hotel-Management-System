const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const { protect, admin } = require('../middleware/auth');

// Get all rooms (with location, date, type, price, and capacity filters)
router.get('/', async (req, res) => {
  try {
    const { checkIn, checkOut, type, maxPrice, capacity, location } = req.query;

    let filter = {};

    if (location && location !== 'all') {
      filter.location = location;
    }

    if (type && type !== 'all') {
      filter.type = type;
    }

    if (maxPrice) {
      filter.price = { $lte: Number(maxPrice) };
    }

    if (capacity) {
      filter.capacity = { $gte: Number(capacity) };
    }

    let rooms = await Room.find(filter);

    // Filter by date availability if checkIn and checkOut are provided
    if (checkIn && checkOut) {
      const userCheckIn = new Date(checkIn);
      const userCheckOut = new Date(checkOut);

      rooms = rooms.filter(room => {
        // Return true if there is no overlapping booking
        return !room.bookedDates.some(booking => {
          const bookedIn = new Date(booking.checkIn);
          const bookedOut = new Date(booking.checkOut);
          // Overlap condition
          return (userCheckIn < bookedOut && userCheckOut > bookedIn);
        });
      });
    }

    res.status(200).json({ success: true, count: rooms.length, data: rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get a single room
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    res.status(200).json({ success: true, data: room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create a new room (Admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, type, price, capacity, description, image, location, lat, lng, amenities } = req.body;

    const roomExists = await Room.findOne({ name });
    if (roomExists) {
      return res.status(400).json({ success: false, message: 'Room name already exists' });
    }

    const room = await Room.create({
      name,
      type,
      price,
      capacity,
      description,
      image,
      location: location || 'India',
      lat: lat ? Number(lat) : 20.5937,
      lng: lng ? Number(lng) : 78.9629,
      amenities: amenities ? (Array.isArray(amenities) ? amenities : amenities.split(',').map(a => a.trim())) : []
    });

    res.status(201).json({ success: true, data: room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete a room (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    res.status(200).json({ success: true, message: 'Room deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create a review for a room (Verified guest only)
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5 || !comment || comment.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide a valid rating (1-5) and comment' });
    }

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // 1. Verify if user has booked this room (confirmed booking)
    const hasBooked = await Booking.findOne({
      user: req.user._id,
      room: req.params.id,
      status: 'confirmed'
    });

    if (!hasBooked) {
      return res.status(400).json({ 
        success: false, 
        message: 'Only guests who have stayed in this room can write a review' 
      });
    }

    // 2. Check if already reviewed
    const alreadyReviewed = room.reviews.find(
      r => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this room' });
    }

    // 3. Add review
    const newReview = {
      name: req.user.name,
      rating: Number(rating),
      comment: comment.trim(),
      user: req.user._id
    };

    room.reviews.push(newReview);
    room.numReviews = room.reviews.length;
    room.rating = room.reviews.reduce((acc, item) => item.rating + acc, 0) / room.reviews.length;

    await room.save();

    res.status(201).json({ success: true, message: 'Review added successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

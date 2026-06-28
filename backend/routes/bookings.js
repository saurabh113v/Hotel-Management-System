const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { protect, admin } = require('../middleware/auth');
const { sendBookingEmail } = require('../utils/sendEmail');

// Create a new booking
router.post('/', protect, async (req, res) => {
  const { roomId, checkIn, checkOut, guests, totalAmount, paymentMethod, transactionId } = req.body;

  try {
    if (!roomId || !checkIn || !checkOut || !guests || !totalAmount) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (start >= end) {
      return res.status(400).json({ success: false, message: 'Check-out date must be after check-in date' });
    }

    // Double-check availability for requested dates
    const isOverlapping = room.bookedDates.some(booking => {
      const bookedIn = new Date(booking.checkIn);
      const bookedOut = new Date(booking.checkOut);
      return (start < bookedOut && end > bookedIn);
    });

    if (isOverlapping) {
      return res.status(400).json({ success: false, message: 'Room is already booked for the selected dates' });
    }

    // Create booking record
    const booking = await Booking.create({
      user: req.user._id,
      room: roomId,
      checkIn: start,
      checkOut: end,
      guests: Number(guests),
      totalAmount: Number(totalAmount),
      paymentMethod: paymentMethod || 'Not Specified',
      transactionId: transactionId || 'N/A'
    });

    // Append date range to room's booked dates
    room.bookedDates.push({
      checkIn: start,
      checkOut: end,
      bookingId: booking._id
    });
    await room.save();

    // Send confirmation email asynchronously
    Booking.findById(booking._id)
      .populate('user')
      .populate('room')
      .then(populatedBooking => {
        if (populatedBooking) {
          sendBookingEmail({ booking: populatedBooking, action: 'create' });
        }
      })
      .catch(err => console.error('Error fetching booking for confirmation email:', err));

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get current user's bookings list
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('room')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all bookings (Admin only)
router.get('/', protect, admin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('room')
      .populate('user')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Cancel a booking
router.post('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify ownership or check if caller is admin
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking has already been cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Remove booking dates from Room
    const room = await Room.findById(booking.room);
    if (room) {
      room.bookedDates = room.bookedDates.filter(
        b => b.bookingId && b.bookingId.toString() !== booking._id.toString()
      );
      await room.save();
    }

    // Send cancellation email asynchronously
    Booking.findById(booking._id)
      .populate('user')
      .populate('room')
      .then(populatedBooking => {
        if (populatedBooking) {
          sendBookingEmail({ booking: populatedBooking, action: 'cancel' });
        }
      })
      .catch(err => console.error('Error fetching booking for cancellation email:', err));

    res.status(200).json({ success: true, message: 'Booking cancelled successfully', data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

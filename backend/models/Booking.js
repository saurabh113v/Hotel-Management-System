const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  checkIn: {
    type: Date,
    required: [true, 'Please add a check-in date']
  },
  checkOut: {
    type: Date,
    required: [true, 'Please add a check-out date']
  },
  guests: {
    type: Number,
    required: [true, 'Please specify the number of guests']
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed'
  },
  paymentMethod: {
    type: String,
    default: 'Not Specified'
  },
  transactionId: {
    type: String,
    default: 'N/A'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);

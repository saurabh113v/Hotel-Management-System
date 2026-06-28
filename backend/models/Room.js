const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a room name'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Please select a room type'],
    enum: ['single', 'couple', 'family', 'suite']
  },
  price: {
    type: Number,
    required: [true, 'Please add a room price per night']
  },
  capacity: {
    type: Number,
    required: [true, 'Please specify room capacity']
  },
  description: {
    type: String,
    required: [true, 'Please add a room description']
  },
  image: {
    type: String,
    required: [true, 'Please add a room image URL']
  },
  images: {
    type: [String],
    default: []
  },
  location: {
    type: String,
    required: [true, 'Please specify the hotel location']
  },
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  },
  amenities: {
    type: [String],
    default: []
  },
  bookedDates: [
    {
      checkIn: {
        type: Date,
        required: true
      },
      checkOut: {
        type: Date,
        required: true
      },
      bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
      }
    }
  ],
  reviews: [reviewSchema],
  rating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);

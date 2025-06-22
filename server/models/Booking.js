const mongoose= require ('mongoose');

const bookingSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle ID is required']
  },
  customerId: {
    type: String,
    required: [true, 'Customer ID is required'],
    trim: true
  },
  fromPincode: {
    type: String,
    required: [true, 'From pincode is required'],
    match: [/^\d{6}$/, 'Pincode must be exactly 6 digits']
  },
  toPincode: {
    type: String,
    required: [true, 'To pincode is required'],
    match: [/^\d{6}$/, 'Pincode must be exactly 6 digits']
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Start time must be in the future'
    }
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  estimatedRideDurationHours: {
    type: Number,
    required: true,
    min: [0.1, 'Ride duration must be at least 0.1 hours']
  },
  status: {
    type: String,
    enum: ['confirmed', 'completed', 'cancelled'],
    default: 'confirmed'
  }
}, {
  timestamps: true,
  toJSON: { 
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Compound indexes for efficient availability queries
bookingSchema.index({ vehicleId: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ customerId: 1, createdAt: -1 });


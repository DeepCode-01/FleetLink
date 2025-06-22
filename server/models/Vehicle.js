const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vehicle name is required'],
    trim: true,
    minlength: [2, 'Vehicle name must be at least 2 characters long'],
    maxlength: [100, 'Vehicle name cannot exceed 100 characters']
  },
  capacityKg: {
    type: Number,
    required: [true, 'Capacity in KG is required'],
    min: [1, 'Capacity must be at least 1 KG'],
    max: [50000, 'Capacity cannot exceed 50,000 KG']
  },
  tyres: {
    type: Number,
    required: [true, 'Number of tyres is required'],
    min: [2, 'Vehicle must have at least 2 tyres'],
    max: [20, 'Vehicle cannot have more than 20 tyres']
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

// Indexes for query performance
vehicleSchema.index({ capacityKg: 1 });
vehicleSchema.index({ name: 1 }); // Add { unique: true } if names must be unique

// ✅ Export the model
module.exports = mongoose.model('Vehicle', vehicleSchema);

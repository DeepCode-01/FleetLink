import express from 'express';
import Vehicle from '../models/Vehicle.js';
import Booking from '../models/Booking.js';
import { calculateRideDuration, validateAvailability } from '../utils/bookingUtils.js';

const router = express.Router();

// POST /api/vehicles - Add a new vehicle
router.post('/vehicles', async (req, res) => {
  try {
    const { name, capacityKg, tyres } = req.body;

    // Validation
    if (!name || !capacityKg || !tyres) {
      return res.status(400).json({
        message: 'Missing required fields',
        required: ['name', 'capacityKg', 'tyres']
      });
    }

    if (typeof capacityKg !== 'number' || typeof tyres !== 'number') {
      return res.status(400).json({
        message: 'capacityKg and tyres must be numbers'
      });
    }

    const vehicle = new Vehicle({
      name: name.trim(),
      capacityKg,
      tyres
    });

    const savedVehicle = await vehicle.save();
    res.status(201).json(savedVehicle);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    console.error('Error creating vehicle:', error);
    res.status(500).json({ message: 'Failed to create vehicle' });
  }
});

// GET /api/vehicles/available - Find available vehicles
router.get('/vehicles/available', async (req, res) => {
  try {
    const { capacityRequired, fromPincode, toPincode, startTime } = req.query;

    // Validation
    if (!capacityRequired || !fromPincode || !toPincode || !startTime) {
      return res.status(400).json({
        message: 'Missing required query parameters',
        required: ['capacityRequired', 'fromPincode', 'toPincode', 'startTime']
      });
    }

    // Validate pincode format
    if (!/^\d{6}$/.test(fromPincode) || !/^\d{6}$/.test(toPincode)) {
      return res.status(400).json({
        message: 'Pincodes must be exactly 6 digits'
      });
    }

    const capacity = parseFloat(capacityRequired);
    if (isNaN(capacity) || capacity <= 0) {
      return res.status(400).json({
        message: 'capacityRequired must be a positive number'
      });
    }

    const requestedStartTime = new Date(startTime);
    if (isNaN(requestedStartTime.getTime())) {
      return res.status(400).json({
        message: 'startTime must be a valid ISO date string'
      });
    }

    if (requestedStartTime <= new Date()) {
      return res.status(400).json({
        message: 'startTime must be in the future'
      });
    }

    // Calculate ride duration
    const estimatedRideDurationHours = calculateRideDuration(fromPincode, toPincode);
    const requestedEndTime = new Date(requestedStartTime.getTime() + estimatedRideDurationHours * 60 * 60 * 1000);

    // Find vehicles with sufficient capacity
    const vehiclesWithCapacity = await Vehicle.find({
      capacityKg: { $gte: capacity }
    });

    if (vehiclesWithCapacity.length === 0) {
      return res.json([]);
    }

    // Check availability for each vehicle
    const availableVehicles = [];
    
    for (const vehicle of vehiclesWithCapacity) {
      const isAvailable = await validateAvailability(
        vehicle._id,
        requestedStartTime,
        requestedEndTime
      );

      if (isAvailable) {
        availableVehicles.push({
          ...vehicle.toJSON(),
          estimatedRideDurationHours
        });
      }
    }

    res.json(availableVehicles);
  } catch (error) {
    console.error('Error finding available vehicles:', error);
    res.status(500).json({ message: 'Failed to find available vehicles' });
  }
});

// GET /api/vehicles - Get all vehicles (for management)
router.get('/vehicles', async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ message: 'Failed to fetch vehicles' });
  }
});

export default router;
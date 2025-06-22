const express = require("express");
const Booking = require('../models/Booking.js');
const Vehicle = require('../models/Vehicle.js');
const { calculateRideDuration, validateAvailability } = require ('../utils/bookingUtils.js');

const router = express.Router();

// POST /api/bookings - Book a vehicle
router.post('/bookings', async (req, res) => {
  try {
    const { vehicleId, fromPincode, toPincode, startTime, customerId } = req.body;

    // Validation
    if (!vehicleId || !fromPincode || !toPincode || !startTime || !customerId) {
      return res.status(400).json({
        message: 'Missing required fields',
        required: ['vehicleId', 'fromPincode', 'toPincode', 'startTime', 'customerId']
      });
    }

    // Validate pincode format
    if (!/^\d{6}$/.test(fromPincode) || !/^\d{6}$/.test(toPincode)) {
      return res.status(400).json({
        message: 'Pincodes must be exactly 6 digits'
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

    // Check if vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Calculate ride duration and end time
    const estimatedRideDurationHours = calculateRideDuration(fromPincode, toPincode);
    const bookingEndTime = new Date(requestedStartTime.getTime() + estimatedRideDurationHours * 60 * 60 * 1000);

    // Re-verify availability to prevent race conditions
    const isAvailable = await validateAvailability(vehicleId, requestedStartTime, bookingEndTime);
    
    if (!isAvailable) {
      return res.status(409).json({
        message: 'Vehicle is no longer available for the requested time slot'
      });
    }

    // Create the booking
    const booking = new Booking({
      vehicleId,
      customerId: customerId.trim(),
      fromPincode,
      toPincode,
      startTime: requestedStartTime,
      endTime: bookingEndTime,
      estimatedRideDurationHours
    });

    const savedBooking = await booking.save();
    
    // Populate vehicle details for response
    await savedBooking.populate('vehicleId');
    
    res.status(201).json(savedBooking);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Failed to create booking' });
  }
});

// GET /api/bookings - Get all bookings (for management)
router.get('/bookings', async (req, res) => {
  try {
    const { customerId } = req.query;
    
    let query = {};
    if (customerId) {
      query.customerId = customerId;
    }
    
    const bookings = await Booking.find(query)
      .populate('vehicleId')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// DELETE /api/bookings/:id - Cancel a booking
router.delete('/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if booking can be cancelled (e.g., not in the past)
    if (booking.startTime <= new Date()) {
      return res.status(400).json({ 
        message: 'Cannot cancel a booking that has already started' 
      });
    }
    
    booking.status = 'cancelled';
    await booking.save();
    
    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
});

module.exports = router;

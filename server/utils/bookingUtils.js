import Booking from '../models/Booking.js';

/**
 * Calculate estimated ride duration based on pincodes
 * This is a simplified placeholder logic as specified in requirements
 * @param {string} fromPincode - Starting pincode
 * @param {string} toPincode - Destination pincode
 * @returns {number} Estimated ride duration in hours
 */
export function calculateRideDuration(fromPincode, toPincode) {
  const from = parseInt(fromPincode);
  const to = parseInt(toPincode);
  
  // Simplified formula: absolute difference modulo 24 to keep within a day
  const duration = Math.abs(to - from) % 24;
  
  // Ensure minimum duration of 0.5 hours (30 minutes)
  return Math.max(duration, 0.5);
}

/**
 * Validate if a vehicle is available for a given time window
 * @param {string} vehicleId - Vehicle ID to check
 * @param {Date} startTime - Requested start time
 * @param {Date} endTime - Requested end time
 * @returns {Promise<boolean>} True if available, false if conflicting bookings exist
 */
export async function validateAvailability(vehicleId, startTime, endTime) {
  try {
    // Find any bookings that overlap with the requested time window
    const conflictingBookings = await Booking.find({
      vehicleId,
      status: { $ne: 'cancelled' }, // Exclude cancelled bookings
      $or: [
        // Existing booking starts during requested time window
        {
          startTime: { $gte: startTime, $lt: endTime }
        },
        // Existing booking ends during requested time window
        {
          endTime: { $gt: startTime, $lte: endTime }
        },
        // Existing booking completely encompasses requested time window
        {
          startTime: { $lte: startTime },
          endTime: { $gte: endTime }
        }
      ]
    });

    return conflictingBookings.length === 0;
  } catch (error) {
    console.error('Error validating availability:', error);
    throw error;
  }
}

/**
 * Get booking statistics for a vehicle
 * @param {string} vehicleId - Vehicle ID
 * @returns {Promise<Object>} Booking statistics
 */
export async function getVehicleBookingStats(vehicleId) {
  try {
    const now = new Date();
    
    const [totalBookings, activeBookings, completedBookings] = await Promise.all([
      Booking.countDocuments({ vehicleId }),
      Booking.countDocuments({ 
        vehicleId, 
        status: 'confirmed', 
        startTime: { $gte: now } 
      }),
      Booking.countDocuments({ 
        vehicleId, 
        status: 'completed' 
      })
    ]);

    return {
      totalBookings,
      activeBookings,
      completedBookings
    };
  } catch (error) {
    console.error('Error getting vehicle booking stats:', error);
    throw error;
  }
}
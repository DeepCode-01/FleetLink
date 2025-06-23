const Booking = require('../models/Booking.js');


 function calculateRideDuration(fromPincode, toPincode) {
  const from = parseInt(fromPincode);
  const to = parseInt(toPincode);
  
  const duration = Math.abs(to - from) % 24;
  
 
  return Math.max(duration, 0.5);
}


 async function validateAvailability(vehicleId, startTime, endTime) {
  try {

    const conflictingBookings = await Booking.find({
      vehicleId,
      status: { $ne: 'cancelled' }, 
      $or: [

        {
          startTime: { $gte: startTime, $lt: endTime }
        },
        
        {
          endTime: { $gt: startTime, $lte: endTime }
        },
  
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


 async function getVehicleBookingStats(vehicleId) {
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

module.exports = {
  calculateRideDuration,
  validateAvailability,
  getVehicleBookingStats
};

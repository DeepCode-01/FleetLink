const {
  calculateRideDuration,
  validateAvailability
} = require( "../utils/bookingUtils.js")
const Booking = require ("../models/Booking.js")
const mongoose = require ("mongoose")

// Mock the Booking model
jest.mock("../models/Booking.js")

describe("Booking Utils", () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("calculateRideDuration", () => {
    test("should calculate ride duration correctly for different pincodes", () => {
      expect(calculateRideDuration("110001", "400001")).toBe(22) // |400001 - 110001| % 24 = 22
      expect(calculateRideDuration("400001", "110001")).toBe(22) // Same result due to absolute value
      expect(calculateRideDuration("110001", "110002")).toBe(1) // |110002 - 110001| % 24 = 1
      expect(calculateRideDuration("110001", "110001")).toBe(0.5) // Same pincode, minimum 0.5 hours
    })

    test("should return minimum duration of 0.5 hours", () => {
      expect(calculateRideDuration("110001", "110001")).toBe(0.5)
      expect(calculateRideDuration("123456", "123456")).toBe(0.5)
    })

    test("should handle large pincode differences with modulo 24", () => {
      expect(calculateRideDuration("100000", "999999")).toBe(23) // |999999 - 100000| % 24 = 23
      expect(calculateRideDuration("999999", "100000")).toBe(23)
    })
  })

  describe("validateAvailability", () => {
    const mockVehicleId = new mongoose.Types.ObjectId()
    const startTime = new Date("2023-12-01T10:00:00Z")
    const endTime = new Date("2023-12-01T15:00:00Z")

    test("should return true when no conflicting bookings exist", async () => {
      Booking.find.mockResolvedValue([])

      const result = await validateAvailability(
        mockVehicleId,
        startTime,
        endTime
      )

      expect(result).toBe(true)
      expect(Booking.find).toHaveBeenCalledWith({
        vehicleId: mockVehicleId,
        status: { $ne: "cancelled" },
        $or: [
          { startTime: { $gte: startTime, $lt: endTime } },
          { endTime: { $gt: startTime, $lte: endTime } },
          { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
        ]
      })
    })

    test("should return false when conflicting bookings exist", async () => {
      const conflictingBooking = {
        _id: new mongoose.Types.ObjectId(),
        vehicleId: mockVehicleId,
        startTime: new Date("2023-12-01T12:00:00Z"),
        endTime: new Date("2023-12-01T16:00:00Z"),
        status: "confirmed"
      }

      Booking.find.mockResolvedValue([conflictingBooking])

      const result = await validateAvailability(
        mockVehicleId,
        startTime,
        endTime
      )

      expect(result).toBe(false)
    })

    test("should exclude cancelled bookings from conflict check", async () => {
      Booking.find.mockResolvedValue([])

      await validateAvailability(mockVehicleId, startTime, endTime)

      expect(Booking.find).toHaveBeenCalledWith(
        expect.objectContaining({
          status: { $ne: "cancelled" }
        })
      )
    })

    test("should handle database errors", async () => {
      const error = new Error("Database connection failed")
      Booking.find.mockRejectedValue(error)

      await expect(
        validateAvailability(mockVehicleId, startTime, endTime)
      ).rejects.toThrow("Database connection failed")
    })
  })
})

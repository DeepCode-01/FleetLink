const request = require ("supertest")
const app = require ("../index.js")
const Vehicle = require ("../models/Vehicle.js")
const Booking = require ("../models/Booking.js")

// Mock the models
jest.mock("../models/Vehicle.js")
jest.mock("../models/Booking.js")

describe("Vehicle API Endpoints", () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("POST /api/vehicles", () => {
    test("should create a new vehicle successfully", async () => {
      const vehicleData = {
        name: "Test Truck",
        capacityKg: 1000,
        tyres: 4
      }

      const mockSavedVehicle = {
        id: "mock-vehicle-id",
        ...vehicleData,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      Vehicle.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockSavedVehicle)
      }))

      const response = await request(app)
        .post("/api/vehicles")
        .send(vehicleData)

      expect(response.status).toBe(201)
      expect(response.body).toEqual(mockSavedVehicle)
    })

    test("should return 400 for missing required fields", async () => {
      const incompleteData = {
        name: "Test Truck"
        // Missing capacityKg and tyres
      }

      const response = await request(app)
        .post("/api/vehicles")
        .send(incompleteData)

      expect(response.status).toBe(400)
      expect(response.body.message).toBe("Missing required fields")
    })

    test("should return 400 for invalid data types", async () => {
      const invalidData = {
        name: "Test Truck",
        capacityKg: "invalid",
        tyres: 4
      }

      const response = await request(app)
        .post("/api/vehicles")
        .send(invalidData)

      expect(response.status).toBe(400)
      expect(response.body.message).toBe("capacityKg and tyres must be numbers")
    })
  })

  describe("GET /api/vehicles/available", () => {
    test("should return available vehicles for valid search criteria", async () => {
      const mockVehicles = [
        {
          _id: "vehicle-1",
          name: "Truck 1",
          capacityKg: 1000,
          tyres: 4,
          toJSON: () => ({
            id: "vehicle-1",
            name: "Truck 1",
            capacityKg: 1000,
            tyres: 4
          })
        }
      ]

      Vehicle.find.mockResolvedValue(mockVehicles)
      Booking.find.mockResolvedValue([])

      const response = await request(app)
        .get("/api/vehicles/available")
        .query({
          capacityRequired: 500,
          fromPincode: "110001",
          toPincode: "400001",
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(1)
      expect(response.body[0]).toHaveProperty("estimatedRideDurationHours")
    })

    test("should return 400 for missing query parameters", async () => {
      const response = await request(app)
        .get("/api/vehicles/available")
        .query({
          capacityRequired: 500

        })

      expect(response.status).toBe(400)
      expect(response.body.message).toBe("Missing required query parameters")
    })

    test("should return 400 for invalid pincode format", async () => {
      const response = await request(app)
        .get("/api/vehicles/available")
        .query({
          capacityRequired: 500,
          fromPincode: "1100",
          toPincode: "400001",
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })

      expect(response.status).toBe(400)
      expect(response.body.message).toBe("Pincodes must be exactly 6 digits")
    })

    test("should return 400 for start time in the past", async () => {
      const response = await request(app)
        .get("/api/vehicles/available")
        .query({
          capacityRequired: 500,
          fromPincode: "110001",
          toPincode: "400001",
          startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString() 
        })

      expect(response.status).toBe(400)
      expect(response.body.message).toBe("startTime must be in the future")
    })
  })
})

import React, { useState } from "react"
import {
  Search,
  Truck,
  Calendar,
  MapPin,
  Clock,
  Loader2,
  Filter,
  Star,
  Zap,
  RefreshCw
} from "lucide-react"
import { useToast } from "../components/Toaster"
import axios from "axios"
import { Link } from 'react-router-dom';

const SearchAndBook = () => {
  const initialSearchData = {
    capacityRequired: "",
    fromPincode: "",
    toPincode: "",
    startTime: "",
    duration: ""
  }

  const [searchData, setSearchData] = useState(initialSearchData)
  const [customerId] = useState(
    "customer-" +
      Math.random()
        .toString(36)
        .substr(2, 9)
  )
  const [vehicles, setVehicles] = useState([])
  const [searching, setSearching] = useState(false)
  const [booking, setBooking] = useState(null)
  const [focusedField, setFocusedField] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)
  const { showToast } = useToast()

  const resetForm = () => {
    setSearchData(initialSearchData)
    setVehicles([])
    setHasSearched(false)
  }

  const handleSearch = async e => {
    e.preventDefault()

    if (
      !searchData.capacityRequired ||
      !searchData.fromPincode ||
      !searchData.toPincode ||
      !searchData.startTime ||
      !searchData.duration
    ) {
      showToast("error", "Please fill in all search fields")
      return
    }

    if (
      !/^\d{6}$/.test(searchData.fromPincode) ||
      !/^\d{6}$/.test(searchData.toPincode)
    ) {
      showToast("error", "Pincodes must be exactly 6 digits")
      return
    }

    const capacity = parseFloat(searchData.capacityRequired)
    if (isNaN(capacity) || capacity <= 0) {
      showToast("error", "Capacity must be a positive number")
      return
    }

    const duration = parseFloat(searchData.duration)
    if (isNaN(duration) || duration <= 0) {
      showToast("error", "Duration must be a positive number")
      return
    }

    const startTime = new Date(searchData.startTime)
    if (startTime <= new Date()) {
      showToast("error", "Start time must be in the future")
      return
    }

    setSearching(true)
    setVehicles([])
    setHasSearched(false)

    try {
      const response = await axios.get(
        "http://localhost:5000/api/vehicles/available",
        {
          params: {
            capacityRequired: capacity,
            fromPincode: searchData.fromPincode,
            toPincode: searchData.toPincode,
            startTime: startTime.toISOString()
          }
        }
      )

      // Add customer-specified duration to each vehicle
      const vehiclesWithCustomDuration = response.data.map(vehicle => ({
        ...vehicle,
        customerDuration: duration
      }))

      setVehicles(vehiclesWithCustomDuration)
      setHasSearched(true)

      if (response.data.length === 0) {
        showToast("warning", "No vehicles available for the selected criteria")
        // Reset form when no vehicles found
        setTimeout(() => {
          resetForm()
        }, 2000) // Reset after 2 seconds to allow user to see the message
      } else {
        showToast(
          "success",
          `Found ${response.data.length} available vehicle(s)`
        )
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to search vehicles"
      showToast("error", message)
      setHasSearched(true)
    } finally {
      setSearching(false)
    }
  }

  const handleBooking = async (vehicleId, vehicleName) => {
    setBooking(vehicleId)

    try {
      const startTime = new Date(searchData.startTime)

      const response = await axios.post("http://localhost:5000/api/bookings", {
        vehicleId,
        fromPincode: searchData.fromPincode,
        toPincode: searchData.toPincode,
        startTime: startTime.toISOString(),
        customerId,
        duration: parseFloat(searchData.duration)
      })

      showToast(
        "success",
        `Successfully booked "${vehicleName}"! Booking ID: ${response.data.id}`
      )

      // Remove booked vehicle from available list
      setVehicles(prev => prev.filter(v => v.id !== vehicleId))
    } catch (error) {
      const message = error.response?.data?.message || "Failed to book vehicle"
      showToast("error", message)
    } finally {
      setBooking(null)
    }
  }

  const handleChange = e => {
    const { name, value } = e.target
    setSearchData(prev => ({ ...prev, [name]: value }))
  }

  const formatDateTime = dateString => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-8 animate-fade-in">
      
      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden hover:shadow-glow-lg transition-all duration-500">
        
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 p-8 text-white overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-teal-600/90 animate-gradient-x"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative p-3 bg-white/20 rounded-2xl backdrop-blur-sm group hover:scale-110 transition-transform duration-300">
                  <Search size={28} className="animate-bounce-gentle" />
                  <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-1">
                    Search & Book Vehicles
                  </h1>
                  <p className="text-blue-100 text-lg">
                    Find the perfect vehicle for your journey
                  </p>
                </div>
              </div>
              <div className="hidden lg:flex items-center space-x-6">
                <div className="flex items-center space-x-4 text-white/80">
                  <div className="flex items-center space-x-2">
                    <Filter size={20} />
                    <span className="text-sm">Smart Filters</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap size={20} />
                    <span className="text-sm">Instant Results</span>
                  </div>
                </div>
                {hasSearched && vehicles.length === 0 && (
                  <button
                    onClick={resetForm}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all duration-300"
                  >
                    <RefreshCw size={18} />
                    <span className="text-sm">Reset Search</span>
                  </button>
                )}
              </div>
            </div>
          </div>

         
          <form onSubmit={handleSearch} className="p-8 space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
             
              <div>
                <label
                  htmlFor="capacityRequired"
                  className=" text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2"
                >
                  <Truck size={16} className="text-blue-500" />
                  <span>Capacity Required (KG)</span>
                </label>
                <div className="relative group">
                  <input
                    type="number"
                    id="capacityRequired"
                    name="capacityRequired"
                    value={searchData.capacityRequired}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("capacity")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="500"
                    min="1"
                    step="0.1"
                    className={`w-full px-4 py-4 rounded-2xl border-2 font-medium transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400 ${
                      focusedField === "capacity"
                        ? "border-blue-500 ring-4 ring-blue-500/20 shadow-glow scale-105"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-lg"
                    }`}
                    disabled={searching}
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">
                    KG
                  </div>
                </div>
              </div>

             
              <div>
                <label
                  htmlFor="fromPincode"
                  className=" text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2"
                >
                  <MapPin size={16} className="text-green-500" />
                  <span>From Pincode</span>
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    id="fromPincode"
                    name="fromPincode"
                    value={searchData.fromPincode}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("from")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="110001"
                    pattern="\d{6}"
                    maxLength={6}
                    className={`w-full px-4 py-4 rounded-2xl border-2 font-medium transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400 ${
                      focusedField === "from"
                        ? "border-green-500 ring-4 ring-green-500/20 shadow-glow scale-105"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-lg"
                    }`}
                    disabled={searching}
                  />
                </div>
              </div>

             
              <div>
                <label
                  htmlFor="toPincode"
                  className="text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2"
                >
                  <MapPin size={16} className="text-red-500" />
                  <span>To Pincode</span>
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    id="toPincode"
                    name="toPincode"
                    value={searchData.toPincode}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("to")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="400001"
                    pattern="\d{6}"
                    maxLength={6}
                    className={`w-full px-4 py-4 rounded-2xl border-2 font-medium transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400 ${
                      focusedField === "to"
                        ? "border-red-500 ring-4 ring-red-500/20 shadow-glow scale-105"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-lg"
                    }`}
                    disabled={searching}
                  />
                </div>
              </div>

         
              <div>
                <label
                  htmlFor="duration"
                  className=" text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2"
                >
                  <Clock size={16} className="text-orange-500" />
                  <span>Duration (Hours)</span>
                </label>
                <div className="relative group">
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={searchData.duration}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("duration")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="2.5"
                    min="0.5"
                    step="0.5"
                    className={`w-full px-4 py-4 rounded-2xl border-2 font-medium transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400 ${
                      focusedField === "duration"
                        ? "border-orange-500 ring-4 ring-orange-500/20 shadow-glow scale-105"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-lg"
                    }`}
                    disabled={searching}
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">
                    hrs
                  </div>
                </div>
              </div>

             
              <div>
                <label
                  htmlFor="startTime"
                  className=" text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2"
                >
                  <Calendar size={16} className="text-purple-500" />
                  <span>Start Date & Time</span>
                </label>
                <div className="relative group">
                  <input
                    type="datetime-local"
                    id="startTime"
                    name="startTime"
                    value={searchData.startTime}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("time")}
                    onBlur={() => setFocusedField(null)}
                    min={new Date(Date.now() + 60 * 60 * 1000)
                      .toISOString()
                      .slice(0, 16)}
                    className={`w-full px-4 py-4 rounded-2xl border-2 font-medium transition-all duration-300 bg-white/80 backdrop-blur-sm ${
                      focusedField === "time"
                        ? "border-purple-500 ring-4 ring-purple-500/20 shadow-glow scale-105"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-lg"
                    }`}
                    disabled={searching}
                  />
                </div>
              </div>
            </div>

         
            <div className="flex justify-center pt-4 space-x-4">
              <button
                type="submit"
                disabled={searching}
                className="flex items-center space-x-3 px-12 py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-glow-lg transform hover:scale-105 hover:-translate-y-1"
              >
                {searching ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    <span className="text-lg">Searching...</span>
                  </>
                ) : (
                  <>
                    <Search size={24} />
                    <span className="text-lg">Search Available Vehicles</span>
                  </>
                )}
              </button>

              {(hasSearched || vehicles.length > 0) && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={searching}
                  className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-2xl hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-glow-lg transform hover:scale-105 hover:-translate-y-1"
                >
                  <RefreshCw size={20} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </form>
        </div>

      
        {hasSearched && vehicles.length === 0 && !searching && (
          <div className="mt-8 bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-12 text-center animate-slide-up">
            <div className="p-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Search className="text-orange-500" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              No Vehicles Available
            </h3>
            <p className="text-gray-600 text-lg mb-6">
              We couldn't find any vehicles matching your search criteria. The
              form will reset automatically, or you can try different search
              parameters.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={resetForm}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-bold rounded-xl hover:from-blue-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-glow transform hover:scale-105"
              >
                <RefreshCw size={18} />
                <span>Search Again</span>
              </button>
            </div>
          </div>
        )}

      
        {vehicles.length > 0 && (
          <div className="mt-10 space-y-6 animate-slide-up">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl text-white">
                  <Truck size={28} />
                </div>
                <span>Available Vehicles</span>
                <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-bold">
                  {vehicles.length} Found
                </div>
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {vehicles.map((vehicle, index) => (
                <div
                 
                
               key={vehicle.id}
                  className="group bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-glow-lg transition-all duration-500 transform hover:-translate-y-2 hover:scale-105"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Vehicle Header with Rating */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative p-3 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl text-white shadow-lg group-hover:shadow-glow transition-all duration-300">
                        <Truck size={24} />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-xl mb-1">
                          {vehicle.name}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium">
                          ID: {vehicle.id}
                        </p>
                       
                        <div className="flex items-center space-x-1 text-yellow-500 mt-2">
                          <Star size={14} fill="currentColor" />
                          <Star size={14} fill="currentColor" />
                          <Star size={14} fill="currentColor" />
                          <Star size={14} fill="currentColor" />
                          <Star size={14} fill="currentColor" />
                          <span className="text-xs text-gray-500 ml-1">
                            (5.0)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                 
                  <div className="space-y-4 mb-8">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-2xl border border-blue-200/50">
                        <div className="text-sm text-gray-600 mb-1">
                          Capacity
                        </div>
                        <div className="font-bold text-gray-800 text-lg">
                          {vehicle.capacityKg.toLocaleString()} KG
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 p-4 rounded-2xl border border-teal-200/50">
                        <div className="text-sm text-gray-600 mb-1">Tyres</div>
                        <div className="font-bold text-gray-800 text-lg">
                          {vehicle.tyres}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 rounded-2xl border border-purple-200/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 flex items-center space-x-2">
                          <Clock size={16} />
                          <span>Your Duration</span>
                        </span>
                        <span className="font-bold text-gray-800 text-lg">
                          {vehicle.customerDuration} hours
                        </span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-4 rounded-2xl border border-green-200/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 flex items-center space-x-2">
                          <MapPin size={16} />
                          <span>Route</span>
                        </span>
                        <span className="font-bold text-gray-800">
                          {searchData.fromPincode} → {searchData.toPincode}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-4 rounded-2xl border border-orange-200/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 flex items-center space-x-2">
                          <Calendar size={16} />
                          <span>Start Time</span>
                        </span>
                        <span className="font-bold text-gray-800 text-sm">
                          {formatDateTime(searchData.startTime)}
                        </span>
                      </div>
                    </div>
                  </div>

                 
                  <button
                    onClick={() => handleBooking(vehicle.id, vehicle.name)}
                    disabled={booking === vehicle.id}
                    className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-2xl hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-glow-lg transform hover:scale-105"
                  >
                    {booking === vehicle.id ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Booking...</span>
                      </>
                    ) : (
                      <>
                        <Calendar size={20} />
                        <span>Book Now</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchAndBook

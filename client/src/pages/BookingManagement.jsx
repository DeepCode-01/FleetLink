import React, { useState, useEffect } from "react"
import {
  Calendar,
  Truck,
  MapPin,
  Clock,
  X,
  Loader2,
  User,
  Hash,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react"
import { useToast } from "../components/Toaster"
import axios from "axios"

const BookingManagement = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)
  const [filter, setFilter] = useState("all")
  const { showToast } = useToast()

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/bookings")
      setBookings(response.data)
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch bookings"
      showToast("error", message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId, vehicleName) => {
    setCancelling(bookingId)

    try {
      await axios.delete(`http://localhost:5000/api/bookings/${bookingId}`)
      setBookings(prev =>
        prev.map(booking =>
          booking.id === bookingId
            ? { ...booking, status: "cancelled" }
            : booking
        )
      )
      showToast(
        "success",
        `Booking for "${vehicleName}" cancelled successfully`
      )
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to cancel booking"
      showToast("error", message)
    } finally {
      setCancelling(null)
    }
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

  const getStatusConfig = status => {
    switch (status) {
      case "confirmed":
        return {
          color: "bg-emerald-100 text-emerald-800 border-emerald-200",
          icon: CheckCircle,
          iconColor: "text-emerald-500"
        }
      case "completed":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: CheckCircle,
          iconColor: "text-blue-500"
        }
      case "cancelled":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: XCircle,
          iconColor: "text-red-500"
        }
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: AlertCircle,
          iconColor: "text-gray-500"
        }
    }
  }

  const canCancelBooking = booking => {
    return (
      booking.status === "confirmed" && new Date(booking.startTime) > new Date()
    )
  }

  const filteredBookings = bookings.filter(
    booking => filter === "all" || booking.status === filter
  )

  const getFilterCount = status => {
    if (status === "all") return bookings.length
    return bookings.filter(booking => booking.status === status).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4 text-gray-600">
          <Loader2 className="animate-spin w-12 h-12 text-blue-500" />
          <span className="text-xl font-medium">Loading bookings...</span>
        </div>
      </div>
    )
  }

  return (
    <>
    <div className="space-y-8 animate-fade-in">
       {/* Header  */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 p-8 text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-teal-600/90 animate-gradient-x"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative p-3 bg-white/20 rounded-2xl backdrop-blur-sm group hover:scale-110 transition-transform duration-300">
                <Calendar size={28} className="animate-bounce-gentle" />
                <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">Booking Management</h1>
                <p className="text-blue-100 text-lg">
                  {bookings.length > 0
                    ? `Manage your ${bookings.length} booking${
                        bookings.length !== 1 ? "s" : ""
                      }`
                    : "No bookings found"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex flex-wrap gap-3">
            {[
              { key: "all", label: "All Bookings" },
              { key: "confirmed", label: "Confirmed" },
              { key: "completed", label: "Completed" },
              { key: "cancelled", label: "Cancelled" }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                  filter === key
                    ? "bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg scale-105"
                    : "bg-gray-100/80 text-gray-600 hover:bg-gray-200/80 hover:scale-105"
                }`}
              >
                <span>{label}</span>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-bold ${
                    filter === key
                      ? "bg-white/20 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {getFilterCount(key)}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-16 text-center">
          <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Calendar className="text-gray-400" size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            {filter === "all" ? "No bookings yet" : `No ${filter} bookings`}
          </h3>
          <p className="text-gray-600 text-lg">
            {filter === "all"
              ? "Start by searching and booking a vehicle for your next journey."
              : `You don't have any ${filter} bookings at the moment.`}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredBookings.map((booking, index) => {
            const statusConfig = getStatusConfig(booking.status)
            const StatusIcon = statusConfig.icon

            return (
              <div
                key={booking.id}
                className="group bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-glow-lg transition-all duration-500 transform hover:-translate-y-1 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Booking Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative p-3 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl text-white shadow-lg group-hover:shadow-glow transition-all duration-300">
                      <Truck size={24} />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-xl mb-1">
                        {booking.vehicleId.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Hash size={14} />
                        <span>Booking ID: {booking.id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div
                      className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-sm font-bold border ${statusConfig.color}`}
                    >
                      <StatusIcon
                        size={16}
                        className={statusConfig.iconColor}
                      />
                      <span>
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </span>
                    </div>
                    {canCancelBooking(booking) && (
                      <button
                        onClick={() =>
                          handleCancelBooking(
                            booking.id,
                            booking.vehicleId.name
                          )
                        }
                        disabled={cancelling === booking.id}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300 disabled:opacity-50 hover:scale-110"
                        title="Cancel booking"
                      >
                        {cancelling === booking.id ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <X size={18} />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Booking Details Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Customer & Vehicle Info */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wide">
                      Customer & Vehicle
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200/50">
                        <span className="text-gray-600 flex items-center space-x-2">
                          <User size={16} />
                          <span>Customer:</span>
                        </span>
                        <span className="font-bold text-gray-800">
                          {booking.customerId}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-2xl border border-teal-200/50">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="font-bold text-gray-800">
                          {booking.vehicleId.capacityKg.toLocaleString()} KG
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl border border-purple-200/50">
                        <span className="text-gray-600">Tyres:</span>
                        <span className="font-bold text-gray-800">
                          {booking.vehicleId.tyres}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Route & Duration */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wide">
                      Route & Duration
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl border border-green-200/50">
                        <span className="text-gray-600 flex items-center space-x-2">
                          <MapPin size={16} />
                          <span>Route:</span>
                        </span>
                        <span className="font-bold text-gray-800">
                          {booking.fromPincode} → {booking.toPincode}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl border border-orange-200/50">
                        <span className="text-gray-600 flex items-center space-x-2">
                          <Clock size={16} />
                          <span>Duration:</span>
                        </span>
                        <span className="font-bold text-gray-800">
                          {booking.estimatedRideDurationHours.toFixed(1)} hours
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Timing */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wide">
                      Timing
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-2xl border border-indigo-200/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-600 text-sm">Start:</span>
                          <span className="font-bold text-gray-800 text-sm">
                            {formatDateTime(booking.startTime)}
                          </span>
                        </div>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-pink-50 to-pink-100/50 rounded-2xl border border-pink-200/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-600 text-sm">End:</span>
                          <span className="font-bold text-gray-800 text-sm">
                            {formatDateTime(booking.endTime)}
                          </span>
                        </div>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border border-gray-200/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-600 text-sm">Booked:</span>
                          <span className="font-bold text-gray-800 text-sm">
                            {formatDateTime(booking.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
    </>
  )
}

export default BookingManagement

import React, { useState } from "react"
import { Truck, Plus, Loader2, Zap, Settings, CheckCircle } from "lucide-react"
import { useToast } from "../components/Toaster"
import axios from "axios"

const AddVehicle = () => {
  const [formData, setFormData] = useState({
    name: "",
    capacityKg: "",
    tyres: ""
  })
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [addedVehicles, setAddedVehicles] = useState([])
  const { showToast } = useToast()

  const handleSubmit = async e => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.capacityKg || !formData.tyres) {
      showToast("error", "Please fill in all fields")
      return
    }

    const capacityKg = parseFloat(formData.capacityKg)
    const tyres = parseInt(formData.tyres)

    if (isNaN(capacityKg) || capacityKg <= 0) {
      showToast("error", "Capacity must be a positive number")
      return
    }

    if (isNaN(tyres) || tyres < 2) {
      showToast("error", "Vehicle must have at least 2 tyres")
      return
    }

    setLoading(true)

    try {
      const response = await axios.post("https://fleetlink-deep.onrender.com/api/vehicles", {
        name: formData.name.trim(),
        capacityKg,
        tyres
      })

      showToast(
        "success",
        `Vehicle "${response.data.name}" added successfully!`
      )

      setAddedVehicles(prev => [response.data, ...prev])

     
      setFormData({ name: "", capacityKg: "", tyres: "" })
    } catch (error) {
      const message = error.response?.data?.message || "Failed to add vehicle"
      showToast("error", message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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
    <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden hover:shadow-glow-lg transition-all duration-500">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 p-8 text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-teal-600/90 animate-gradient-x"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative p-3 bg-white/20 rounded-2xl backdrop-blur-sm group hover:scale-110 transition-transform duration-300">
                <Plus size={28} className="animate-bounce-gentle" />
                <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">Add New Vehicle</h1>
                <p className="text-blue-100 text-lg">
                  Expand your fleet with cutting-edge vehicles
                </p>
              </div>
            </div>
            <div className="hidden lg:flex items-center space-x-4 text-white/80">
              <div className="flex items-center space-x-2">
                <Zap size={20} />
                <span className="text-sm">Quick Setup</span>
              </div>
              <div className="flex items-center space-x-2">
                <Settings size={20} />
                <span className="text-sm">Smart Config</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Vehicle Name */}
            <div className="lg:col-span-3">
              <label
                htmlFor="name"
                className=" text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2"
              >
                <Truck size={16} className="text-blue-500" />
                <span>Vehicle Name</span>
              </label>
              <div className="relative group">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="e.g., Lightning Delivery Truck #1"
                  className={`w-full px-6 py-4 rounded-2xl border-2 font-medium transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400 ${
                    focusedField === "name"
                      ? "border-blue-500 ring-4 ring-blue-500/20 shadow-glow scale-105"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-lg"
                  }`}
                  disabled={loading}
                />
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-teal-500/10 opacity-0 transition-opacity duration-300 pointer-events-none ${
                    focusedField === "name" ? "opacity-100" : ""
                  }`}
                ></div>
              </div>
            </div>

            
            <div className="lg:col-span-1">
              <label
                htmlFor="capacityKg"
                className="block text-sm font-bold text-gray-700 mb-3"
              >
                Capacity (KG)
              </label>
              <div className="relative group">
                <input
                  type="number"
                  id="capacityKg"
                  name="capacityKg"
                  value={formData.capacityKg}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("capacity")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="1000"
                  min="1"
                  step="0.1"
                  className={`w-full px-6 py-4 rounded-2xl border-2 font-medium transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400 ${
                    focusedField === "capacity"
                      ? "border-blue-500 ring-4 ring-blue-500/20 shadow-glow scale-105"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-lg"
                  }`}
                  disabled={loading}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">
                  KG
                </div>
              </div>
            </div>

          
            <div className="lg:col-span-1">
              <label
                htmlFor="tyres"
                className="block text-sm font-bold text-gray-700 mb-3"
              >
                Number of Tyres
              </label>
              <div className="relative group">
                <input
                  type="number"
                  id="tyres"
                  name="tyres"
                  value={formData.tyres}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("tyres")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="4"
                  min="2"
                  step="1"
                  className={`w-full px-6 py-4 rounded-2xl border-2 font-medium transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400 ${
                    focusedField === "tyres"
                      ? "border-blue-500 ring-4 ring-blue-500/20 shadow-glow scale-105"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-lg"
                  }`}
                  disabled={loading}
                />
              </div>
            </div>

          
            <div className="lg:col-span-1 flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-glow-lg transform hover:scale-105 hover:-translate-y-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={22} />
                    <span>Adding Vehicle...</span>
                  </>
                ) : (
                  <>
                    <Truck size={22} />
                    <span>Add Vehicle</span>
                  </>
                )}
              </button>
            </div>
          </div>

        
          <div className="grid md:grid-cols-3 gap-6 pt-8 border-t border-gray-200/50">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 rounded-2xl border border-blue-200/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-blue-500 rounded-lg text-white">
                  <Truck size={20} />
                </div>
                <h3 className="font-bold text-gray-800">Fleet Ready</h3>
              </div>
              <p className="text-sm text-gray-600">
                Instantly available for bookings once added
              </p>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 p-6 rounded-2xl border border-teal-200/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-teal-500 rounded-lg text-white">
                  <Zap size={20} />
                </div>
                <h3 className="font-bold text-gray-800">Smart Matching</h3>
              </div>
              <p className="text-sm text-gray-600">
                Automatic capacity-based vehicle suggestions
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-6 rounded-2xl border border-purple-200/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-purple-500 rounded-lg text-white">
                  <Settings size={20} />
                </div>
                <h3 className="font-bold text-gray-800">Easy Management</h3>
              </div>
              <p className="text-sm text-gray-600">
                Track bookings and availability in real-time
              </p>
            </div>
          </div>
        </form>
      </div>

      
      {addedVehicles.length > 0 && (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-slide-up">
          <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-6 text-white overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 to-teal-600/90 animate-gradient-x"></div>
            <div className="relative z-10 flex items-center space-x-4">
              <div className="relative p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <CheckCircle size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  Recently Added Vehicles
                </h2>
                <p className="text-green-100">
                  {addedVehicles.length} vehicle
                  {addedVehicles.length !== 1 ? "s" : ""} added successfully
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {addedVehicles.map((vehicle, index) => (
              <div
                key={vehicle.id}
                className="group bg-gradient-to-r from-white to-gray-50/50 rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300 hover:scale-102 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white shadow-lg">
                      <Truck size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">
                        {vehicle.name}
                      </h3>
                      <p className="text-sm text-gray-500">ID: {vehicle.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-gray-800">
                        {vehicle.capacityKg.toLocaleString()}
                      </div>
                      <div className="text-gray-500">KG Capacity</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-gray-800">
                        {vehicle.tyres}
                      </div>
                      <div className="text-gray-500">Tyres</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-gray-800">
                        {formatDateTime(vehicle.createdAt)}
                      </div>
                      <div className="text-gray-500">Added</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AddVehicle

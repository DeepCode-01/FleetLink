import React, { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Truck, Search, Plus, Calendar, Menu, X } from "lucide-react"

const Navbar = () => {
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { path: "/search", label: "Search & Book", icon: Search },
    { path: "/add-vehicle", label: "Add Vehicle", icon: Plus },
    { path: "/bookings", label: "Bookings", icon: Calendar }
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-lg shadow-blue-500/5"
          : "bg-white/70 backdrop-blur-md border-b border-gray-200/30"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
        
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative p-2 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl text-white shadow-lg group-hover:shadow-glow transition-all duration-300 group-hover:scale-105">
              <Truck size={24} className="relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent animate-gradient-x">
                FleetLink
              </span>
              <div className="text-xs text-gray-500 font-medium">
                Smart Fleet Solutions
              </div>
            </div>
          </Link>

         
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`group relative flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                  location.pathname === path
                    ? "bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg shadow-blue-500/25 scale-105"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100/80 hover:scale-105"
                }`}
              >
                <Icon
                  size={18}
                  className={`transition-transform duration-300 ${
                    location.pathname === path
                      ? "animate-bounce-gentle"
                      : "group-hover:scale-110"
                  }`}
                />
                <span className="relative">
                  {label}
                  {location.pathname === path && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white/50 rounded-full"></div>
                  )}
                </span>
              </Link>
            ))}
          </div>

         
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100/80 transition-all duration-200"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

       
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            isMobileMenuOpen ? "max-h-64 pb-4" : "max-h-0"
          }`}
        >
          <div className="space-y-2 pt-4 border-t border-gray-200/50">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  location.pathname === path
                    ? "bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100/80"
                }`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
    </>
  )
}

export default Navbar

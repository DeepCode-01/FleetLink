import React, { createContext, useContext, useState, useCallback } from "react"
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react"

const ToastContext = createContext(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((type, message) => {
    const id = Math.random()
      .toString(36)
      .substr(2, 9)
    const toast = { id, type, message }

    setToasts(prev => [...prev, toast])

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = useCallback(id => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
        {toasts.map(toast => (
          <ToastMessage key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const ToastMessage = ({ toast, onRemove }) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle
  }

  const colors = {
    success:
      "bg-emerald-50/95 border-emerald-200/50 text-emerald-800 shadow-emerald-500/10",
    error: "bg-red-50/95 border-red-200/50 text-red-800 shadow-red-500/10",
    warning:
      "bg-amber-50/95 border-amber-200/50 text-amber-800 shadow-amber-500/10"
  }

  const iconColors = {
    success: "text-emerald-500",
    error: "text-red-500",
    warning: "text-amber-500"
  }

  const Icon = icons[toast.type]

  return (
    <div
      className={`flex items-start p-4 rounded-xl border backdrop-blur-xl shadow-xl transition-all duration-500 animate-slide-down hover:scale-105 ${
        colors[toast.type]
      }`}
    >
      <Icon
        className={`w-5 h-5 mr-3 flex-shrink-0 mt-0.5 ${
          iconColors[toast.type]
        }`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-relaxed">{toast.message}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-3 p-1.5 rounded-lg hover:bg-black/10 transition-all duration-200 hover:scale-110 flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export const Toaster = () => (
  <ToastProvider>
    <div />
  </ToastProvider>
)

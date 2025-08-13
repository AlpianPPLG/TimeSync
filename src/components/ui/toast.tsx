"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface ToastProps {
  title?: string
  description?: string
  type?: "success" | "error" | "warning" | "info"
  onClose?: () => void
}

export function Toast({ title, description, type = "info", onClose }: ToastProps) {
  const [isVisible, setIsVisible] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 4000)

    return () => clearTimeout(timer)
  }, [onClose])

  if (!isVisible) return null

  const typeStyles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  }

  return (
    <div className={cn("fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg max-w-sm", typeStyles[type])}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {title && <div className="font-medium">{title}</div>}
          {description && <div className="text-sm mt-1">{description}</div>}
        </div>
        <Button
          onClick={() => {
            setIsVisible(false)
            onClose?.()
          }}
          className="ml-2 opacity-70 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Toast context and hook
interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "warning" | "info") => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<
    Array<{
      id: string
      message: string
      type: "success" | "error" | "warning" | "info"
    }>
  >([])

  const showToast = React.useCallback((message: string, type: "success" | "error" | "warning" | "info" = "info") => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} description={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}

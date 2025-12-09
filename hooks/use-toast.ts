"use client"

import { useState, useEffect, useCallback } from "react"

type ToastVariant = "default" | "success" | "error" | "warning" | "info" | "destructive"

interface ToastProps {
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

interface Toast {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
  visible: boolean
}

// Créer un store global pour éviter les boucles infinies
let toastsStore: Toast[] = []
let listeners: Array<(toasts: Toast[]) => void> = []

const updateToasts = (newToasts: Toast[]) => {
  toastsStore = newToasts
  listeners.forEach((listener) => listener(toastsStore))
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(toastsStore)

  useEffect(() => {
    // S'abonner aux changements
    listeners.push(setToasts)
    return () => {
      listeners = listeners.filter((listener) => listener !== setToasts)
    }
  }, [])

  const toast = useCallback(({ title, description, variant = "default", duration = 3000 }: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: Toast = {
      id,
      title,
      description,
      variant,
      duration,
      visible: true,
    }

    updateToasts([...toastsStore, newToast])

    setTimeout(() => {
      updateToasts(toastsStore.map((toast) => (toast.id === id ? { ...toast, visible: false } : toast)))

      setTimeout(() => {
        updateToasts(toastsStore.filter((toast) => toast.id !== id))
      }, 300) // Animation duration
    }, duration)

    return id
  }, [])

  return { toast, toasts }
}

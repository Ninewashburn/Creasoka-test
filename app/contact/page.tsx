"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Instagram, Facebook, Mail } from "lucide-react"
import { motion } from "framer-motion"
import { logger } from "@/lib/sentry"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue")
      }

      setIsSubmitted(true)
      setFormData({ name: "", email: "", message: "" })

      // Reset success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000)
    } catch (error) {
      logger.error("Erreur d'envoi:", error)
      // Ici on pourrait ajouter une notification d'erreur (toast)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }

  const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.5 },
  }

  if (!mounted) return null

  return (
    <motion.div
      className="container mx-auto px-4 py-12"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      <motion.h1
        className="text-3xl md:text-4xl font-bold text-center mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Contact
      </motion.h1>
      <motion.p
        className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Vous avez des questions ou souhaitez passer une commande personnalisée ? N&apos;hésitez pas à me contacter !
      </motion.p>

      <motion.div
        className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-semibold mb-6">Informations de contact</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            N&apos;hésitez pas à me contacter pour toute question ou demande de création personnalisée.
            <br />
            <span className="text-sm mt-2 block">
              Envie d&apos;en savoir plus sur mon travail ?{" "}
              <a href="/a-propos" className="text-creasoka hover:underline font-medium">
                Découvrez mon histoire
              </a>
              .
            </span>
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Email</h3>
              <p className="text-gray-600 dark:text-gray-400">contact@creasoka.com</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Basé à</h3>
              <p className="text-gray-600 dark:text-gray-400">Paris, France</p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Suivez-moi</h3>
            <div className="flex space-x-4">
              <motion.a
                href="#"
                className="text-gray-600 hover:text-creasoka transition-colors duration-300"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <Instagram className="h-6 w-6" />
                <span className="sr-only">Instagram</span>
              </motion.a>
              <motion.a
                href="#"
                className="text-gray-600 hover:text-creasoka transition-colors duration-300"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <Facebook className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </motion.a>
              <motion.a
                href="mailto:contact@creasoka.com"
                className="text-gray-600 hover:text-creasoka transition-colors duration-300"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <Mail className="h-6 w-6" />
                <span className="sr-only">Email</span>
              </motion.a>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-semibold mb-6">Envoyez-moi un message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Nom
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="transition-all duration-300 focus:ring-2 focus:ring-creasoka focus:border-creasoka hover:border-creasoka"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="transition-all duration-300 focus:ring-2 focus:ring-creasoka focus:border-creasoka hover:border-creasoka"
                required
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1">
                Message
              </label>
              <Textarea
                id="message"
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                className="transition-all duration-300 focus:ring-2 focus:ring-creasoka focus:border-creasoka hover:border-creasoka"
                required
              />
            </div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                type="submit"
                className="w-full bg-creasoka hover:bg-creasoka/90 shadow-md hover:shadow-lg transition-all duration-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Envoi en cours..." : "Envoyer"}
              </Button>
            </motion.div>

            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-green-100 text-green-800 rounded-md text-sm"
              >
                Votre message a été envoyé avec succès. Je vous répondrai dans les plus brefs délais.
              </motion.div>
            )}
          </form>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Une erreur est survenue");
        return;
      }

      setIsSuccess(true);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-center mb-4">
              Email envoyé !
            </h1>

            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Si un compte existe avec l&apos;adresse <strong>{email}</strong>, vous
              recevrez un email avec les instructions pour réinitialiser votre
              mot de passe.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                💡 <strong>Astuce :</strong> Vérifiez également votre dossier
                spam si vous ne recevez pas l&apos;email dans les prochaines minutes.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full bg-creasoka hover:bg-creasoka/90"
                asChild
              >
                <Link href="/admin">Retour à la connexion</Link>
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsSuccess(false);
                  setEmail("");
                }}
              >
                Envoyer à une autre adresse
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <Link
            href="/admin"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-creasoka mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Link>

          <div className="flex justify-center mb-6">
            <div className="bg-creasoka/10 p-3 rounded-full">
              <Mail className="h-12 w-12 text-creasoka" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">
            Mot de passe oublié ?
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            Pas de problème ! Entrez votre adresse email et nous vous enverrons
            un lien pour réinitialiser votre mot de passe.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="mt-1"
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-800 dark:text-red-300">
                  {error}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-creasoka hover:bg-creasoka/90"
              disabled={isLoading}
            >
              {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Vous vous souvenez de votre mot de passe ?{" "}
              <Link href="/admin" className="text-creasoka hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

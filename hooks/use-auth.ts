"use client";

import { logger } from "@/lib/sentry";

import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

// Utiliser l'environnement plutôt qu'une constante codée en dur
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    async function checkAuthStatus() {
      if (IS_DEVELOPMENT) {
        // En développement uniquement, auto-authentification
        setIsAuthenticated(true);
        setUser({
          id: "admin",
          email: "admin@creasoka.com",
          role: "admin",
        });
      } else {
        // En production, vérifier réellement l'authentification
        try {
          // Utiliser la route existante avec GET au lieu de /api/auth/check
          const response = await fetch("/api/auth", {
            method: "GET",
            credentials: "include", // Important pour envoyer les cookies
          });

          if (response.ok) {
            const data = await response.json();
            setIsAuthenticated(data.authenticated);
            if (data.authenticated) {
              setUser(data.user);
            }
          } else {
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch (error) {
          logger.error(
            "Erreur lors de la vérification de l'authentification:",
            error
          );
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setIsLoading(false);
    }

    checkAuthStatus();
  }, []);

  // Fonction de connexion
  const login = async (email: string, password: string): Promise<boolean> => {
    if (IS_DEVELOPMENT) {
      // En développement, accepter n'importe quels identifiants
      setIsAuthenticated(true);
      setUser({
        id: "admin",
        email: email || "admin@creasoka.com",
        role: "admin",
      });
      return true;
    }

    // En production, vérifier les identifiants
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsAuthenticated(true);
        setUser(data.user);
        return true;
      } else {
        logger.error("Échec de la connexion (Client):", new Error(data.message));
        return false;
      }
    } catch (error) {
      logger.error("Erreur lors de la connexion:", error);
      return false;
    }
  };

  // Fonction de déconnexion
  const logout = async (): Promise<void> => {
    if (IS_DEVELOPMENT) {
      // En développement, simuler la déconnexion
      logger.debug("Déconnexion simulée (mode développement)");
      setIsAuthenticated(false);
      setUser(null);
      window.location.href = "/";
      return;
    }

    // En production, déconnexion réelle
    try {
      await fetch("/api/auth", {
        method: "DELETE",
        credentials: "include",
      });
    } catch (error) {
      logger.error("Erreur lors de la déconnexion:", error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      // Rediriger vers la page d'accueil après la déconnexion
      window.location.href = "/";
    }
  };

  return { isAuthenticated, isLoading, user, login, logout };
}

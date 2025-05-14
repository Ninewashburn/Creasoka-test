"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Vérifie l'état d'authentification au chargement
  useEffect(() => {
    async function checkAuthStatus() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/auth", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(data.authenticated);
          if (data.authenticated) {
            setUser(data.user);
          }
        } else {
          // C'est un comportement normal quand l'utilisateur n'est pas authentifié
          // Ne pas afficher d'erreur dans la console
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        // Ne pas logger d'erreur pour les problèmes d'authentification normaux
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuthStatus();
  }, []);

  // Fonction de connexion
  const login = async (email: string, password: string): Promise<boolean> => {
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
        console.error("Échec de la connexion:", data.message);
        return false;
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      return false;
    }
  };

  // Fonction de déconnexion
  const logout = async (): Promise<void> => {
    try {
      await fetch("/api/auth", {
        method: "DELETE",
        credentials: "include",
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      // Rediriger vers la page d'accueil après la déconnexion
      window.location.href = "/";
    }
  };

  return { isAuthenticated, isLoading, user, login, logout };
}

"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

// Pour le debugging uniquement - sera toujours authentifié
const ALWAYS_AUTHENTICATED = true;

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(ALWAYS_AUTHENTICATED);
  const [isLoading, setIsLoading] = useState(false); // Éviter le chargement inutile
  const [user, setUser] = useState<User | null>({
    id: "admin",
    email: "admin@creasoka.com",
    role: "admin",
  });

  // Fonction de connexion (simplifiée)
  const login = async (email: string, password: string): Promise<boolean> => {
    // Accepter n'importe quelles identifiants en mode de débogage
    setIsAuthenticated(true);
    if (!user) {
      setUser({
        id: "admin",
        email: email || "admin@creasoka.com",
        role: "admin",
      });
    }
    return true;

    /* Code original commenté
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
    */
  };

  // Fonction de déconnexion (simplifiée)
  const logout = async (): Promise<void> => {
    // En mode débogage, on ne fait pas de déconnexion réelle
    console.log("Déconnexion simulée (mode débogage)");

    /* Code original commenté
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
    */
  };

  return { isAuthenticated, isLoading, user, login, logout };
}

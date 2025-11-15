import { JwtPayload } from "./auth";

// Enum des rôles utilisateur
export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  GUEST = "guest",
}

// Enum des actions possibles
export enum Action {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
}

// Enum des ressources de l'application
export enum Resource {
  CREATION = "creation",
  USER = "user",
  UPLOAD = "upload",
}

// Matrice de permissions basée sur les rôles
const permissionsMatrix: Record<UserRole, Record<Resource, Action[]>> = {
  [UserRole.ADMIN]: {
    [Resource.CREATION]: [
      Action.CREATE,
      Action.READ,
      Action.UPDATE,
      Action.DELETE,
    ],
    [Resource.USER]: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE],
    [Resource.UPLOAD]: [Action.CREATE, Action.READ, Action.DELETE],
  },
  [UserRole.USER]: {
    [Resource.CREATION]: [Action.READ],
    [Resource.USER]: [Action.READ],
    [Resource.UPLOAD]: [],
  },
  [UserRole.GUEST]: {
    [Resource.CREATION]: [Action.READ],
    [Resource.USER]: [],
    [Resource.UPLOAD]: [],
  },
};

/**
 * Vérifie si un utilisateur a la permission d'effectuer une action sur une ressource
 */
export function hasPermission(
  user: JwtPayload | null,
  resource: Resource,
  action: Action
): boolean {
  // Si pas d'utilisateur, utiliser le rôle invité
  const role = (user?.role as UserRole) || UserRole.GUEST;

  // Vérifier si le rôle existe dans la matrice
  if (!permissionsMatrix[role]) {
    return false;
  }

  // Vérifier si la ressource existe pour ce rôle
  if (!permissionsMatrix[role][resource]) {
    return false;
  }

  // Vérifier si l'action est autorisée pour cette ressource et ce rôle
  return permissionsMatrix[role][resource].includes(action);
}

/**
 * Obtient le rôle d'un utilisateur à partir du token
 */
export function getUserRole(user: JwtPayload | null): UserRole {
  return (user?.role as UserRole) || UserRole.GUEST;
}

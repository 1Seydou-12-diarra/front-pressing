// src/components/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";

export default function PrivateRoute({ children, roles }) {
  const { keycloak, initialized } = useKeycloak();

  // 🔥 1️⃣ Attendre l'initialisation
  if (!initialized) {
    return <div>Loading...</div>;
  }

  // 🔥 2️⃣ Vérifier que keycloak existe
  if (!keycloak) {
    return <div>Keycloak not ready</div>;
  }

  // 🔥 3️⃣ Si pas connecté → login
  if (!keycloak.authenticated) {
    keycloak.login();
    return null;
  }

  // 🔥 4️⃣ Vérifier les rôles
  const userRoles = keycloak.tokenParsed?.realm_access?.roles || [];

  const hasRole = roles.some((role) => userRoles.includes(role));

  if (!hasRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
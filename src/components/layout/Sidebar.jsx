// src/components/layout/Sidebar.jsx
import React from "react";
import { List, ListItemButton, ListItemText, Box, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";

export default function Sidebar() {
  const navigate = useNavigate();
  const { keycloak, initialized } = useKeycloak();

  const userRoles = keycloak?.tokenParsed?.realm_access?.roles || [];

  const menuItems = [
    { label: "Dashboard", path: "/dashboard", roles: ["ROLE_ADMIN", "ROLE_MANAGER"] },
    { label: "Clients", path: "/clients", roles: ["ROLE_ADMIN", "ROLE_EMPLOYE", "ROLE_CAISSIER"] },
    { label: "Users", path: "/users", roles: ["ROLE_ADMIN"] },
  ];

  if (!initialized) return null;

  return (
    <Box
      sx={{
        width: 240,           // largeur fixe
        bgcolor: "#1976d2",   // couleur de fond
        color: "#fff",
        height: "100vh",       // prend toute la hauteur
        p: 2,
      }}
    >
      <List>
        {menuItems
          .filter(item => item.roles.some(role => userRoles.includes(role)))
          .map(item => (
            <ListItemButton
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{ color: "#fff", mb: 1, borderRadius: 1 }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
      </List>
      <Divider sx={{ bgcolor: "#fff", mt: 2 }} />
      <Box sx={{ mt: 2, fontSize: 12 }}>Logged in as: {keycloak?.tokenParsed?.preferred_username}</Box>
    </Box>
  );
}
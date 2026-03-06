// src/components/layout/Sidebar.jsx
import React from "react";
import {
  List, ListItemButton, ListItemText, Box, Divider,
  Typography, Avatar, Button, Tooltip,
} from "@mui/material";
import {
  Dashboard, People, ManageAccounts, ShoppingBag,
  PointOfSale, Logout,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";

const ICONS = {
  "/dashboard": <Dashboard fontSize="small" />,
  "/clients":   <People fontSize="small" />,
  "/commandes": <ShoppingBag fontSize="small" />,
  "/caisse":    <PointOfSale fontSize="small" />,
};

const menuItems = [
  { label: "Dashboard", path: "/dashboard", roles: ["ROLE_ADMIN", "ROLE_MANAGER"] },
  { label: "Clients",   path: "/clients",   roles: ["ROLE_ADMIN", "ROLE_EMPLOYE", "ROLE_CAISSIER"] },
  { label: "Commandes", path: "/commandes", roles: ["ROLE_ADMIN", "ROLE_CAISSIER", "ROLE_MANAGER", "ROLE_EMPLOYE"] },
  { label: "Caisse",    path: "/caisse",    roles: ["ROLE_ADMIN", "ROLE_CAISSIER"] },
];

export default function Sidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { keycloak, initialized } = useKeycloak();

  const userRoles = keycloak?.tokenParsed?.realm_access?.roles || [];
  const username  = keycloak?.tokenParsed?.preferred_username || "—";
  const initiales = username.slice(0, 2).toUpperCase();

  const hasAccess = (roles) => roles.some((r) => userRoles.includes(r));

  const handleLogout = () => {
    // Keycloak invalide la session et redirige directement vers son login
    keycloak.logout({
      redirectUri: window.location.origin,
    });
  };

  if (!initialized) return null;

  return (
    <Box
      sx={{
        width: 240,
        bgcolor: "#1a1a2e",
        color: "#fff",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        p: 2,
        boxSizing: "border-box",
      }}
    >
      {/* Logo */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3, px: 1 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: "#e94560", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
          👔
        </Box>
        <Typography fontWeight={700} sx={{ color: "#eaeaea", fontSize: 15, letterSpacing: "-0.3px" }}>
          PressGest
        </Typography>
      </Box>

      <Divider sx={{ borderColor: "#0f3460", mb: 2 }} />

      {/* Menu */}
      <List disablePadding sx={{ flex: 1 }}>
        {menuItems
          .filter((item) => hasAccess(item.roles))
          .map((item) => {
            const active = location.pathname === item.path;
            return (
              <ListItemButton
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2, mb: 0.5,
                  color: active ? "#fff" : "#8892a4",
                  bgcolor: active ? "#e94560" : "transparent",
                  "&:hover": { bgcolor: active ? "#c73652" : "#0f3460", color: "#fff" },
                  gap: 1.5,
                  transition: "all 0.15s",
                }}
              >
                <Box sx={{ color: active ? "#fff" : "#8892a4", display: "flex" }}>
                  {ICONS[item.path]}
                </Box>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 400 }}
                />
              </ListItemButton>
            );
          })}
      </List>

      {/* Footer */}
      <Box>
        <Divider sx={{ borderColor: "#0f3460", mb: 2 }} />

        {/* User info */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 1, mb: 2 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: "#e94560", fontSize: 12, fontWeight: 700 }}>
            {initiales}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" fontWeight={600} sx={{ color: "#eaeaea", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {username}
            </Typography>
            <Typography variant="caption" sx={{ color: "#8892a4", fontSize: 10 }}>
              {userRoles.find((r) => r.startsWith("ROLE_"))?.replace("ROLE_", "") || "USER"}
            </Typography>
          </Box>
        </Box>

        {/* Bouton déconnexion */}
        <Tooltip title="Se déconnecter de Keycloak">
          <Button
            fullWidth
            startIcon={<Logout fontSize="small" />}
            onClick={handleLogout}
            sx={{
              color: "#8892a4",
              bgcolor: "transparent",
              border: "1px solid #0f3460",
              borderRadius: 2,
              textTransform: "none",
              fontSize: 13,
              fontWeight: 500,
              justifyContent: "flex-start",
              px: 2,
              "&:hover": {
                bgcolor: "#2d1117",
                color: "#f44336",
                borderColor: "#f4433640",
              },
              transition: "all 0.15s",
            }}
          >
            Déconnexion
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );
}
// src/components/layout/Header.jsx
import React from "react";
import { AppBar, Toolbar, Typography, IconButton, Box, Chip } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { LocalLaundryService } from "@mui/icons-material";
import { useKeycloak } from "@react-keycloak/web";
import NotificationBell from "./NotificationBell";

export default function Header({ user, onDrawerToggle }) {
  const { keycloak } = useKeycloak();
  const username = keycloak?.tokenParsed?.preferred_username;
  const agenceId = keycloak?.tokenParsed?.agenceId;

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: "#1a1a2e",
        borderBottom: "1px solid #0f3460",
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        {/* Bouton menu mobile */}
        <IconButton
          color="inherit"
          edge="start"
          onClick={onDrawerToggle}
          sx={{ mr: 1, display: { sm: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        {/* ── Logo ── */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 36, height: 36,
              borderRadius: 2,
              bgcolor: "#e94560",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 12px #e9456050",
              flexShrink: 0,
            }}
          >
            <LocalLaundryService sx={{ color: "#fff", fontSize: 20 }} />
          </Box>

          <Box>
            <Typography
              variant="body1"
              fontWeight={800}
              sx={{
                color: "#eaeaea",
                letterSpacing: "-0.5px",
                lineHeight: 1,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Press<span style={{ color: "#e94560" }}>Gest</span>
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#8892a4", fontSize: 9, letterSpacing: "0.5px", textTransform: "uppercase" }}
            >
              Gestion de pressing
            </Typography>
          </Box>
        </Box>

        {/* Séparateur */}
        <Box sx={{ flex: 1 }} />

        {/* ── Zone droite : cloche + infos user ── */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>

          {/* Cloche notifications */}
          <NotificationBell />

          {/* Infos user (cachées sur mobile) */}
          <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 1 }}>
            {agenceId && (
              <Chip
                label={`Agence #${agenceId}`}
                size="small"
                sx={{
                  bgcolor: "#e9456015",
                  color: "#e94560",
                  fontSize: 11,
                  border: "1px solid #e9456040",
                  fontWeight: 600,
                }}
              />
            )}
            {username && (
              <Chip
                label={username}
                size="small"
                sx={{
                  bgcolor: "#0f3460",
                  color: "#8892a4",
                  fontSize: 11,
                  border: "1px solid #1e3a5f",
                }}
              />
            )}
          </Box>
        </Box>

      </Toolbar>
    </AppBar>
  );
}
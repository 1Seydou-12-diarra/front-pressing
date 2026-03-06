// src/components/layout/MainLayout.jsx
import React, { useState } from "react";
import { Box, Drawer, Toolbar } from "@mui/material";
import Sidebar from "./Sidebar";
import Header from "./Header";
import BreadcrumbsNav from "./BreadcrumbsNav";
import { Outlet } from "react-router-dom";

const drawerWidth = 240;

export default function MainLayout({ user }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>

      {/* Header fixe en haut */}
      <Header user={user} onDrawerToggle={handleDrawerToggle} />

      {/* Sidebar mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: "#1a1a2e",
            border: "none",
          },
        }}
      >
        <Sidebar user={user} />
      </Drawer>

      {/* Sidebar desktop permanente — position: relative pour s'intégrer dans le flex */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: "#1a1a2e",
            border: "none",
            position: "relative",  // ← clé du fix : sort du position:fixed par défaut
            height: "100vh",
          },
        }}
        open
      >
        <Sidebar user={user} />
      </Drawer>

      {/* Zone de contenu principale */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
          bgcolor: "#1a1a2e",
          minWidth: 0, // empêche le débordement flex
        }}
      >
        {/* Espace réservé sous le Header AppBar */}
        <Toolbar />

        {/* Fil d'Ariane */}
        <BreadcrumbsNav />

        {/* Contenu scrollable */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            overflowX: "hidden",
            p: 3,
          }}
        >
          <Outlet />
        </Box>
      </Box>

    </Box>
  );
}
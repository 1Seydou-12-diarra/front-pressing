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

    <Box sx={{ display: "flex" }}>
      <Header user={user} onDrawerToggle={handleDrawerToggle} />

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { width: drawerWidth },
        }}
      >
        <Sidebar user={user} />
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": { width: drawerWidth },
        }}
        open
      >
        <Sidebar user={user} />
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        <BreadcrumbsNav />
        <Outlet />
      </Box>
    </Box>
  );
}
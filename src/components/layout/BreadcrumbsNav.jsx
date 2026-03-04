import React from "react";
import { Breadcrumbs, Link, Typography } from "@mui/material";

export default function BreadcrumbsNav() {
  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
      <Link underline="hover" color="inherit" href="/">
        Accueil
      </Link>
      <Typography color="text.primary">Dashboard</Typography>
    </Breadcrumbs>
  );
}
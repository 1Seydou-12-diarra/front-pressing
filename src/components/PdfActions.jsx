// src/components/PdfActions.jsx
// Composant réutilisable — intègre les 3 actions PDF partout dans l'app
import { useState } from "react";
import {
  Box, Button, ButtonGroup, Tooltip, CircularProgress,
  Snackbar, Alert, Menu, MenuItem, ListItemIcon, ListItemText,
} from "@mui/material";
import {
  PictureAsPdf, OpenInNew, Download, Print,
  ExpandMore,
} from "@mui/icons-material";
import reportService from "../services/ReportService";

/**
 * Props :
 *   type       : "ticketDepot" | "factureClient" | "caJournalier"
 *   id         : Long (commandeId) — pour ticketDepot et factureClient
 *   date       : String "YYYY-MM-DD" — pour caJournalier
 *   variant    : "buttons" (défaut) | "menu" | "icon"
 *   size       : "small" (défaut) | "medium"
 *   label      : texte personnalisé (optionnel)
 */
export default function PdfActions({ type, id, date, variant = "buttons", size = "small", label }) {
  const [loading, setLoading] = useState(null); // "ouvrir" | "telecharger" | "imprimer" | null
  const [snack, setSnack]     = useState({ open: false, msg: "", severity: "success" });
  const [anchor, setAnchor]   = useState(null); // pour variant="menu"

  const notify = (msg, severity = "success") => setSnack({ open: true, msg, severity });

  const getService = () => {
    if (type === "ticketDepot")   return reportService.ticketDepot;
    if (type === "factureClient") return reportService.factureClient;
    if (type === "caJournalier")  return reportService.caJournalier;
    throw new Error(`Type inconnu : ${type}`);
  };

  const getParam = () => type === "caJournalier" ? date : id;

  const handle = async (action) => {
    setLoading(action);
    try {
      await getService()[action](getParam());
      if (action === "telecharger") notify("PDF téléchargé ✓");
      if (action === "imprimer")    notify("Impression lancée ✓");
    } catch (e) {
      console.error("PDF erreur:", e);
      notify("Erreur génération PDF", "error");
    } finally {
      setLoading(null);
      setAnchor(null);
    }
  };

  const isLoading = (action) => loading === action;
  const anyLoading = !!loading;

  // ── Variant : 3 boutons séparés ──────────────────────────────────────────
  if (variant === "buttons") {
    return (
      <>
        <ButtonGroup size={size} variant="outlined" disabled={anyLoading}>
          <Tooltip title="Ouvrir dans un nouvel onglet">
            <Button
              startIcon={isLoading("ouvrir") ? <CircularProgress size={12} /> : <OpenInNew fontSize="small" />}
              onClick={() => handle("ouvrir")}
              sx={btnSx}
            >
              {label || "Ouvrir"}
            </Button>
          </Tooltip>
          <Tooltip title="Télécharger le PDF">
            <Button
              startIcon={isLoading("telecharger") ? <CircularProgress size={12} /> : <Download fontSize="small" />}
              onClick={() => handle("telecharger")}
              sx={btnSx}
            >
              PDF
            </Button>
          </Tooltip>
          <Tooltip title="Imprimer directement">
            <Button
              startIcon={isLoading("imprimer") ? <CircularProgress size={12} /> : <Print fontSize="small" />}
              onClick={() => handle("imprimer")}
              sx={btnSx}
            >
              Imp.
            </Button>
          </Tooltip>
        </ButtonGroup>

        <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
          <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
        </Snackbar>
      </>
    );
  }

  // ── Variant : menu déroulant ─────────────────────────────────────────────
  if (variant === "menu") {
    return (
      <>
        <Button
          size={size}
          variant="outlined"
          startIcon={anyLoading ? <CircularProgress size={14} /> : <PictureAsPdf fontSize="small" />}
          endIcon={<ExpandMore fontSize="small" />}
          onClick={(e) => setAnchor(e.currentTarget)}
          disabled={anyLoading}
          sx={btnSx}
        >
          {label || "PDF"}
        </Button>

        <Menu
          anchorEl={anchor}
          open={Boolean(anchor)}
          onClose={() => setAnchor(null)}
          PaperProps={{ sx: { bgcolor: "#161b22", border: "1px solid #21262d", borderRadius: 2, minWidth: 180 } }}
        >
          <MenuItem onClick={() => handle("ouvrir")} sx={menuItemSx}>
            <ListItemIcon><OpenInNew fontSize="small" sx={{ color: "#58a6ff" }} /></ListItemIcon>
            <ListItemText primary="Ouvrir" primaryTypographyProps={{ fontSize: 13 }} />
          </MenuItem>
          <MenuItem onClick={() => handle("telecharger")} sx={menuItemSx}>
            <ListItemIcon><Download fontSize="small" sx={{ color: "#4ade80" }} /></ListItemIcon>
            <ListItemText primary="Télécharger" primaryTypographyProps={{ fontSize: 13 }} />
          </MenuItem>
          <MenuItem onClick={() => handle("imprimer")} sx={menuItemSx}>
            <ListItemIcon><Print fontSize="small" sx={{ color: "#fbbf24" }} /></ListItemIcon>
            <ListItemText primary="Imprimer" primaryTypographyProps={{ fontSize: 13 }} />
          </MenuItem>
        </Menu>

        <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
          <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
        </Snackbar>
      </>
    );
  }

  // ── Variant : icônes seules ───────────────────────────────────────────────
  return (
    <>
      <Box sx={{ display: "flex", gap: 0.5 }}>
        {[
          { action: "ouvrir",      icon: <OpenInNew fontSize="small" />, title: "Ouvrir",      color: "#58a6ff" },
          { action: "telecharger", icon: <Download  fontSize="small" />, title: "Télécharger", color: "#4ade80" },
          { action: "imprimer",    icon: <Print     fontSize="small" />, title: "Imprimer",    color: "#fbbf24" },
        ].map(({ action, icon, title, color }) => (
          <Tooltip key={action} title={title}>
            <span>
              <Button
                size="small"
                disabled={anyLoading}
                onClick={() => handle(action)}
                sx={{
                  minWidth: 32, width: 32, height: 32, p: 0,
                  color: isLoading(action) ? "#8b949e" : color,
                  bgcolor: `${color}15`,
                  border: `1px solid ${color}30`,
                  borderRadius: 1.5,
                  "&:hover": { bgcolor: `${color}25` },
                }}
              >
                {isLoading(action) ? <CircularProgress size={14} sx={{ color }} /> : icon}
              </Button>
            </span>
          </Tooltip>
        ))}
      </Box>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </>
  );
}

const btnSx = {
  textTransform: "none",
  fontSize: 12,
  borderColor: "#21262d",
  color: "#8b949e",
  "&:hover": { borderColor: "#58a6ff", color: "#58a6ff" },
};

const menuItemSx = {
  color: "#cdd9e5",
  fontSize: 13,
  "&:hover": { bgcolor: "#21262d" },
};
import { useState, useEffect, useCallback } from "react";
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Typography, Chip, IconButton, Tooltip, Tab, Tabs,
  Paper, InputAdornment, Snackbar, Alert, Divider, Avatar,
  Badge, Stack, CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Add, Search, Person, Phone, Email, Home,
  Stars, Block, Visibility, Edit, Close,
  CreditCard, Redeem, CheckCircle, Cancel,
} from "@mui/icons-material";
import clientService from "../services/ClientService"; // adapte le chemin

// ─── Palette & styles ─────────────────────────────────────────────────────────
const COLORS = {
  primary: "#1a1a2e",
  accent: "#e94560",
  gold: "#f0a500",
  surface: "#16213e",
  card: "#0f3460",
  text: "#eaeaea",
  muted: "#8892a4",
  success: "#4caf50",
  danger: "#f44336",
};

// ─── Composant TabPanel ────────────────────────────────────────────────────────
function TabPanel({ value, index, children }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

// ─── InfoRow ──────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.8 }}>
      <Box sx={{ color: COLORS.accent }}>{icon}</Box>
      <Typography variant="body2" sx={{ color: COLORS.muted, minWidth: 80 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ color: COLORS.text, fontWeight: 500 }}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

// ─── Formulaire initial ───────────────────────────────────────────────────────
const EMPTY_FORM = { nom: "", prenom: "", telephone: "", email: "", adresse: "" };
const EMPTY_ERRORS = { nom: "", telephone: "", email: "" };

// ═══════════════════════════════════════════════════════════════════════════════
export default function ClientsPage() {
  // ── State ──
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState({ nom: "", telephone: "" });

  // Modal création/édition
  const [openForm, setOpenForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [saving, setSaving] = useState(false);

  // Modal détails
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [detailTab, setDetailTab] = useState(0);

  // Modal fidélité
  const [openFidelite, setOpenFidelite] = useState(false);
  const [fideliteMode, setFideliteMode] = useState("credit"); // "credit" | "utiliser"
  const [fideliteVal, setFideliteVal] = useState("");

  // Snackbar
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  // ── Chargement ──
  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const data = await clientService.rechercher(search.nom, search.telephone);
      setRows(data);
    } catch {
      notify("Erreur lors du chargement des clients", "error");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    charger();
  }, [charger]);

  // ── Helpers ──
  const notify = (msg, severity = "success") =>
    setSnack({ open: true, msg, severity });

  const validate = () => {
    const e = { ...EMPTY_ERRORS };
    if (!form.nom.trim()) e.nom = "Le nom est obligatoire";
    if (!form.telephone.trim()) e.telephone = "Le téléphone est obligatoire";
    if (form.email && !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Email invalide";
    setErrors(e);
    return !Object.values(e).some(Boolean);
  };

  // ── Actions ──
  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await clientService.creer(form);
      notify(editMode ? "Client modifié ✓" : "Client créé ✓");
      setOpenForm(false);
      setForm(EMPTY_FORM);
      charger();
    } catch {
      notify("Erreur lors de l'enregistrement", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDesactiver = async (id) => {
    if (!window.confirm("Désactiver ce client ?")) return;
    try {
      await clientService.desactiver(id);
      notify("Client désactivé");
      charger();
    } catch {
      notify("Erreur lors de la désactivation", "error");
    }
  };

  const handleVoirDetails = async (id) => {
    try {
      const c = await clientService.trouverParId(id);
      setSelectedClient(c);
      setDetailTab(0);
      setOpenDetails(true);
    } catch {
      notify("Impossible de charger les détails", "error");
    }
  };

  const handleFideliteSubmit = async () => {
    if (!fideliteVal) return;
    try {
      if (fideliteMode === "credit") {
        await clientService.crediterPoints(selectedClient.id, parseFloat(fideliteVal));
        notify("Points crédités ✓");
      } else {
        await clientService.utiliserPoints(selectedClient.id, parseInt(fideliteVal));
        notify("Points utilisés ✓");
      }
      setOpenFidelite(false);
      setFideliteVal("");
      // Rafraîchir le client sélectionné
      const updated = await clientService.trouverParId(selectedClient.id);
      setSelectedClient(updated);
      charger();
    } catch {
      notify("Erreur fidélité", "error");
    }
  };

  // ── Colonnes DataGrid ──
  const columns = [
    {
      field: "avatar",
      headerName: "",
      width: 52,
      sortable: false,
      renderCell: ({ row }) => (
        <Avatar
          sx={{
            bgcolor: COLORS.accent,
            width: 32,
            height: 32,
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {(row.prenom?.[0] || "") + (row.nom?.[0] || "")}
        </Avatar>
      ),
    },
    {
      field: "nom",
      headerName: "Nom",
      flex: 1,
      renderCell: ({ row }) => (
        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ color: COLORS.text }}>
            {row.prenom} {row.nom}
          </Typography>
        </Box>
      ),
    },
    { field: "telephone", headerName: "Téléphone", flex: 1 },
    { field: "email", headerName: "Email", flex: 1.2 },
    {
      field: "pointsFidelite",
      headerName: "Fidélité",
      width: 110,
      renderCell: ({ value }) => (
        <Chip
          icon={<Stars sx={{ fontSize: 14 }} />}
          label={`${value ?? 0} pts`}
          size="small"
          sx={{
            bgcolor: `${COLORS.gold}22`,
            color: COLORS.gold,
            border: `1px solid ${COLORS.gold}55`,
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      field: "actif",
      headerName: "Statut",
      width: 100,
      renderCell: ({ value }) =>
        value ? (
          <Chip
            icon={<CheckCircle sx={{ fontSize: 13 }} />}
            label="Actif"
            size="small"
            sx={{ bgcolor: "#4caf5022", color: COLORS.success, border: "1px solid #4caf5055" }}
          />
        ) : (
          <Chip
            icon={<Cancel sx={{ fontSize: 13 }} />}
            label="Inactif"
            size="small"
            sx={{ bgcolor: "#f4433622", color: COLORS.danger, border: "1px solid #f4433655" }}
          />
        ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Voir détails">
            <IconButton
              size="small"
              onClick={() => handleVoirDetails(row.id)}
              sx={{ color: COLORS.accent }}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Modifier">
            <IconButton
              size="small"
              onClick={() => {
                setForm({
                  nom: row.nom, prenom: row.prenom,
                  telephone: row.telephone, email: row.email, adresse: row.adresse,
                });
                setEditMode(true);
                setOpenForm(true);
              }}
              sx={{ color: COLORS.muted }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Désactiver">
            <IconButton
              size="small"
              onClick={() => handleDesactiver(row.id)}
              sx={{ color: COLORS.danger }}
            >
              <Block fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  // ── Rendu ──
  return (
    <Box
      sx={{
        height: "100%",
        overflowY: "auto",
        bgcolor: COLORS.primary,
        p: { xs: 2, md: 3 },
        fontFamily: "'DM Sans', sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* ── En-tête ── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{ color: COLORS.text, letterSpacing: "-0.5px" }}
          >
            Gestion des Clients
          </Typography>
          <Typography variant="caption" sx={{ color: COLORS.muted }}>
            {rows.length} client{rows.length !== 1 ? "s" : ""} trouvé{rows.length !== 1 ? "s" : ""}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => { setForm(EMPTY_FORM); setEditMode(false); setErrors(EMPTY_ERRORS); setOpenForm(true); }}
          sx={{
            bgcolor: COLORS.accent,
            "&:hover": { bgcolor: "#c73652" },
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            px: 2.5,
          }}
        >
          Nouveau client
        </Button>
      </Box>

      {/* ── Barre de recherche ── */}
      <Paper
        sx={{
          display: "flex", gap: 2, p: 2, mb: 2,
          bgcolor: COLORS.surface, border: `1px solid ${COLORS.card}`,
          borderRadius: 2,
        }}
      >
        <TextField
          size="small"
          placeholder="Rechercher par nom..."
          value={search.nom}
          onChange={(e) => setSearch((s) => ({ ...s, nom: e.target.value }))}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: COLORS.muted, fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
          sx={inputSx}
        />
        <TextField
          size="small"
          placeholder="Téléphone..."
          value={search.telephone}
          onChange={(e) => setSearch((s) => ({ ...s, telephone: e.target.value }))}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Phone sx={{ color: COLORS.muted, fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
          sx={inputSx}
        />
        <Button
          variant="outlined"
          onClick={charger}
          sx={{ borderColor: COLORS.accent, color: COLORS.accent, textTransform: "none", borderRadius: 2 }}
        >
          Rechercher
        </Button>
      </Paper>

      {/* ── DataGrid ── */}
      <Paper
        sx={{
          bgcolor: COLORS.surface,
          border: `1px solid ${COLORS.card}`,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
          autoHeight
          sx={{
            border: "none",
            color: COLORS.text,
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: COLORS.card,
              color: COLORS.muted,
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            },
            "& .MuiDataGrid-row": {
              "&:hover": { bgcolor: `${COLORS.card}88` },
              borderBottom: `1px solid ${COLORS.card}`,
            },
            "& .MuiDataGrid-cell": { border: "none" },
            "& .MuiTablePagination-root": { color: COLORS.muted },
            "& .MuiDataGrid-footerContainer": { bgcolor: COLORS.surface, borderTop: `1px solid ${COLORS.card}` },
            "& .MuiCheckbox-root": { color: COLORS.muted },
            "& .MuiDataGrid-overlayWrapper": { minHeight: 120 },
          }}
        />
      </Paper>

      {/* ═══════════ MODAL CRÉATION / ÉDITION ═══════════ */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: COLORS.surface, border: `1px solid ${COLORS.card}`, borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            color: COLORS.text, fontWeight: 700, pb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Person sx={{ color: COLORS.accent }} />
            {editMode ? "Modifier le client" : "Nouveau client"}
          </Box>
          <IconButton onClick={() => setOpenForm(false)} sx={{ color: COLORS.muted }}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>

        <Divider sx={{ borderColor: COLORS.card }} />

        <DialogContent sx={{ pt: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Prénom"
              value={form.prenom}
              onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
              fullWidth size="small" sx={inputSx}
            />
            <TextField
              label="Nom *"
              value={form.nom}
              onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
              error={!!errors.nom} helperText={errors.nom}
              fullWidth size="small" sx={inputSx}
            />
          </Box>
          <TextField
            label="Téléphone *"
            value={form.telephone}
            onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
            error={!!errors.telephone} helperText={errors.telephone}
            fullWidth size="small"
            InputProps={{ startAdornment: <InputAdornment position="start"><Phone sx={{ color: COLORS.muted, fontSize: 18 }} /></InputAdornment> }}
            sx={inputSx}
          />
          <TextField
            label="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            error={!!errors.email} helperText={errors.email}
            fullWidth size="small"
            InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: COLORS.muted, fontSize: 18 }} /></InputAdornment> }}
            sx={inputSx}
          />
          <TextField
            label="Adresse"
            value={form.adresse}
            onChange={(e) => setForm((f) => ({ ...f, adresse: e.target.value }))}
            fullWidth size="small" multiline rows={2}
            InputProps={{ startAdornment: <InputAdornment position="start"><Home sx={{ color: COLORS.muted, fontSize: 18 }} /></InputAdornment> }}
            sx={inputSx}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setOpenForm(false)}
            sx={{ color: COLORS.muted, textTransform: "none" }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ bgcolor: COLORS.accent, "&:hover": { bgcolor: "#c73652" }, textTransform: "none", fontWeight: 600, borderRadius: 2, px: 3 }}
          >
            {saving ? "Enregistrement..." : editMode ? "Modifier" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══════════ MODAL DÉTAILS ═══════════ */}
      <Dialog
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: COLORS.surface, border: `1px solid ${COLORS.card}`, borderRadius: 3 } }}
      >
        {selectedClient && (
          <>
            {/* En-tête profil */}
            <Box
              sx={{
                bgcolor: COLORS.card, p: 3,
                display: "flex", alignItems: "center", gap: 2,
              }}
            >
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={
                  <Box
                    sx={{
                      width: 12, height: 12, borderRadius: "50%",
                      bgcolor: selectedClient.actif ? COLORS.success : COLORS.danger,
                      border: `2px solid ${COLORS.card}`,
                    }}
                  />
                }
              >
                <Avatar
                  sx={{ width: 56, height: 56, bgcolor: COLORS.accent, fontSize: 20, fontWeight: 700 }}
                >
                  {(selectedClient.prenom?.[0] || "") + (selectedClient.nom?.[0] || "")}
                </Avatar>
              </Badge>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: COLORS.text }}>
                  {selectedClient.prenom} {selectedClient.nom}
                </Typography>
                <Typography variant="caption" sx={{ color: COLORS.muted }}>
                  ID #{selectedClient.id}
                </Typography>
              </Box>
              <IconButton onClick={() => setOpenDetails(false)} sx={{ color: COLORS.muted }}>
                <Close fontSize="small" />
              </IconButton>
            </Box>

            {/* Onglets */}
            <Tabs
              value={detailTab}
              onChange={(_, v) => setDetailTab(v)}
              sx={{
                bgcolor: COLORS.card,
                "& .MuiTab-root": { color: COLORS.muted, textTransform: "none", fontWeight: 500 },
                "& .Mui-selected": { color: COLORS.accent },
                "& .MuiTabs-indicator": { bgcolor: COLORS.accent },
              }}
            >
              <Tab label="Informations" />
              <Tab label="Fidélité" />
            </Tabs>

            <DialogContent>
              {/* Tab 0 — Infos */}
              <TabPanel value={detailTab} index={0}>
                <InfoRow icon={<Phone fontSize="small" />} label="Téléphone" value={selectedClient.telephone} />
                <InfoRow icon={<Email fontSize="small" />} label="Email" value={selectedClient.email} />
                <InfoRow icon={<Home fontSize="small" />} label="Adresse" value={selectedClient.adresse} />
              </TabPanel>

              {/* Tab 1 — Fidélité */}
              <TabPanel value={detailTab} index={1}>
                <Box
                  sx={{
                    textAlign: "center", py: 2,
                    bgcolor: `${COLORS.gold}11`,
                    borderRadius: 2, border: `1px solid ${COLORS.gold}33`,
                    mb: 2,
                  }}
                >
                  <Stars sx={{ color: COLORS.gold, fontSize: 36 }} />
                  <Typography variant="h4" fontWeight={700} sx={{ color: COLORS.gold }}>
                    {selectedClient.pointsFidelite ?? 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: COLORS.muted }}>
                    points de fidélité
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="outlined"
                    startIcon={<CreditCard />}
                    fullWidth
                    onClick={() => { setFideliteMode("credit"); setFideliteVal(""); setOpenFidelite(true); }}
                    sx={{ borderColor: COLORS.gold, color: COLORS.gold, textTransform: "none", borderRadius: 2 }}
                  >
                    Créditer
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Redeem />}
                    fullWidth
                    onClick={() => { setFideliteMode("utiliser"); setFideliteVal(""); setOpenFidelite(true); }}
                    sx={{ borderColor: COLORS.accent, color: COLORS.accent, textTransform: "none", borderRadius: 2 }}
                  >
                    Utiliser
                  </Button>
                </Stack>
              </TabPanel>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* ═══════════ MODAL FIDÉLITÉ ═══════════ */}
      <Dialog
        open={openFidelite}
        onClose={() => setOpenFidelite(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { bgcolor: COLORS.surface, border: `1px solid ${COLORS.card}`, borderRadius: 3 } }}
      >
        <DialogTitle sx={{ color: COLORS.text, fontWeight: 700 }}>
          {fideliteMode === "credit" ? "Créditer des points" : "Utiliser des points"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label={fideliteMode === "credit" ? "Montant (FCFA)" : "Nombre de points"}
            type="number"
            value={fideliteVal}
            onChange={(e) => setFideliteVal(e.target.value)}
            fullWidth size="small" sx={{ mt: 1, ...inputSx }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button onClick={() => setOpenFidelite(false)} sx={{ color: COLORS.muted, textTransform: "none" }}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleFideliteSubmit}
            sx={{
              bgcolor: fideliteMode === "credit" ? COLORS.gold : COLORS.accent,
              "&:hover": { opacity: 0.85 },
              textTransform: "none", fontWeight: 600, borderRadius: 2,
            }}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// ── Styles TextField réutilisables ──────────────────────────────────────────
const inputSx = {
  "& .MuiOutlinedInput-root": {
    color: COLORS.text,
    "& fieldset": { borderColor: `${COLORS.card}` },
    "&:hover fieldset": { borderColor: COLORS.accent },
    "&.Mui-focused fieldset": { borderColor: COLORS.accent },
  },
  "& .MuiInputLabel-root": { color: COLORS.muted },
  "& .MuiInputLabel-root.Mui-focused": { color: COLORS.accent },
  "& .MuiFormHelperText-root": { color: COLORS.danger },
};
import { useState, useEffect, useCallback } from "react";
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Typography, Chip, IconButton, Tooltip, Paper,
  InputAdornment, Snackbar, Alert, Divider, Avatar, Stack,
  CircularProgress, MenuItem,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Add, Search, Person, Close, Edit, Delete,
  CheckCircle, Cancel,
} from "@mui/icons-material";
import employeService from "../services/EmployeService";
import agenceService from "../services/AgenceService";
import keycloak from "../keycloak";

const COLORS = {
  primary: "#1a1a2e", accent: "#e94560", gold: "#f0a500",
  surface: "#16213e", card: "#0f3460", text: "#eaeaea",
  muted: "#8892a4", success: "#4caf50", danger: "#f44336",
};

const ROLES = ["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_CAISSIER", "ROLE_EMPLOYE"];

const EMPTY_FORM = {
  nom: "",
  prenom: "",
  role: "ROLE_EMPLOYE",
  agenceId: "",
  actif: true,
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    color: COLORS.text,
    "& fieldset": { borderColor: COLORS.card },
    "&:hover fieldset": { borderColor: COLORS.accent },
    "&.Mui-focused fieldset": { borderColor: COLORS.accent },
  },
  "& .MuiInputLabel-root": { color: COLORS.muted },
  "& .MuiInputLabel-root.Mui-focused": { color: COLORS.accent },
  "& .MuiFormHelperText-root": { color: COLORS.danger },
  "& .MuiSelect-icon": { color: COLORS.muted },
};

export default function EmployesPage() {
  const [rows, setRows] = useState([]);
  const [agences, setAgences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  // ✅ notify défini AVANT charger
  const notify = useCallback((msg, severity = "success") =>
    setSnack({ open: true, msg, severity }), []);

  // ✅ charger avec notify dans les deps
  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const [employes, listeAgences] = await Promise.all([
        employeService.lister(),
        agenceService.lister(),
      ]);
      setRows(employes);
      setAgences(listeAgences);
    } catch {
      notify("Erreur lors du chargement", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { charger(); }, [charger]);

  const validate = () => {
    const e = {};
    if (!form.nom.trim()) e.nom = "Le nom est obligatoire";
    if (!form.prenom.trim()) e.prenom = "Le prénom est obligatoire";
    if (!form.role) e.role = "Le rôle est obligatoire";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        keycloakId: keycloak.tokenParsed?.sub,  // ✅ récupéré automatiquement
        agenceId: form.agenceId ? Number(form.agenceId) : null,
      };
      if (editMode) {
        await employeService.modifier(editId, payload);
        notify("Employé modifié ✓");
      } else {
        await employeService.creer(payload);
        notify("Employé créé ✓");
      }
      setOpenForm(false);
      setForm(EMPTY_FORM);
      charger();
    } catch (err) {
      notify(err.response?.data?.message || "Erreur lors de l'enregistrement", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (row) => {
    setForm({
      nom: row.nom || "",
      prenom: row.prenom || "",
      role: row.role || "ROLE_EMPLOYE",
      agenceId: row.agenceId ? Number(row.agenceId) : "",  // ✅ number
      actif: row.actif ?? true,
    });
    setEditId(row.id);
    setEditMode(true);
    setErrors({});
    setOpenForm(true);
  };

  const handleSupprimer = async (id) => {
    if (!window.confirm("Supprimer cet employé ?")) return;
    try {
      await employeService.supprimer(id);
      notify("Employé supprimé");
      charger();
    } catch {
      notify("Erreur lors de la suppression", "error");
    }
  };

  const filtered = rows.filter((r) =>
    `${r.nom} ${r.prenom}`.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      field: "avatar", headerName: "", width: 52, sortable: false,
      renderCell: ({ row }) => (
        <Avatar sx={{ bgcolor: COLORS.accent, width: 32, height: 32, fontSize: 13, fontWeight: 700 }}>
          {(row.prenom?.[0] || "") + (row.nom?.[0] || "")}
        </Avatar>
      ),
    },
    {
      field: "nom", headerName: "Nom complet", flex: 1,
      renderCell: ({ row }) => (
        <Typography variant="body2" fontWeight={600} sx={{ color: COLORS.text }}>
          {row.prenom} {row.nom}
        </Typography>
      ),
    },
    {
      field: "role", headerName: "Rôle", flex: 1,
      renderCell: ({ value }) => (
        <Chip
          label={value?.replace("ROLE_", "") || "—"} size="small"
          sx={{ bgcolor: `${COLORS.accent}22`, color: COLORS.accent, border: `1px solid ${COLORS.accent}55`, fontWeight: 600, fontSize: 11 }}
        />
      ),
    },
    {
      field: "agenceId", headerName: "Agence", flex: 1,
      renderCell: ({ value }) => {
        const agence = agences.find((a) => Number(a.id) === Number(value)); // ✅ comparaison sûre
        return (
          <Typography variant="body2" sx={{ color: COLORS.text }}>
            {agence ? agence.nom : value ? `#${value}` : "—"}
          </Typography>
        );
      },
    },
    {
      field: "actif", headerName: "Statut", width: 100,
      renderCell: ({ value }) =>
        value ? (
          <Chip icon={<CheckCircle sx={{ fontSize: 13 }} />} label="Actif" size="small"
            sx={{ bgcolor: "#4caf5022", color: COLORS.success, border: "1px solid #4caf5055" }} />
        ) : (
          <Chip icon={<Cancel sx={{ fontSize: 13 }} />} label="Inactif" size="small"
            sx={{ bgcolor: "#f4433622", color: COLORS.danger, border: "1px solid #f4433655" }} />
        ),
    },
    {
      field: "actions", headerName: "Actions", width: 100, sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Modifier">
            <IconButton size="small" onClick={() => handleEdit(row)} sx={{ color: COLORS.muted }}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer">
            <IconButton size="small" onClick={() => handleSupprimer(row.id)} sx={{ color: COLORS.danger }}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ height: "100%", overflowY: "auto", bgcolor: COLORS.primary, p: { xs: 2, md: 3 }, boxSizing: "border-box" }}>

      {/* En-tête */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ color: COLORS.text, letterSpacing: "-0.5px" }}>
            Gestion des Employés
          </Typography>
          <Typography variant="caption" sx={{ color: COLORS.muted }}>
            {filtered.length} employé{filtered.length !== 1 ? "s" : ""} trouvé{filtered.length !== 1 ? "s" : ""}
          </Typography>
        </Box>
        <Button
          variant="contained" startIcon={<Add />}
          onClick={() => { setForm(EMPTY_FORM); setEditMode(false); setEditId(null); setErrors({}); setOpenForm(true); }}
          sx={{ bgcolor: COLORS.accent, "&:hover": { bgcolor: "#c73652" }, textTransform: "none", fontWeight: 600, borderRadius: 2, px: 2.5 }}
        >
          Nouvel employé
        </Button>
      </Box>

      {/* Recherche */}
      <Paper sx={{ display: "flex", gap: 2, p: 2, mb: 2, bgcolor: COLORS.surface, border: `1px solid ${COLORS.card}`, borderRadius: 2 }}>
        <TextField
          size="small" placeholder="Rechercher par nom..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: COLORS.muted, fontSize: 18 }} /></InputAdornment> }}
          sx={{ flex: 1, ...inputSx }}
        />
      </Paper>

      {/* DataGrid */}
      <Paper sx={{ bgcolor: COLORS.surface, border: `1px solid ${COLORS.card}`, borderRadius: 2, overflow: "hidden" }}>
        <DataGrid
          rows={filtered} columns={columns} loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick autoHeight
          sx={{
            border: "none", color: COLORS.text,
            "& .MuiDataGrid-columnHeaders": { bgcolor: COLORS.card, color: COLORS.muted, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" },
            "& .MuiDataGrid-row": { "&:hover": { bgcolor: `${COLORS.card}88` }, borderBottom: `1px solid ${COLORS.card}` },
            "& .MuiDataGrid-cell": { border: "none" },
            "& .MuiTablePagination-root": { color: COLORS.muted },
            "& .MuiDataGrid-footerContainer": { bgcolor: COLORS.surface, borderTop: `1px solid ${COLORS.card}` },
          }}
        />
      </Paper>

      {/* ═══ MODAL CRÉATION / ÉDITION ═══ */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: COLORS.surface, border: `1px solid ${COLORS.card}`, borderRadius: 3 } }}>

        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: COLORS.text, fontWeight: 700, pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Person sx={{ color: COLORS.accent }} />
            {editMode ? "Modifier l'employé" : "Nouvel employé"}
          </Box>
          <IconButton onClick={() => setOpenForm(false)} sx={{ color: COLORS.muted }}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>

        <Divider sx={{ borderColor: COLORS.card }} />

        <DialogContent sx={{ pt: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField label="Prénom *" value={form.prenom}
              onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
              error={!!errors.prenom} helperText={errors.prenom}
              fullWidth size="small" sx={inputSx} />
            <TextField label="Nom *" value={form.nom}
              onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
              error={!!errors.nom} helperText={errors.nom}
              fullWidth size="small" sx={inputSx} />
          </Box>

          <TextField select label="Rôle *" value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            error={!!errors.role} helperText={errors.role}
            fullWidth size="small" sx={inputSx}
            SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: COLORS.surface } } } }}>
            {ROLES.map((r) => (
              <MenuItem key={r} value={r} sx={{ color: COLORS.text, "&:hover": { bgcolor: COLORS.card } }}>
                {r.replace("ROLE_", "")}
              </MenuItem>
            ))}
          </TextField>

          {/* ✅ Dropdown agences — nom uniquement, optionnel */}
          <TextField select label="Agence (optionnel)" value={form.agenceId}
            onChange={(e) => setForm((f) => ({ ...f, agenceId: Number(e.target.value) || "" }))}
            fullWidth size="small" sx={inputSx}
            SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: COLORS.surface } } } }}>
            <MenuItem value="" sx={{ color: COLORS.muted, "&:hover": { bgcolor: COLORS.card } }}>
              — Aucune agence —
            </MenuItem>
            {agences.map((a) => (
              <MenuItem key={a.id} value={Number(a.id)}   // ✅ number
                sx={{ color: COLORS.text, "&:hover": { bgcolor: COLORS.card } }}>
                {a.nom}
              </MenuItem>
            ))}
          </TextField>

          {/* ✅ String(form.actif) pour matcher les MenuItem value="true"/"false" */}
          <TextField select label="Statut" value={String(form.actif)}
            onChange={(e) => setForm((f) => ({ ...f, actif: e.target.value === "true" }))}
            fullWidth size="small" sx={inputSx}
            SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: COLORS.surface } } } }}>
            <MenuItem value="true" sx={{ color: COLORS.text, "&:hover": { bgcolor: COLORS.card } }}>Actif</MenuItem>
            <MenuItem value="false" sx={{ color: COLORS.text, "&:hover": { bgcolor: COLORS.card } }}>Inactif</MenuItem>
          </TextField>

        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setOpenForm(false)} sx={{ color: COLORS.muted, textTransform: "none" }}>
            Annuler
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ bgcolor: COLORS.accent, "&:hover": { bgcolor: "#c73652" }, textTransform: "none", fontWeight: 600, borderRadius: 2, px: 3 }}>
            {saving ? "Enregistrement..." : editMode ? "Modifier" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
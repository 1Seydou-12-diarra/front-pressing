import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Typography, Chip, IconButton, Tooltip, Paper,
  Snackbar, Alert, Divider, Avatar, Stack,
  CircularProgress, Autocomplete, MenuItem, Select, FormControl,
  InputLabel, Badge,
} from "@mui/material";
import {
  Add, Close, Person, CalendarMonth, Inventory2,
  DragIndicator, Visibility, CheckCircle, Schedule,
  LocalLaundryService, Done, Cancel, Notes, QrCode,
  ArrowForward, Refresh,
} from "@mui/icons-material";
import commandeService from "../services/commandeService";
import { useKeycloak } from '@react-keycloak/web';
import ClientService from "../services/ClientService";
import PdfActions from "../components/PdfActions";

// ─── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#0d1117", surface: "#161b22", card: "#21262d", border: "#30363d",
  text: "#e6edf3", muted: "#8b949e", accent: "#f78166", blue: "#58a6ff",
  green: "#3fb950", yellow: "#d29922", purple: "#bc8cff", orange: "#ffa657", red: "#f85149",
};

// ✅ Statuts alignés avec le backend
const STATUTS = [
  { key: "DEPOSE",        label: "Déposé",        color: C.blue,   icon: <Inventory2 fontSize="small" /> },
  { key: "EN_TRAITEMENT", label: "En traitement",  color: C.yellow, icon: <LocalLaundryService fontSize="small" /> },
  { key: "PRET",          label: "Prêt",           color: C.purple, icon: <CheckCircle fontSize="small" /> },
  { key: "RETIRE",        label: "Retiré",         color: C.green,  icon: <Done fontSize="small" /> },
];

// ✅ Transitions autorisées selon le backend
const TRANSITIONS_AUTORISEES = {
  DEPOSE:        ["EN_TRAITEMENT"],
  EN_TRAITEMENT: ["PRET"],
  PRET:          ["RETIRE"],
  RETIRE:        [],
};

// ✅ Timeline alignée
const TIMELINE_STEPS = ["DEPOSE", "EN_TRAITEMENT", "PRET", "RETIRE"];

const TYPES_VETEMENT = ["CHEMISE","PANTALON","VESTE","ROBE","MANTEAU","COSTUME","JUPE","PULL","TSHIRT","AUTRE"];
const SERVICES = ["REPASSAGE","NETTOYAGE_SEC","LAVAGE","LAVAGE_REPASSAGE","DETACHAGE","IMPERMEABILISATION"];
const EMPTY_ARTICLE = { typeVetement: "", service: "", observations: "", codeBarres: "" };

const statutInfo = (key) => STATUTS.find((s) => s.key === key) || STATUTS[0];
const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

// ═══════════════════════════════════════════════════════════════════════════════
export default function CommandesPage() {
  const { keycloak } = useKeycloak();
  const employeId = keycloak?.tokenParsed?.employeId || 1;
  const agenceId  = keycloak?.tokenParsed?.agenceId  || 1;

  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [clients, setClients]     = useState([]);
  const [openDepot, setOpenDepot] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm] = useState({
    clientId: null, agenceId, employeId,
    dateRetraitPrevue: "", articles: [{ ...EMPTY_ARTICLE }],
  });
  const [openDetail, setOpenDetail]   = useState(false);
  const [selectedCmd, setSelectedCmd] = useState(null);
  const dragItem    = useRef(null);
  const dragOverCol = useRef(null);
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });
  const notify = (msg, severity = "success") => setSnack({ open: true, msg, severity });

  const charger = useCallback(async () => {
    setLoading(true);
    try { setCommandes(await commandeService.listerCommandes()); }
    catch { notify("Erreur chargement commandes", "error"); }
    finally { setLoading(false); }
  }, []);

  const chargerClients = useCallback(async () => {
    try { setClients(await ClientService.rechercher()); } catch {}
  }, []);

  useEffect(() => { charger(); chargerClients(); }, [charger, chargerClients]);

  const colonnes = STATUTS.map((s) => ({
    ...s,
    items: commandes.filter((c) => c.statut === s.key),
  }));

  const onDragStart = (cmd) => { dragItem.current = cmd; };
  const onDragOver  = (e, key) => { e.preventDefault(); dragOverCol.current = key; };

  // ✅ Drag & drop avec validation des transitions
  const onDrop = async (e, statutKey) => {
    e.preventDefault();
    const cmd = dragItem.current;
    if (!cmd || cmd.statut === statutKey) return;

    const autorisees = TRANSITIONS_AUTORISEES[cmd.statut] || [];
    if (!autorisees.includes(statutKey)) {
      notify(`Transition non autorisée : ${statutInfo(cmd.statut).label} → ${statutInfo(statutKey).label}`, "warning");
      dragItem.current = null;
      return;
    }

    setCommandes((prev) => prev.map((c) => c.id === cmd.id ? { ...c, statut: statutKey } : c));
    try {
      await commandeService.changerStatut(cmd.id, statutKey);
      notify(`Commande #${cmd.id} → ${statutInfo(statutKey).label}`);
    } catch {
      notify("Erreur changement statut", "error");
      charger();
    }
    dragItem.current = null;
  };

  const voirDetail = async (id) => {
    try { setSelectedCmd(await commandeService.getCommande(id)); setOpenDetail(true); }
    catch { notify("Impossible de charger la commande", "error"); }
  };

  const handleSubmitDepot = async () => {
    if (!form.clientId)          { notify("Sélectionne un client", "warning"); return; }
    if (!form.dateRetraitPrevue) { notify("Date de retrait requise", "warning"); return; }
    if (form.articles.some((a) => !a.typeVetement || !a.service)) {
      notify("Complète tous les articles", "warning"); return;
    }
    setSaving(true);
    try {
      await commandeService.creerDepot({
        ...form,
        clientId: form.clientId.id,
        dateRetraitPrevue: form.dateRetraitPrevue + ":00",
      });
      notify("Commande créée ✓");
      setOpenDepot(false);
      setForm({ clientId: null, agenceId, employeId, dateRetraitPrevue: "", articles: [{ ...EMPTY_ARTICLE }] });
      charger();
    } catch { notify("Erreur création commande", "error"); }
    finally { setSaving(false); }
  };

  const addArticle    = () => setForm((f) => ({ ...f, articles: [...f.articles, { ...EMPTY_ARTICLE }] }));
  const removeArticle = (i) => setForm((f) => ({ ...f, articles: f.articles.filter((_, idx) => idx !== i) }));
  const updateArticle = (i, field, val) =>
    setForm((f) => ({ ...f, articles: f.articles.map((a, idx) => idx === i ? { ...a, [field]: val } : a) }));

  return (
    <Box sx={{ bgcolor: C.bg, minHeight: "100%", fontFamily: "'Sora', sans-serif", p: 3 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');`}</style>

      {/* ── En-tête ── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ color: C.text, letterSpacing: "-0.5px" }}>
            Commandes
          </Typography>
          <Typography variant="caption" sx={{ color: C.muted }}>
            {commandes.length} commande{commandes.length !== 1 ? "s" : ""} · Glisser-déposer pour changer le statut
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Tooltip title="Rafraîchir">
            <IconButton onClick={charger} sx={{ color: C.muted, bgcolor: C.card, borderRadius: 2 }}>
              {loading ? <CircularProgress size={18} sx={{ color: C.muted }} /> : <Refresh fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDepot(true)}
            sx={{ bgcolor: C.accent, "&:hover": { bgcolor: "#e05a45" }, textTransform: "none", fontWeight: 600, borderRadius: 2, px: 2.5 }}>
            Nouveau dépôt
          </Button>
        </Stack>
      </Box>

      {/* ══ KANBAN ══ */}
      <Box sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 2,
        "&::-webkit-scrollbar": { height: 6 },
        "&::-webkit-scrollbar-track": { bgcolor: C.surface },
        "&::-webkit-scrollbar-thumb": { bgcolor: C.border, borderRadius: 3 } }}>
        {colonnes.map((col) => (
          <Box key={col.key}
            onDragOver={(e) => onDragOver(e, col.key)}
            onDrop={(e) => onDrop(e, col.key)}
            sx={{ minWidth: 280, maxWidth: 280, flexShrink: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, p: 1.5, borderRadius: 2,
              bgcolor: `${col.color}15`, border: `1px solid ${col.color}30` }}>
              <Box sx={{ color: col.color }}>{col.icon}</Box>
              <Typography variant="body2" fontWeight={700} sx={{ color: col.color, flex: 1 }}>
                {col.label}
              </Typography>
              <Badge badgeContent={col.items.length}
                sx={{ "& .MuiBadge-badge": { bgcolor: col.color, color: "#000", fontWeight: 700, fontSize: 11 } }}>
                <Box sx={{ width: 8 }} />
              </Badge>
            </Box>
            <Stack spacing={1.5} sx={{ minHeight: 120 }}>
              {col.items.map((cmd) => (
                <KanbanCard key={cmd.id} cmd={cmd} colColor={col.color} clients={clients}
                  onDragStart={onDragStart} onVoir={voirDetail}
                  onStatut={async (id, s) => {
                    // ✅ Validation aussi sur le bouton rapide
                    const autorisees = TRANSITIONS_AUTORISEES[cmd.statut] || [];
                    if (!autorisees.includes(s)) {
                      notify("Transition non autorisée", "warning"); return;
                    }
                    setCommandes((prev) => prev.map((c) => c.id === id ? { ...c, statut: s } : c));
                    try {
                      await commandeService.changerStatut(id, s);
                      notify("Statut mis à jour");
                    } catch { notify("Erreur", "error"); charger(); }
                  }} />
              ))}
              {col.items.length === 0 && (
                <Box sx={{ border: `2px dashed ${col.color}30`, borderRadius: 2, p: 3, textAlign: "center" }}>
                  <Typography variant="caption" sx={{ color: C.muted }}>
                    {TRANSITIONS_AUTORISEES[
                      STATUTS[STATUTS.findIndex(s => s.key === col.key) - 1]?.key
                    ]?.includes(col.key)
                      ? "Glisser ici"
                      : "Aucune commande"}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        ))}
      </Box>

      {/* ══ MODAL DÉPÔT ══ */}
      <Dialog open={openDepot} onClose={() => setOpenDepot(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { bgcolor: C.surface, border: `1px solid ${C.border}`, borderRadius: 3 } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: C.text, fontWeight: 700 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LocalLaundryService sx={{ color: C.accent }} />Nouveau dépôt
          </Box>
          <IconButton onClick={() => setOpenDepot(false)} sx={{ color: C.muted }}><Close fontSize="small" /></IconButton>
        </DialogTitle>
        <Divider sx={{ borderColor: C.border }} />
        <DialogContent sx={{ pt: 3, display: "flex", flexDirection: "column", gap: 3 }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Autocomplete options={clients}
              getOptionLabel={(o) => `${o.prenom} ${o.nom} — ${o.telephone}`}
              value={form.clientId}
              onChange={(_, v) => setForm((f) => ({ ...f, clientId: v }))}
              renderInput={(params) => (
                <TextField {...params} label="Client *" size="small"
                  InputProps={{ ...params.InputProps, startAdornment: <><Person sx={{ color: C.muted, fontSize: 18, mr: 0.5 }} />{params.InputProps.startAdornment}</> }}
                  sx={iSx} />
              )} sx={{ flex: 1 }} />
            <TextField label="Date retrait prévue *" type="datetime-local"
              value={form.dateRetraitPrevue}
              onChange={(e) => setForm((f) => ({ ...f, dateRetraitPrevue: e.target.value }))}
              size="small" InputLabelProps={{ shrink: true }}
              InputProps={{ startAdornment: <CalendarMonth sx={{ color: C.muted, fontSize: 18, mr: 0.5 }} /> }}
              sx={{ flex: 1, ...iSx }} />
          </Box>
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Typography variant="body2" fontWeight={600} sx={{ color: C.text }}>
                Articles ({form.articles.length})
              </Typography>
              <Button size="small" startIcon={<Add />} onClick={addArticle}
                sx={{ color: C.blue, textTransform: "none", fontSize: 12 }}>
                Ajouter article
              </Button>
            </Box>
            <Stack spacing={1.5}>
              {form.articles.map((art, i) => (
                <Paper key={i} sx={{ p: 2, bgcolor: C.card, border: `1px solid ${C.border}`, borderRadius: 2 }}>
                  <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "flex-start" }}>
                    <Box sx={{ color: C.muted, mt: 0.5, cursor: "grab" }}><DragIndicator fontSize="small" /></Box>
                    <Autocomplete options={TYPES_VETEMENT} value={art.typeVetement}
                      onChange={(_, v) => updateArticle(i, "typeVetement", v || "")} freeSolo
                      renderInput={(params) => (
                        <TextField {...params} label="Type vêtement *" size="small" sx={{ width: 160, ...iSx }} />
                      )} />
                    <FormControl size="small" sx={{ width: 190 }}>
                      <InputLabel sx={{ color: C.muted }}>Service *</InputLabel>
                      <Select value={art.service} label="Service *"
                        onChange={(e) => updateArticle(i, "service", e.target.value)}
                        sx={{ color: C.text, "& .MuiOutlinedInput-notchedOutline": { borderColor: C.border }, "& .MuiSvgIcon-root": { color: C.muted } }}>
                        {SERVICES.map((s) => <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>{s}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <TextField label="Code-barres" value={art.codeBarres}
                      onChange={(e) => updateArticle(i, "codeBarres", e.target.value)}
                      size="small"
                      InputProps={{ startAdornment: <QrCode sx={{ color: C.muted, fontSize: 16, mr: 0.5 }} /> }}
                      sx={{ width: 140, ...iSx }} />
                    <TextField label="Observations" value={art.observations}
                      onChange={(e) => updateArticle(i, "observations", e.target.value)}
                      size="small"
                      InputProps={{ startAdornment: <Notes sx={{ color: C.muted, fontSize: 16, mr: 0.5 }} /> }}
                      sx={{ flex: 1, minWidth: 140, ...iSx }} />
                    {form.articles.length > 1 && (
                      <IconButton size="small" onClick={() => removeArticle(i)} sx={{ color: C.red, mt: 0.3 }}>
                        <Close fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setOpenDepot(false)} sx={{ color: C.muted, textTransform: "none" }}>Annuler</Button>
          <Button variant="contained" onClick={handleSubmitDepot} disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <LocalLaundryService />}
            sx={{ bgcolor: C.accent, "&:hover": { bgcolor: "#e05a45" }, textTransform: "none", fontWeight: 600, borderRadius: 2, px: 3 }}>
            {saving ? "Création..." : "Créer le dépôt"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══ MODAL DÉTAIL ══ */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: C.surface, border: `1px solid ${C.border}`, borderRadius: 3 } }}>
        {selectedCmd && (
          <>
            <Box sx={{ bgcolor: C.card, p: 3, display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ bgcolor: C.accent, width: 48, height: 48 }}><LocalLaundryService /></Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: C.text }}>
                  Commande #{selectedCmd.id}
                </Typography>
                <Chip label={statutInfo(selectedCmd.statut).label} size="small"
                  sx={{ bgcolor: `${statutInfo(selectedCmd.statut).color}20`, color: statutInfo(selectedCmd.statut).color,
                    border: `1px solid ${statutInfo(selectedCmd.statut).color}40`, fontWeight: 600, fontSize: 11 }} />
              </Box>
              <PdfActions type="ticketDepot"   id={selectedCmd.id} variant="icon" />
              <PdfActions type="factureClient" id={selectedCmd.id} variant="icon" />
              <IconButton onClick={() => setOpenDetail(false)} sx={{ color: C.muted }}><Close fontSize="small" /></IconButton>
            </Box>

            <DialogContent sx={{ pt: 3 }}>
              {/* Timeline */}
              <Typography variant="caption" sx={{ color: C.muted, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>
                Progression
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mt: 1.5, mb: 3 }}>
                {TIMELINE_STEPS.map((step, idx) => {
                  const info = statutInfo(step);
                  const done = TIMELINE_STEPS.indexOf(selectedCmd.statut) >= idx;
                  return (
                    <Box key={step} sx={{ display: "flex", alignItems: "center", flex: idx < TIMELINE_STEPS.length - 1 ? 1 : "none" }}>
                      <Tooltip title={info.label}>
                        <Box sx={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                          bgcolor: done ? info.color : C.card, border: `2px solid ${done ? info.color : C.border}`,
                          color: done ? "#000" : C.muted, boxShadow: selectedCmd.statut === step ? `0 0 12px ${info.color}80` : "none",
                          transition: "all 0.3s", flexShrink: 0 }}>
                          {done ? <CheckCircle sx={{ fontSize: 16 }} /> : <Schedule sx={{ fontSize: 16 }} />}
                        </Box>
                      </Tooltip>
                      {idx < TIMELINE_STEPS.length - 1 && (
                        <Box sx={{ flex: 1, height: 2,
                          bgcolor: done && TIMELINE_STEPS.indexOf(selectedCmd.statut) > idx ? info.color : C.border,
                          mx: 0.5 }} />
                      )}
                    </Box>
                  );
                })}
              </Box>

              {/* Infos */}
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 3 }}>
                {[
                  { label: "Client",       value: `#${selectedCmd.clientId}` },
                  { label: "Montant total", value: selectedCmd.montantTotal ? `${selectedCmd.montantTotal} FCFA` : "—" },
                  { label: "Date dépôt",   value: formatDate(selectedCmd.dateDepot) },
                  { label: "Retrait prévu", value: formatDate(selectedCmd.dateRetraitPrevue) },
                ].map(({ label, value }) => (
                  <Box key={label} sx={{ bgcolor: C.card, p: 1.5, borderRadius: 2, border: `1px solid ${C.border}` }}>
                    <Typography variant="caption" sx={{ color: C.muted, display: "block" }}>{label}</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: C.text }}>{value}</Typography>
                  </Box>
                ))}
              </Box>

              {/* Articles */}
              <Typography variant="caption" sx={{ color: C.muted, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>
                Articles ({selectedCmd.articles?.length || 0})
              </Typography>
              <Stack spacing={1} sx={{ mt: 1.5, mb: 3 }}>
                {selectedCmd.articles?.map((art, i) => (
                  <Box key={i} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                    p: 1.5, bgcolor: C.card, borderRadius: 2, border: `1px solid ${C.border}` }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ color: C.text }}>{art.typeVetement}</Typography>
                      <Typography variant="caption" sx={{ color: C.muted }}>
                        {art.service}{art.codeBarres ? ` · ${art.codeBarres}` : ""}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Chip label={art.statut || "EN_ATTENTE"} size="small"
                        sx={{ fontSize: 10, bgcolor: `${C.blue}20`, color: C.blue }} />
                      {art.tarifUnitaire && (
                        <Typography variant="caption" sx={{ color: C.green, display: "block", mt: 0.3 }}>
                          {art.tarifUnitaire} FCFA
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Stack>

              {/* Documents PDF */}
              <Box sx={{ p: 2, bgcolor: C.card, borderRadius: 2, border: `1px solid ${C.border}`, mb: 2 }}>
                <Typography variant="caption" sx={{ color: C.muted, display: "block", mb: 1.5, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>
                  Documents
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: C.muted, display: "block", mb: 0.8, fontSize: 10 }}>Ticket dépôt</Typography>
                    <PdfActions type="ticketDepot" id={selectedCmd.id} variant="buttons" size="small" />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: C.muted, display: "block", mb: 0.8, fontSize: 10 }}>Facture client</Typography>
                    <PdfActions type="factureClient" id={selectedCmd.id} variant="buttons" size="small" />
                  </Box>
                </Box>
              </Box>

              {/* Changer statut — ✅ seulement les transitions autorisées */}
              <Box sx={{ p: 2, bgcolor: C.card, borderRadius: 2, border: `1px solid ${C.border}` }}>
                <Typography variant="caption" sx={{ color: C.muted, display: "block", mb: 1.5, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>
                  Changer le statut
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {(TRANSITIONS_AUTORISEES[selectedCmd.statut] || []).length === 0 ? (
                    <Typography variant="caption" sx={{ color: C.muted }}>
                      Commande terminée — aucune transition possible
                    </Typography>
                  ) : (
                    (TRANSITIONS_AUTORISEES[selectedCmd.statut] || []).map((key) => {
                      const s = statutInfo(key);
                      return (
                        <Chip key={key}
                          icon={<Box sx={{ color: `${s.color} !important`, display: "flex" }}>{s.icon}</Box>}
                          label={s.label}
                          onClick={async () => {
                            try {
                              const updated = await commandeService.changerStatut(selectedCmd.id, key);
                              setSelectedCmd(updated);
                              setCommandes((prev) => prev.map((c) => c.id === updated.id ? updated : c));
                              notify(`Statut → ${s.label} ✓`);
                            } catch { notify("Erreur changement statut", "error"); }
                          }}
                          sx={{ bgcolor: `${s.color}15`, color: s.color, border: `1px solid ${s.color}40`,
                            cursor: "pointer", fontWeight: 500, "&:hover": { bgcolor: `${s.color}30` } }} />
                      );
                    })
                  )}
                </Box>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>

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

// ─── KanbanCard ────────────────────────────────────────────────────────────────
function KanbanCard({ cmd, colColor, clients, onDragStart, onVoir, onStatut }) {
  const client = clients.find((c) => c.id === cmd.clientId);

  // ✅ Prochain statut selon les transitions autorisées
  const nextKey    = (TRANSITIONS_AUTORISEES[cmd.statut] || [])[0];
  const nextStatut = nextKey ? STATUTS.find((s) => s.key === nextKey) : null;

  return (
    <Paper draggable onDragStart={() => onDragStart(cmd)} elevation={0}
      sx={{ bgcolor: C.card, border: `1px solid ${C.border}`, borderLeft: `3px solid ${colColor}`,
        borderRadius: 2, p: 2, cursor: "grab", transition: "all 0.15s",
        "&:hover": { border: `1px solid ${colColor}60`, borderLeft: `3px solid ${colColor}`,
          transform: "translateY(-1px)", boxShadow: `0 4px 20px ${colColor}20` },
        "&:active": { cursor: "grabbing" } }}>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
        <Typography variant="body2" fontWeight={700} sx={{ color: C.text }}>#{cmd.id}</Typography>
        <Box sx={{ display: "flex", gap: 0.3 }}>
          <PdfActions type="ticketDepot" id={cmd.id} variant="icon" />
          <Tooltip title="Voir détails">
            <IconButton size="small" onClick={() => onVoir(cmd.id)} sx={{ color: C.muted, p: 0.3 }}>
              <Visibility sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Avatar sx={{ width: 22, height: 22, bgcolor: C.accent, fontSize: 10 }}>
          {client ? (client.prenom?.[0] || "") + (client.nom?.[0] || "") : "?"}
        </Avatar>
        <Typography variant="caption" sx={{ color: C.muted }}>
          {client ? `${client.prenom} ${client.nom}` : `Client #${cmd.clientId}`}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
        <Chip icon={<Inventory2 sx={{ fontSize: 11 }} />}
          label={`${cmd.articles?.length || 0} article${(cmd.articles?.length || 0) > 1 ? "s" : ""}`}
          size="small" sx={{ bgcolor: `${C.blue}15`, color: C.blue, fontSize: 10, height: 20 }} />
        {cmd.montantTotal && (
          <Chip label={`${cmd.montantTotal} FCFA`} size="small"
            sx={{ bgcolor: `${C.green}15`, color: C.green, fontSize: 10, height: 20 }} />
        )}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1.5 }}>
        <Schedule sx={{ fontSize: 12, color: C.muted }} />
        <Typography variant="caption" sx={{ color: C.muted }}>
          {cmd.dateRetraitPrevue
            ? new Date(cmd.dateRetraitPrevue).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
            : "—"}
        </Typography>
      </Box>

      {/* ✅ Bouton transition autorisée uniquement */}
      {nextStatut && (
        <Button size="small" endIcon={<ArrowForward sx={{ fontSize: 12 }} />}
          onClick={() => onStatut(cmd.id, nextStatut.key)}
          sx={{ fontSize: 11, textTransform: "none", color: nextStatut.color,
            bgcolor: `${nextStatut.color}15`, borderRadius: 1.5, px: 1, py: 0.3, width: "100%",
            "&:hover": { bgcolor: `${nextStatut.color}25` } }}>
          → {nextStatut.label}
        </Button>
      )}
    </Paper>
  );
}

const iSx = {
  "& .MuiOutlinedInput-root": {
    color: C.text,
    "& fieldset": { borderColor: C.border },
    "&:hover fieldset": { borderColor: C.accent },
    "&.Mui-focused fieldset": { borderColor: C.accent },
  },
  "& .MuiInputLabel-root": { color: C.muted },
  "& .MuiInputLabel-root.Mui-focused": { color: C.accent },
  "& .MuiFormHelperText-root": { color: C.red },
};
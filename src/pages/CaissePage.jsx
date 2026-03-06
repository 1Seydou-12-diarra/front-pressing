import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box, Button, Typography, Paper, Stack, Chip, Divider,
  TextField, IconButton, Tooltip, Snackbar, Alert, Dialog,
  DialogTitle, DialogContent, DialogActions, CircularProgress,
  Avatar, InputAdornment, ToggleButton, ToggleButtonGroup, Badge,
} from "@mui/material";
import {
  Payment, CreditCard, AccountBalanceWallet, PhoneAndroid,
  Print, Close, Receipt, Search, CheckCircle, Refresh,
  PointOfSale, TrendingUp, AttachMoney, Undo, Lock,
  LocalLaundryService, Person, CalendarMonth,
} from "@mui/icons-material";
import paiementService from "../services/paiementService";
import commandeService from "../services/commandeService";
import ClientService from "../services/ClientService";

// ─── Palette — style "terminal de caisse" sombre & précis ─────────────────────
const C = {
  bg:       "#080c10",
  surface:  "#0d1117",
  card:     "#161b22",
  border:   "#21262d",
  text:     "#cdd9e5",
  muted:    "#768390",
  green:    "#57ab5a",
  greenDim: "#1b3a1f",
  blue:     "#539bf5",
  blueDim:  "#102040",
  yellow:   "#c69026",
  yellowDim:"#2d2208",
  purple:   "#986ee2",
  purpleDim:"#1e1535",
  red:      "#e5534b",
  redDim:   "#2d1117",
  white:    "#ffffff",
};

const MODES = [
  { value: "ESPECES",       label: "Espèces",      icon: <AttachMoney /> },
  { value: "CARTE",         label: "Carte",        icon: <CreditCard /> },
  { value: "MOBILE_MONEY",  label: "Mobile Money", icon: <PhoneAndroid /> },
  { value: "VIREMENT",      label: "Virement",     icon: <AccountBalanceWallet /> },
];

const formatMontant = (v) =>
  v ? Number(v).toLocaleString("fr-FR") + " FCFA" : "0 FCFA";

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

// ═══════════════════════════════════════════════════════════════════════════════
export default function CaissePage() {
  // ── Recherche commande ──
  const [searchId, setSearchId]     = useState("");
  const [commande, setCommande]     = useState(null);
  const [client, setClient]         = useState(null);
  const [totalPaye, setTotalPaye]   = useState(0);
  const [loadingCmd, setLoadingCmd] = useState(false);

  // ── Paiement ──
  const [mode, setMode]             = useState("ESPECES");
  const [montant, setMontant]       = useState("");
  const [reference, setReference]   = useState("");
  const [saving, setSaving]         = useState(false);
  const [paiementOk, setPaiementOk] = useState(null);

  // ── Remboursement ──
  const [openRemb, setOpenRemb]     = useState(false);
  const [montantRemb, setMontantRemb] = useState("");
  const [savingRemb, setSavingRemb] = useState(false);

  // ── Ticket ──
  const [openTicket, setOpenTicket] = useState(false);
  const ticketRef = useRef(null);

  // ── Clôture ──
  const [openCloture, setOpenCloture] = useState(false);
  const [clotureDone, setClotureDone] = useState(false);

  // ── Stats du jour (simulées côté front) ──
  const [statsJour, setStatsJour] = useState({ total: 0, nb: 0, especes: 0, carte: 0, mobile: 0 });

  // ── Snackbar ──
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });
  const notify = (msg, severity = "success") => setSnack({ open: true, msg, severity });

  // ── Rechercher une commande ──
  const rechercherCommande = async () => {
    if (!searchId.trim()) return;
    setLoadingCmd(true);
    setCommande(null); setClient(null); setTotalPaye(0); setPaiementOk(null);
    try {
      const cmd = await commandeService.getCommande(Number(searchId));
      setCommande(cmd);
      setMontant(String(cmd.montantTotal || ""));
      // Charger le client
      try {
        const c = await ClientService.trouverParId(cmd.clientId);
        setClient(c);
      } catch { /* silencieux */ }
      // Charger total déjà payé
      try {
        const tp = await paiementService.totalPaye(cmd.id);
        setTotalPaye(tp || 0);
      } catch { setTotalPaye(0); }
    } catch {
      notify("Commande introuvable", "error");
    } finally {
      setLoadingCmd(false);
    }
  };

  const resteAPayer = commande
    ? Math.max(0, Number(commande.montantTotal || 0) - Number(totalPaye))
    : 0;

  const monnaieRendue = mode === "ESPECES" && montant
    ? Math.max(0, Number(montant) - resteAPayer)
    : 0;

  // ── Enregistrer paiement ──
  const handlePayer = async () => {
    if (!commande) return;
    if (!montant || Number(montant) <= 0) { notify("Montant invalide", "warning"); return; }
    setSaving(true);
    try {
      const result = await paiementService.payer({
        commandeId: commande.id,
        montant: Number(montant),
        modePaiement: mode,
        reference: reference || null,
      });
      setPaiementOk(result);
      setTotalPaye((prev) => prev + Number(montant));
      // Mise à jour stats
      setStatsJour((s) => ({
        total: s.total + Number(montant),
        nb: s.nb + 1,
        especes: s.especes + (mode === "ESPECES" ? Number(montant) : 0),
        carte: s.carte + (mode === "CARTE" ? Number(montant) : 0),
        mobile: s.mobile + (mode === "MOBILE_MONEY" ? Number(montant) : 0),
      }));
      notify("Paiement enregistré ✓");
      setOpenTicket(true);
    } catch {
      notify("Erreur lors du paiement", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Remboursement ──
  const handleRembourser = async () => {
    if (!commande || !montantRemb) return;
    setSavingRemb(true);
    try {
      await paiementService.rembourser(commande.id, Number(montantRemb));
      setTotalPaye((prev) => Math.max(0, prev - Number(montantRemb)));
      notify("Remboursement effectué ✓");
      setOpenRemb(false);
      setMontantRemb("");
    } catch {
      notify("Erreur remboursement", "error");
    } finally {
      setSavingRemb(false);
    }
  };

  // ── Imprimer ticket ──
  const imprimerTicket = () => {
    const content = ticketRef.current?.innerHTML;
    if (!content) return;
    const w = window.open("", "_blank", "width=320,height=600");
    w.document.write(`
      <html><head><title>Ticket</title>
      <style>
        body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 16px; width: 280px; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #000; margin: 8px 0; }
        .row { display: flex; justify-content: space-between; }
      </style></head>
      <body>${content}</body></html>
    `);
    w.document.close();
    w.print();
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ bgcolor: C.bg, minHeight: "100%", fontFamily: "'JetBrains Mono', 'Courier New', monospace", p: 3 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap');`}</style>

      {/* ── En-tête ── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ bgcolor: C.greenDim, p: 1, borderRadius: 2, border: `1px solid ${C.green}40` }}>
            <PointOfSale sx={{ color: C.green, fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: C.text, letterSpacing: "-0.3px" }}>
              Caisse
            </Typography>
            <Typography variant="caption" sx={{ color: C.muted }}>
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Lock />}
          onClick={() => setOpenCloture(true)}
          sx={{ borderColor: C.red, color: C.red, textTransform: "none", borderRadius: 2, fontSize: 12 }}
        >
          Clôture journalière
        </Button>
      </Box>

      {/* ── Layout 2 colonnes ── */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 380px" }, gap: 2 }}>

        {/* ════ COLONNE GAUCHE — Terminal de paiement ════ */}
        <Stack spacing={2}>

          {/* Recherche commande */}
          <Paper sx={{ p: 2.5, bgcolor: C.card, border: `1px solid ${C.border}`, borderRadius: 2 }}>
            <Typography variant="caption" sx={{ color: C.muted, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, display: "block", mb: 1.5 }}>
              Rechercher une commande
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <TextField
                placeholder="N° commande..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && rechercherCommande()}
                size="small"
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Receipt sx={{ color: C.muted, fontSize: 16 }} /></InputAdornment>,
                }}
                sx={{ flex: 1, ...iSx }}
              />
              <Button
                variant="contained"
                onClick={rechercherCommande}
                disabled={loadingCmd}
                startIcon={loadingCmd ? <CircularProgress size={14} color="inherit" /> : <Search />}
                sx={{ bgcolor: C.blue, "&:hover": { bgcolor: "#3d7fd4" }, textTransform: "none", borderRadius: 2, fontFamily: "inherit" }}
              >
                Charger
              </Button>
            </Box>
          </Paper>

          {/* Récapitulatif commande */}
          {commande && (
            <Paper sx={{ bgcolor: C.card, border: `1px solid ${C.border}`, borderRadius: 2, overflow: "hidden" }}>
              {/* Header commande */}
              <Box sx={{ bgcolor: C.surface, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}` }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <LocalLaundryService sx={{ color: C.blue, fontSize: 18 }} />
                  <Box>
                    <Typography variant="body2" fontWeight={700} sx={{ color: C.text }}>
                      Commande #{commande.id}
                    </Typography>
                    {client && (
                      <Typography variant="caption" sx={{ color: C.muted }}>
                        {client.prenom} {client.nom} · {client.telephone}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Chip
                  label={commande.statut}
                  size="small"
                  sx={{ bgcolor: `${C.blue}20`, color: C.blue, fontSize: 10, fontFamily: "inherit" }}
                />
              </Box>

              {/* Articles */}
              <Box sx={{ p: 2 }}>
                <Typography variant="caption" sx={{ color: C.muted, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, display: "block", mb: 1 }}>
                  Articles
                </Typography>
                <Stack spacing={0.8} sx={{ mb: 2 }}>
                  {commande.articles?.map((art, i) => (
                    <Box key={i} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.5 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: C.text, fontWeight: 500 }}>
                          {art.typeVetement}
                        </Typography>
                        <Typography variant="caption" sx={{ color: C.muted, display: "block" }}>
                          {art.service}
                        </Typography>
                      </Box>
                      <Typography variant="caption" fontWeight={600} sx={{ color: C.green }}>
                        {formatMontant(art.tarifUnitaire)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>

                <Divider sx={{ borderColor: C.border, borderStyle: "dashed", mb: 2 }} />

                {/* Totaux */}
                <Stack spacing={0.8}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="caption" sx={{ color: C.muted }}>Montant total</Typography>
                    <Typography variant="caption" fontWeight={600} sx={{ color: C.text }}>{formatMontant(commande.montantTotal)}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="caption" sx={{ color: C.muted }}>Déjà payé</Typography>
                    <Typography variant="caption" fontWeight={600} sx={{ color: C.green }}>{formatMontant(totalPaye)}</Typography>
                  </Box>
                  <Divider sx={{ borderColor: C.border }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                    <Typography variant="body2" fontWeight={700} sx={{ color: C.text }}>Reste à payer</Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ color: resteAPayer > 0 ? C.yellow : C.green }}>
                      {formatMontant(resteAPayer)}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Paper>
          )}

          {/* Terminal paiement */}
          {commande && resteAPayer > 0 && (
            <Paper sx={{ bgcolor: C.card, border: `1px solid ${C.border}`, borderRadius: 2, p: 2.5 }}>
              <Typography variant="caption" sx={{ color: C.muted, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, display: "block", mb: 2 }}>
                Mode de paiement
              </Typography>

              {/* Choix mode */}
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 2.5 }}>
                {MODES.map((m) => (
                  <Box
                    key={m.value}
                    onClick={() => setMode(m.value)}
                    sx={{
                      p: 1.5, borderRadius: 2, cursor: "pointer",
                      border: `1px solid ${mode === m.value ? C.green : C.border}`,
                      bgcolor: mode === m.value ? C.greenDim : C.surface,
                      display: "flex", alignItems: "center", gap: 1,
                      transition: "all 0.15s",
                      "&:hover": { borderColor: `${C.green}60` },
                    }}
                  >
                    <Box sx={{ color: mode === m.value ? C.green : C.muted, fontSize: 18, display: "flex" }}>
                      {m.icon}
                    </Box>
                    <Typography variant="caption" fontWeight={mode === m.value ? 700 : 400} sx={{ color: mode === m.value ? C.green : C.muted }}>
                      {m.label}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Montant + référence */}
              <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
                <TextField
                  label="Montant reçu *"
                  type="number"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  size="small"
                  InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoney sx={{ color: C.muted, fontSize: 16 }} /></InputAdornment> }}
                  sx={{ flex: 1, ...iSx }}
                />
                {(mode === "MOBILE_MONEY" || mode === "VIREMENT" || mode === "CARTE") && (
                  <TextField
                    label="Référence"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    size="small"
                    sx={{ flex: 1, ...iSx }}
                  />
                )}
              </Box>

              {/* Monnaie à rendre */}
              {mode === "ESPECES" && montant && Number(montant) > resteAPayer && (
                <Box sx={{ p: 1.5, bgcolor: C.yellowDim, border: `1px solid ${C.yellow}40`, borderRadius: 2, mb: 2, display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" sx={{ color: C.yellow }}>💰 Monnaie à rendre</Typography>
                  <Typography variant="body2" fontWeight={700} sx={{ color: C.yellow }}>{formatMontant(monnaieRendue)}</Typography>
                </Box>
              )}

              {/* Bouton payer */}
              <Button
                variant="contained"
                fullWidth
                onClick={handlePayer}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Payment />}
                sx={{
                  bgcolor: C.green, "&:hover": { bgcolor: "#469649" },
                  textTransform: "none", fontWeight: 700, borderRadius: 2,
                  py: 1.5, fontSize: 15, fontFamily: "inherit",
                  boxShadow: `0 0 20px ${C.green}40`,
                }}
              >
                {saving ? "Traitement..." : `Encaisser ${formatMontant(montant || 0)}`}
              </Button>
            </Paper>
          )}

          {/* Paiement complet */}
          {commande && resteAPayer === 0 && (
            <Paper sx={{ bgcolor: C.greenDim, border: `1px solid ${C.green}40`, borderRadius: 2, p: 3, textAlign: "center" }}>
              <CheckCircle sx={{ color: C.green, fontSize: 40, mb: 1 }} />
              <Typography variant="body1" fontWeight={700} sx={{ color: C.green }}>Commande soldée</Typography>
              <Typography variant="caption" sx={{ color: C.muted }}>Total payé : {formatMontant(totalPaye)}</Typography>
              <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", mt: 2 }}>
                <Button
                  startIcon={<Print />}
                  onClick={() => setOpenTicket(true)}
                  sx={{ color: C.green, borderColor: `${C.green}60`, border: "1px solid", textTransform: "none", borderRadius: 2, fontFamily: "inherit" }}
                >
                  Ticket
                </Button>
                <Button
                  startIcon={<Undo />}
                  onClick={() => setOpenRemb(true)}
                  sx={{ color: C.yellow, borderColor: `${C.yellow}60`, border: "1px solid", textTransform: "none", borderRadius: 2, fontFamily: "inherit" }}
                >
                  Rembourser
                </Button>
              </Box>
            </Paper>
          )}
        </Stack>

        {/* ════ COLONNE DROITE — Stats jour ════ */}
        <Stack spacing={2}>
          <Paper sx={{ bgcolor: C.card, border: `1px solid ${C.border}`, borderRadius: 2, p: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <TrendingUp sx={{ color: C.green, fontSize: 18 }} />
              <Typography variant="caption" fontWeight={700} sx={{ color: C.text, textTransform: "uppercase", letterSpacing: 1 }}>
                Récap du jour
              </Typography>
            </Box>

            <Stack spacing={1.5}>
              <StatRow label="Total encaissé" value={formatMontant(statsJour.total)} color={C.green} big />
              <StatRow label="Transactions" value={statsJour.nb} color={C.blue} />
              <Divider sx={{ borderColor: C.border, borderStyle: "dashed" }} />
              <StatRow label="Espèces" value={formatMontant(statsJour.especes)} color={C.yellow} />
              <StatRow label="Carte" value={formatMontant(statsJour.carte)} color={C.purple} />
              <StatRow label="Mobile Money" value={formatMontant(statsJour.mobile)} color={C.blue} />
            </Stack>
          </Paper>

          {/* Aide rapide */}
          <Paper sx={{ bgcolor: C.card, border: `1px solid ${C.border}`, borderRadius: 2, p: 2 }}>
            <Typography variant="caption" sx={{ color: C.muted, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, display: "block", mb: 1.5 }}>
              Guide rapide
            </Typography>
            {[
              ["1", "Saisir le N° commande"],
              ["2", "Choisir le mode de paiement"],
              ["3", "Saisir le montant reçu"],
              ["4", "Cliquer sur Encaisser"],
              ["5", "Imprimer le ticket"],
            ].map(([n, txt]) => (
              <Box key={n} sx={{ display: "flex", gap: 1, mb: 0.8, alignItems: "center" }}>
                <Box sx={{ width: 18, height: 18, borderRadius: "50%", bgcolor: C.border, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Typography sx={{ fontSize: 10, color: C.muted, fontFamily: "inherit" }}>{n}</Typography>
                </Box>
                <Typography variant="caption" sx={{ color: C.muted }}>{txt}</Typography>
              </Box>
            ))}
          </Paper>
        </Stack>
      </Box>

      {/* ════ MODAL TICKET ════ */}
      <Dialog
        open={openTicket}
        onClose={() => setOpenTicket(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { bgcolor: C.card, border: `1px solid ${C.border}`, borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: C.text, fontWeight: 700, pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Receipt sx={{ color: C.green }} />
            Ticket de caisse
          </Box>
          <IconButton onClick={() => setOpenTicket(false)} sx={{ color: C.muted }}><Close fontSize="small" /></IconButton>
        </DialogTitle>
        <Divider sx={{ borderColor: C.border }} />
        <DialogContent>
          {/* Contenu du ticket à imprimer */}
          <Box
            ref={ticketRef}
            sx={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              color: "#000",
              bgcolor: "#fff",
              p: 2,
              borderRadius: 1,
            }}
          >
            <Box className="center" sx={{ textAlign: "center", mb: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14, fontFamily: "inherit" }}>PressGest</Typography>
              <Typography sx={{ fontSize: 11, fontFamily: "inherit" }}>Ticket de caisse</Typography>
              <Typography sx={{ fontSize: 10, color: "#666", fontFamily: "inherit" }}>
                {new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </Typography>
            </Box>
            <Divider sx={{ borderStyle: "dashed", my: 1 }} />
            {commande && (
              <>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Commande #</span><span>{commande.id}</span>
                </Box>
                {client && (
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Client</span><span>{client.prenom} {client.nom}</span>
                  </Box>
                )}
                <Divider sx={{ borderStyle: "dashed", my: 1 }} />
                {commande.articles?.map((art, i) => (
                  <Box key={i} sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{art.typeVetement} - {art.service}</span>
                    <span>{formatMontant(art.tarifUnitaire)}</span>
                  </Box>
                ))}
                <Divider sx={{ borderStyle: "dashed", my: 1 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                  <span>TOTAL</span><span>{formatMontant(commande.montantTotal)}</span>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Mode</span><span>{mode}</span>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Montant reçu</span><span>{formatMontant(montant)}</span>
                </Box>
                {mode === "ESPECES" && monnaieRendue > 0 && (
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Monnaie</span><span>{formatMontant(monnaieRendue)}</span>
                  </Box>
                )}
              </>
            )}
            <Divider sx={{ borderStyle: "dashed", my: 1 }} />
            <Typography sx={{ textAlign: "center", fontSize: 11, fontFamily: "inherit" }}>Merci de votre confiance !</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setOpenTicket(false)} sx={{ color: C.muted, textTransform: "none", fontFamily: "inherit" }}>Fermer</Button>
          <Button
            variant="contained"
            startIcon={<Print />}
            onClick={imprimerTicket}
            sx={{ bgcolor: C.green, "&:hover": { bgcolor: "#469649" }, textTransform: "none", borderRadius: 2, fontFamily: "inherit" }}
          >
            Imprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* ════ MODAL REMBOURSEMENT ════ */}
      <Dialog
        open={openRemb}
        onClose={() => setOpenRemb(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { bgcolor: C.card, border: `1px solid ${C.border}`, borderRadius: 3 } }}
      >
        <DialogTitle sx={{ color: C.text, fontWeight: 700, display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Undo sx={{ color: C.yellow }} />
            Remboursement partiel
          </Box>
          <IconButton onClick={() => setOpenRemb(false)} sx={{ color: C.muted }}><Close fontSize="small" /></IconButton>
        </DialogTitle>
        <Divider sx={{ borderColor: C.border }} />
        <DialogContent sx={{ pt: 2.5 }}>
          <Typography variant="caption" sx={{ color: C.muted, display: "block", mb: 2 }}>
            Total payé : <strong style={{ color: C.text }}>{formatMontant(totalPaye)}</strong>
          </Typography>
          <TextField
            label="Montant à rembourser"
            type="number"
            value={montantRemb}
            onChange={(e) => setMontantRemb(e.target.value)}
            fullWidth size="small"
            InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoney sx={{ color: C.muted, fontSize: 16 }} /></InputAdornment> }}
            sx={iSx}
          />
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setOpenRemb(false)} sx={{ color: C.muted, textTransform: "none", fontFamily: "inherit" }}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleRembourser}
            disabled={savingRemb}
            startIcon={savingRemb ? <CircularProgress size={14} color="inherit" /> : <Undo />}
            sx={{ bgcolor: C.yellow, "&:hover": { bgcolor: "#a57820" }, textTransform: "none", borderRadius: 2, fontFamily: "inherit" }}
          >
            Rembourser
          </Button>
        </DialogActions>
      </Dialog>

      {/* ════ MODAL CLÔTURE ════ */}
      <Dialog
        open={openCloture}
        onClose={() => setOpenCloture(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { bgcolor: C.card, border: `1px solid ${C.border}`, borderRadius: 3 } }}
      >
        <DialogTitle sx={{ color: C.text, fontWeight: 700, display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Lock sx={{ color: C.red }} />
            Clôture journalière
          </Box>
          <IconButton onClick={() => setOpenCloture(false)} sx={{ color: C.muted }}><Close fontSize="small" /></IconButton>
        </DialogTitle>
        <Divider sx={{ borderColor: C.border }} />
        <DialogContent sx={{ pt: 2.5 }}>
          {!clotureDone ? (
            <>
              <Typography variant="body2" sx={{ color: C.muted, mb: 2 }}>
                Récapitulatif de la journée du <strong style={{ color: C.text }}>{new Date().toLocaleDateString("fr-FR")}</strong>
              </Typography>
              <Stack spacing={1}>
                <StatRow label="Total encaissé" value={formatMontant(statsJour.total)} color={C.green} big />
                <StatRow label="Nb transactions" value={statsJour.nb} color={C.blue} />
                <Divider sx={{ borderColor: C.border, borderStyle: "dashed" }} />
                <StatRow label="Espèces" value={formatMontant(statsJour.especes)} color={C.yellow} />
                <StatRow label="Carte" value={formatMontant(statsJour.carte)} color={C.purple} />
                <StatRow label="Mobile Money" value={formatMontant(statsJour.mobile)} color={C.blue} />
              </Stack>
              <Box sx={{ mt: 2.5, p: 1.5, bgcolor: C.redDim, border: `1px solid ${C.red}40`, borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: C.red }}>
                  ⚠ Cette action clôture la caisse pour aujourd'hui. Confirmer ?
                </Typography>
              </Box>
            </>
          ) : (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <CheckCircle sx={{ color: C.green, fontSize: 48, mb: 1 }} />
              <Typography variant="body1" fontWeight={700} sx={{ color: C.green }}>Caisse clôturée</Typography>
              <Typography variant="caption" sx={{ color: C.muted }}>
                Récapitulatif enregistré pour le {new Date().toLocaleDateString("fr-FR")}
              </Typography>
            </Box>
          )}
        </DialogContent>
        {!clotureDone && (
          <DialogActions sx={{ px: 2.5, pb: 2.5, gap: 1 }}>
            <Button onClick={() => setOpenCloture(false)} sx={{ color: C.muted, textTransform: "none", fontFamily: "inherit" }}>Annuler</Button>
            <Button
              variant="contained"
              startIcon={<Lock />}
              onClick={() => { setClotureDone(true); notify("Caisse clôturée ✓"); }}
              sx={{ bgcolor: C.red, "&:hover": { bgcolor: "#c43d37" }, textTransform: "none", borderRadius: 2, fontFamily: "inherit" }}
            >
              Confirmer la clôture
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// ─── StatRow ──────────────────────────────────────────────────────────────────
function StatRow({ label, value, color, big }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Typography variant="caption" sx={{ color: C.muted }}>{label}</Typography>
      <Typography variant={big ? "body2" : "caption"} fontWeight={big ? 700 : 500} sx={{ color }}>
        {value}
      </Typography>
    </Box>
  );
}

// ─── Styles TextField ─────────────────────────────────────────────────────────
const iSx = {
  "& .MuiOutlinedInput-root": {
    color: C.text,
    fontFamily: "'JetBrains Mono', monospace",
    "& fieldset": { borderColor: C.border },
    "&:hover fieldset": { borderColor: C.green },
    "&.Mui-focused fieldset": { borderColor: C.green },
  },
  "& .MuiInputLabel-root": { color: C.muted },
  "& .MuiInputLabel-root.Mui-focused": { color: C.green },
};
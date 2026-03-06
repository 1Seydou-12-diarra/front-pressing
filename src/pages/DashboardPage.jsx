import { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Paper, Stack, Chip, Avatar,
  CircularProgress, IconButton, Tooltip, Divider,
} from "@mui/material";
import {
  TrendingUp, TrendingDown, ShoppingBag, HourglassEmpty,
  Warning, People, Refresh, AttachMoney, CheckCircle,
  LocalLaundryService, EmojiEvents,
} from "@mui/icons-material";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import commandeService from "../services/commandeService";
import ClientService from "../services/ClientService";

// ─── Palette — moderne dark avec accents chauds ────────────────────────────
const C = {
  bg:      "#070b0f",
  surface: "#0e1419",
  card:    "#141c24",
  border:  "#1e2d3d",
  text:    "#d4e0ec",
  muted:   "#5a7a94",
  cyan:    "#38bdf8",
  green:   "#4ade80",
  amber:   "#fbbf24",
  red:     "#f87171",
  purple:  "#a78bfa",
  pink:    "#f472b6",
  indigo:  "#818cf8",
};

const PIE_COLORS = [C.cyan, C.green, C.amber, C.purple, C.pink, C.indigo, C.red];

const fmt = (v) => Number(v || 0).toLocaleString("fr-FR");
const fmtFcfa = (v) => `${fmt(v)} FCFA`;

// ─── Génère des données CA sur 30 jours à partir des commandes réelles ───────
function genererCA30Jours(commandes) {
  const map = {};
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
    map[key] = 0;
  }
  commandes.forEach((cmd) => {
    if (!cmd.dateDepot) return;
    const d = new Date(cmd.dateDepot);
    const key = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
    if (key in map) map[key] += Number(cmd.montantTotal || 0);
  });
  return Object.entries(map).map(([date, ca]) => ({ date, ca }));
}

// ─── Répartition services ────────────────────────────────────────────────────
function genererRepartitionServices(commandes) {
  const map = {};
  commandes.forEach((cmd) =>
    cmd.articles?.forEach((art) => {
      const s = art.service || "Autre";
      map[s] = (map[s] || 0) + 1;
    })
  );
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

// ─── Top clients ─────────────────────────────────────────────────────────────
function genererTopClients(commandes, clients) {
  const map = {};
  commandes.forEach((cmd) => {
    const id = cmd.clientId;
    if (!map[id]) map[id] = { clientId: id, total: 0, nb: 0 };
    map[id].total += Number(cmd.montantTotal || 0);
    map[id].nb += 1;
  });
  return Object.values(map)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map((item) => {
      const c = clients.find((cl) => cl.id === item.clientId);
      return {
        ...item,
        nom: c ? `${c.prenom} ${c.nom}` : `Client #${item.clientId}`,
        initiales: c ? (c.prenom?.[0] || "") + (c.nom?.[0] || "") : "?",
      };
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const [commandes, setCommandes] = useState([]);
  const [clients, setClients]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // ── Chargement ──
  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const [cmds, cls] = await Promise.all([
        commandeService.listerCommandes(),
        ClientService.rechercher(),
      ]);
      setCommandes(cmds);
      setClients(cls);
      setLastUpdate(new Date());
    } catch (e) {
      console.error("Dashboard erreur:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  // ── Calculs KPI ──
  const today = new Date().toDateString();

  const caJour = commandes
    .filter((c) => new Date(c.dateDepot).toDateString() === today)
    .reduce((s, c) => s + Number(c.montantTotal || 0), 0);

  const caTotal = commandes.reduce((s, c) => s + Number(c.montantTotal || 0), 0);

  const enAttente = commandes.filter((c) =>
    ["DEPOSE", "EN_COURS"].includes(c.statut)
  ).length;

  const enRetard = commandes.filter((c) => {
    if (!c.dateRetraitPrevue) return false;
    return new Date(c.dateRetraitPrevue) < new Date() &&
      !["LIVRE", "ANNULE"].includes(c.statut);
  }).length;

  const livresJour = commandes.filter((c) =>
    c.statut === "LIVRE" && new Date(c.dateDepot).toDateString() === today
  ).length;

  const tauxCompletion = commandes.length
    ? Math.round((commandes.filter((c) => c.statut === "LIVRE").length / commandes.length) * 100)
    : 0;

  // ── Données graphiques ──
  const ca30 = genererCA30Jours(commandes);
  const repartServices = genererRepartitionServices(commandes);
  const topClients = genererTopClients(commandes, clients);

  // Répartition statuts pour bar chart
  const statuts = ["DEPOSE", "EN_COURS", "PRET", "LIVRE", "ANNULE"];
  const statutColors = [C.cyan, C.amber, C.purple, C.green, C.red];
  const dataStatuts = statuts.map((s, i) => ({
    name: s.replace("_", " "),
    value: commandes.filter((c) => c.statut === s).length,
    color: statutColors[i],
  }));

  if (loading) return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", bgcolor: C.bg }}>
      <Stack alignItems="center" spacing={2}>
        <CircularProgress sx={{ color: C.cyan }} size={40} thickness={2} />
        <Typography variant="caption" sx={{ color: C.muted, fontFamily: "'Outfit', sans-serif" }}>
          Chargement du tableau de bord...
        </Typography>
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: C.bg, minHeight: "100%", p: 3, fontFamily: "'Outfit', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');`}</style>

      {/* ── En-tête ── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 4 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: C.text, letterSpacing: "-0.5px" }}>
            Tableau de bord
          </Typography>
          <Typography variant="caption" sx={{ color: C.muted }}>
            Mis à jour à {lastUpdate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            {" · "}{commandes.length} commandes · {clients.length} clients
          </Typography>
        </Box>
        <Tooltip title="Rafraîchir">
          <IconButton
            onClick={charger}
            sx={{ color: C.muted, bgcolor: C.card, border: `1px solid ${C.border}`, borderRadius: 2 }}
          >
            <Refresh fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* ══════════ KPI WIDGETS ══════════ */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 2, mb: 3 }}>
        <KpiCard
          icon={<AttachMoney />}
          label="CA du jour"
          value={fmtFcfa(caJour)}
          sub={`Total : ${fmtFcfa(caTotal)}`}
          color={C.green}
          trend={caJour > 0 ? "up" : null}
        />
        <KpiCard
          icon={<HourglassEmpty />}
          label="En attente"
          value={enAttente}
          sub="Déposé + En cours"
          color={C.amber}
          trend={enAttente > 5 ? "up" : "down"}
          trendInverse
        />
        <KpiCard
          icon={<Warning />}
          label="En retard"
          value={enRetard}
          sub="Retrait dépassé"
          color={enRetard > 0 ? C.red : C.green}
          trend={enRetard > 0 ? "up" : null}
          trendInverse
        />
        <KpiCard
          icon={<CheckCircle />}
          label="Livrés aujourd'hui"
          value={livresJour}
          sub={`Taux completion : ${tauxCompletion}%`}
          color={C.cyan}
          trend={livresJour > 0 ? "up" : null}
        />
        <KpiCard
          icon={<People />}
          label="Clients actifs"
          value={clients.filter((c) => c.actif).length}
          sub={`Total : ${clients.length}`}
          color={C.purple}
        />
        <KpiCard
          icon={<ShoppingBag />}
          label="Commandes totales"
          value={commandes.length}
          sub={`Ce mois : ${commandes.filter((c) => {
            const d = new Date(c.dateDepot);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          }).length}`}
          color={C.indigo}
        />
      </Box>

      {/* ══════════ GRAPHIQUES ══════════ */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", xl: "2fr 1fr" }, gap: 2, mb: 3 }}>

        {/* CA sur 30 jours */}
        <Paper sx={{ bgcolor: C.card, border: `1px solid ${C.border}`, borderRadius: 3, p: 2.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Box>
              <Typography variant="body2" fontWeight={700} sx={{ color: C.text }}>
                Chiffre d'affaires — 30 derniers jours
              </Typography>
              <Typography variant="caption" sx={{ color: C.muted }}>
                Total : {fmtFcfa(caTotal)}
              </Typography>
            </Box>
            <Chip
              label={`+${ca30.filter((d) => d.ca > 0).length}j actifs`}
              size="small"
              sx={{ bgcolor: `${C.green}20`, color: C.green, fontSize: 10 }}
            />
          </Box>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={ca30} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="caGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.cyan} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={C.cyan} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: C.muted, fontSize: 10, fontFamily: "Outfit" }}
                tickLine={false} axisLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fill: C.muted, fontSize: 10, fontFamily: "Outfit" }}
                tickLine={false} axisLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <RTooltip
                contentStyle={{ bgcolor: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: "Outfit", fontSize: 12 }}
                labelStyle={{ color: C.text }}
                formatter={(v) => [fmtFcfa(v), "CA"]}
              />
              <Area type="monotone" dataKey="ca" stroke={C.cyan} strokeWidth={2} fill="url(#caGrad)" dot={false} activeDot={{ r: 4, fill: C.cyan }} />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>

        {/* Répartition statuts */}
        <Paper sx={{ bgcolor: C.card, border: `1px solid ${C.border}`, borderRadius: 3, p: 2.5 }}>
          <Typography variant="body2" fontWeight={700} sx={{ color: C.text, mb: 2 }}>
            Commandes par statut
          </Typography>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={dataStatuts} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
              <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 9, fontFamily: "Outfit" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: C.muted, fontSize: 9 }} tickLine={false} axisLine={false} />
              <RTooltip
                contentStyle={{ bgcolor: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: "Outfit", fontSize: 12 }}
                formatter={(v, n, p) => [v, p.payload.name]}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {dataStatuts.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Légende statuts */}
          <Stack spacing={0.5} sx={{ mt: 1.5 }}>
            {dataStatuts.map((s) => (
              <Box key={s.name} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: s.color }} />
                  <Typography variant="caption" sx={{ color: C.muted, fontSize: 10 }}>{s.name}</Typography>
                </Box>
                <Typography variant="caption" fontWeight={600} sx={{ color: C.text, fontSize: 10 }}>{s.value}</Typography>
              </Box>
            ))}
          </Stack>
        </Paper>
      </Box>

      {/* ══════════ LIGNE BASSE ══════════ */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", xl: "1fr 1fr 1fr" }, gap: 2 }}>

        {/* Répartition services (Pie) */}
        <Paper sx={{ bgcolor: C.card, border: `1px solid ${C.border}`, borderRadius: 3, p: 2.5 }}>
          <Typography variant="body2" fontWeight={700} sx={{ color: C.text, mb: 2 }}>
            Répartition des services
          </Typography>
          {repartServices.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={repartServices}
                    cx="50%" cy="50%"
                    innerRadius={45} outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {repartServices.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RTooltip
                    contentStyle={{ bgcolor: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: "Outfit", fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <Stack spacing={0.5}>
                {repartServices.map((s, i) => (
                  <Box key={s.name} sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: 1, bgcolor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <Typography variant="caption" sx={{ color: C.muted, fontSize: 10 }}>{s.name}</Typography>
                    </Box>
                    <Typography variant="caption" fontWeight={600} sx={{ color: C.text, fontSize: 10 }}>{s.value}</Typography>
                  </Box>
                ))}
              </Stack>
            </>
          ) : (
            <EmptyState label="Aucun article enregistré" />
          )}
        </Paper>

        {/* Top clients */}
        <Paper sx={{ bgcolor: C.card, border: `1px solid ${C.border}`, borderRadius: 3, p: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <EmojiEvents sx={{ color: C.amber, fontSize: 18 }} />
            <Typography variant="body2" fontWeight={700} sx={{ color: C.text }}>
              Top 5 clients
            </Typography>
          </Box>
          {topClients.length > 0 ? (
            <Stack spacing={1.5}>
              {topClients.map((tc, i) => (
                <Box key={tc.clientId} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Typography variant="caption" sx={{ color: C.muted, width: 14, textAlign: "right", fontWeight: 700 }}>
                    {i + 1}
                  </Typography>
                  <Avatar sx={{ width: 30, height: 30, bgcolor: PIE_COLORS[i], fontSize: 11, fontWeight: 700 }}>
                    {tc.initiales}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" fontWeight={600} sx={{ color: C.text, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {tc.nom}
                    </Typography>
                    <Typography variant="caption" sx={{ color: C.muted, fontSize: 10 }}>
                      {tc.nb} commande{tc.nb > 1 ? "s" : ""}
                    </Typography>
                  </Box>
                  <Typography variant="caption" fontWeight={700} sx={{ color: C.green, fontSize: 11, whiteSpace: "nowrap" }}>
                    {fmtFcfa(tc.total)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          ) : (
            <EmptyState label="Aucune donnée client" />
          )}
        </Paper>

        {/* Activité récente */}
        <Paper sx={{ bgcolor: C.card, border: `1px solid ${C.border}`, borderRadius: 3, p: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <LocalLaundryService sx={{ color: C.cyan, fontSize: 18 }} />
            <Typography variant="body2" fontWeight={700} sx={{ color: C.text }}>
              Activité récente
            </Typography>
          </Box>
          <Stack spacing={1} sx={{ maxHeight: 240, overflowY: "auto" }}>
            {commandes
              .slice()
              .sort((a, b) => new Date(b.dateDepot) - new Date(a.dateDepot))
              .slice(0, 8)
              .map((cmd) => {
                const statutColor = {
                  DEPOSE: C.cyan, EN_COURS: C.amber, PRET: C.purple,
                  LIVRE: C.green, ANNULE: C.red,
                }[cmd.statut] || C.muted;
                const client = clients.find((c) => c.id === cmd.clientId);
                return (
                  <Box
                    key={cmd.id}
                    sx={{
                      display: "flex", alignItems: "center", gap: 1.5,
                      p: 1, borderRadius: 1.5,
                      bgcolor: C.surface,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: statutColor, flexShrink: 0 }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="caption" fontWeight={600} sx={{ color: C.text, display: "block" }}>
                        #{cmd.id} · {client ? `${client.prenom} ${client.nom}` : `Client #${cmd.clientId}`}
                      </Typography>
                      <Typography variant="caption" sx={{ color: C.muted, fontSize: 10 }}>
                        {cmd.dateDepot ? new Date(cmd.dateDepot).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </Typography>
                    </Box>
                    <Chip
                      label={cmd.statut?.replace("_", " ")}
                      size="small"
                      sx={{ bgcolor: `${statutColor}20`, color: statutColor, fontSize: 9, height: 18, fontFamily: "Outfit" }}
                    />
                  </Box>
                );
              })}
            {commandes.length === 0 && <EmptyState label="Aucune commande" />}
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}

// ─── KpiCard ──────────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, color, trend, trendInverse }) {
  const trendUp = trend === "up";
  const trendColor = trendInverse
    ? trendUp ? C.red : C.green
    : trendUp ? C.green : C.red;

  return (
    <Paper
      sx={{
        bgcolor: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 3, p: 2.5,
        position: "relative", overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute", top: 0, left: 0,
          width: "3px", height: "100%",
          bgcolor: color,
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box
          sx={{
            width: 36, height: 36, borderRadius: 2,
            bgcolor: `${color}18`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: color,
          }}
        >
          {icon}
        </Box>
        {trend && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
            {trendUp
              ? <TrendingUp sx={{ fontSize: 14, color: trendColor }} />
              : <TrendingDown sx={{ fontSize: 14, color: trendColor }} />
            }
          </Box>
        )}
      </Box>
      <Typography variant="h5" fontWeight={800} sx={{ color: C.text, mt: 1.5, mb: 0.3, letterSpacing: "-0.5px" }}>
        {value}
      </Typography>
      <Typography variant="caption" fontWeight={600} sx={{ color: C.text, display: "block" }}>
        {label}
      </Typography>
      <Typography variant="caption" sx={{ color: C.muted, fontSize: 10 }}>
        {sub}
      </Typography>
    </Paper>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
function EmptyState({ label }) {
  return (
    <Box sx={{ textAlign: "center", py: 3 }}>
      <Typography variant="caption" sx={{ color: C.muted }}>{label}</Typography>
    </Box>
  );
}
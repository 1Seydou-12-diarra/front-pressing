import axios from "axios";
import keycloak from "../keycloak";

const API_URL = "http://localhost:8284/api/reports";

const axiosClient = axios.create({ baseURL: API_URL, responseType: "blob" });

axiosClient.interceptors.request.use(
  (config) => {
    if (keycloak?.token) config.headers.Authorization = `Bearer ${keycloak.token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Convertit un blob PDF en URL utilisable ───────────────────────────────
const blobToUrl = (blob) => URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));

// ─── Ouvre le PDF dans un nouvel onglet ────────────────────────────────────
const ouvrirOnglet = (url) => {
  const tab = window.open(url, "_blank");
  if (!tab) alert("Le navigateur a bloqué l'ouverture. Autorise les popups.");
};

// ─── Télécharge le PDF ─────────────────────────────────────────────────────
const telecharger = (url, filename) => {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// ─── Impression via iframe caché ───────────────────────────────────────────
const imprimerIframe = (url) => {
  // Supprime un ancien iframe s'il existe
  const old = document.getElementById("__print_iframe__");
  if (old) document.body.removeChild(old);

  const iframe = document.createElement("iframe");
  iframe.id = "__print_iframe__";
  iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:none;";
  iframe.src = url;
  document.body.appendChild(iframe);

  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }, 300);
  };
};

// ═══════════════════════════════════════════════════════════════════════════
const reportService = {

  // ── Ticket dépôt ──────────────────────────────────────────────────────
  ticketDepot: {
    fetch: (id) =>
      axiosClient.get(`/commandes/${id}/ticket`).then((r) => blobToUrl(r.data)),

    ouvrir: async (id) => {
      const url = await reportService.ticketDepot.fetch(id);
      ouvrirOnglet(url);
    },
    telecharger: async (id) => {
      const url = await reportService.ticketDepot.fetch(id);
      telecharger(url, `ticket_depot_${id}.pdf`);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    },
    imprimer: async (id) => {
      const url = await reportService.ticketDepot.fetch(id);
      imprimerIframe(url);
    },
  },

  // ── Facture client ────────────────────────────────────────────────────
  factureClient: {
    fetch: (id) =>
      axiosClient.get(`/commandes/${id}/facture`).then((r) => blobToUrl(r.data)),

    ouvrir: async (id) => {
      const url = await reportService.factureClient.fetch(id);
      ouvrirOnglet(url);
    },
    telecharger: async (id) => {
      const url = await reportService.factureClient.fetch(id);
      telecharger(url, `facture_client_${id}.pdf`);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    },
    imprimer: async (id) => {
      const url = await reportService.factureClient.fetch(id);
      imprimerIframe(url);
    },
  },

  // ── CA Journalier ─────────────────────────────────────────────────────
  caJournalier: {
    fetch: (date) =>
      axiosClient.get(`/ca-journalier`, { params: { date } }).then((r) => blobToUrl(r.data)),

    ouvrir: async (date) => {
      const url = await reportService.caJournalier.fetch(date);
      ouvrirOnglet(url);
    },
    telecharger: async (date) => {
      const url = await reportService.caJournalier.fetch(date);
      telecharger(url, `ca_journalier_${date}.pdf`);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    },
    imprimer: async (date) => {
      const url = await reportService.caJournalier.fetch(date);
      imprimerIframe(url);
    },
  },
};

export default reportService;
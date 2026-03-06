import axios from "axios";
import keycloak from "../keycloak"; // keycloak.js est dans src/

const API_URL = "http://localhost:8284/api/clients";

// ─── Instance Axios dédiée ────────────────────────────────────────────────────
const axiosClient = axios.create({
  baseURL: API_URL,
});

// ─── Intercepteur request : injecte le token Keycloak ────────────────────────
axiosClient.interceptors.request.use(
  (config) => {
    if (keycloak?.token) {
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Intercepteur response : gestion des erreurs globales ────────────────────
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré → relance l'authentification Keycloak
      keycloak.login();
    }
    return Promise.reject(error);
  }
);

// ─── Service client ───────────────────────────────────────────────────────────
const clientService = {
  // Créer un client
  creer: (data) =>
    axiosClient.post("", data).then((r) => r.data),

  // Trouver par ID
  trouverParId: (id) =>
    axiosClient.get(`/${id}`).then((r) => r.data),

  // Rechercher (liste paginable)
  rechercher: (nom = "", telephone = "") =>
    axiosClient
      .get("", {
        params: { nom: nom || undefined, telephone: telephone || undefined },
      })
      .then((r) => r.data),

  // Désactiver
  desactiver: (id) =>
    axiosClient.delete(`/${id}`).then((r) => r.data),

  // Créditer points fidélité
  crediterPoints: (id, montant) =>
    axiosClient
      .post(`/${id}/fidelite/credit`, null, { params: { montant } })
      .then((r) => r.data),

  // Utiliser points fidélité
  utiliserPoints: (id, points) =>
    axiosClient
      .post(`/${id}/fidelite/utiliser`, null, { params: { points } })
      .then((r) => r.data),

  // Solde fidélité
  soldeFidelite: (id) =>
    axiosClient.get(`/${id}/fidelite`).then((r) => r.data),
};

export default clientService;
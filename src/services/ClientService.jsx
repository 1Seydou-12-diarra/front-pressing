import axios from "axios";
import keycloak from "../keycloak";

const API_URL = "http://localhost:8284/api/clients";

const axiosClient = axios.create({
  baseURL: API_URL,
});

// ─── Intercepteur request : rafraîchit et injecte le token ──────────────────
axiosClient.interceptors.request.use(
  async (config) => {
    try {
      // ⬅️ Rafraîchit le token s'il expire dans moins de 30 secondes
      await keycloak.updateToken(30);
    } catch (e) {
      keycloak.login(); // token non renouvelable → reconnexion
      return Promise.reject(e);
    }

    if (keycloak?.token) {
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Intercepteur response ───────────────────────────────────────────────────
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      keycloak.login();
    }
    return Promise.reject(error);
  }
);

// ─── Service client ──────────────────────────────────────────────────────────
const clientService = {
  creer: (data) =>
    axiosClient.post("", data).then((r) => r.data),

  trouverParId: (id) =>
    axiosClient.get(`/${id}`).then((r) => r.data),

  rechercher: (nom = "", telephone = "") =>
    axiosClient
      .get("", {
        params: { nom: nom || undefined, telephone: telephone || undefined },
      })
      .then((r) => r.data),

  desactiver: (id) =>
    axiosClient.delete(`/${id}`).then((r) => r.data),

  crediterPoints: (id, montant) =>
    axiosClient
      .post(`/${id}/fidelite/credit`, null, { params: { montant } })
      .then((r) => r.data),

  utiliserPoints: (id, points) =>
    axiosClient
      .post(`/${id}/fidelite/utiliser`, null, { params: { points } })
      .then((r) => r.data),

  soldeFidelite: (id) =>
    axiosClient.get(`/${id}/fidelite`).then((r) => r.data),
};

export default clientService;
import axios from "axios";
import keycloak from "../keycloak";

const API_URL = "http://localhost:8284/api/commandes";

const axiosClient = axios.create({ baseURL: API_URL });

// ─── Intercepteur request : rafraîchit le token avant chaque appel ──────────
axiosClient.interceptors.request.use(
  async (config) => {
    try {
      await keycloak.updateToken(30); // ⬅️ rafraîchit si expire dans < 30s
    } catch (e) {
      keycloak.login();
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
    if (error.response?.status === 401) keycloak.login();
    return Promise.reject(error);
  }
);

const commandeService = {
  creerDepot: (data) => {
    console.log(">>> creerDepot payload:", JSON.stringify(data, null, 2));
    return axiosClient.post("", data)
      .then((r) => r.data)
      .catch((err) => {
        console.error(">>> creerDepot erreur:", err.response?.data);
        throw err;
      });
  },

  listerCommandes: () =>
    axiosClient.get("").then((r) => r.data),

  getCommande: (id) =>
    axiosClient.get(`/${id}`).then((r) => r.data),

  changerStatut: (id, statut) =>
    axiosClient.patch(`/${id}/statut`, null, { params: { statut } })
      .then((r) => r.data)
      .catch((err) => {
        console.error("changerStatut erreur:", JSON.stringify(err.response?.data, null, 2));
        throw err;
      }),
};

export default commandeService;
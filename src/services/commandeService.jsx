import axios from "axios";
import keycloak from "../keycloak";

const API_URL = "http://localhost:8284/api/commandes";

const axiosClient = axios.create({ baseURL: API_URL });

axiosClient.interceptors.request.use(
  (config) => {
    if (keycloak?.token) config.headers.Authorization = `Bearer ${keycloak.token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) keycloak.login();
    return Promise.reject(error);
  }
);

const commandeService = {
  // Créer un dépôt
  creerDepot: (data) => {
    console.log(">>> creerDepot payload:", JSON.stringify(data, null, 2));
    return axiosClient.post("", data)
      .then((r) => r.data)
      .catch((err) => {
        console.error(">>> creerDepot erreur:", err.response?.data);
        throw err;
      });
  },

  // Lister toutes les commandes
  listerCommandes: () =>
    axiosClient.get("").then((r) => r.data),

  // Récupérer une commande par ID
  getCommande: (id) =>
    axiosClient.get(`/${id}`).then((r) => r.data),

  // Changer le statut
  changerStatut: (id, statut) =>
    axiosClient.patch(`/${id}/statut`, null, { params: { statut } })
      .then((r) => r.data)
      .catch((err) => {
        console.error("changerStatut erreur complet:", JSON.stringify(err.response?.data, null, 2));
        throw err;
      }),
};

export default commandeService;
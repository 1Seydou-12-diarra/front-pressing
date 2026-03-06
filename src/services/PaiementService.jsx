import axios from "axios";
import keycloak from "../keycloak";

const API_URL = "http://localhost:8284/api/paiements";

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
    console.error("paiementService erreur:", error.response?.data);
    return Promise.reject(error);
  }
);

const paiementService = {
  // Enregistrer un paiement
  payer: (data) =>
    axiosClient.post("", data).then((r) => r.data),

  // Remboursement partiel
  rembourser: (commandeId, montant) =>
    axiosClient
      .post(`/remboursement/${commandeId}`, null, { params: { montant } })
      .then((r) => r.data),

  // Total payé d'une commande
  totalPaye: (commandeId) =>
    axiosClient.get(`/total/${commandeId}`).then((r) => r.data),
};

export default paiementService;
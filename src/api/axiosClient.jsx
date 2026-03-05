import keycloak from '../keycloak'; // ✅ import default
import axios from "axios";
const axiosClient = axios.create({
  baseURL: "http://localhost:8284/api/clients",
});

// Intercepteur pour ajouter le token
axiosClient.interceptors.request.use((config) => {
  if (keycloak?.token) {
    config.headers.Authorization = `Bearer ${keycloak.token}`;
  }
  return config;
});
  (error) => Promise.reject(error)


export const ClientApi = {
  creer: (clientDto) => axiosClient.post("", clientDto),
  trouver: (id) => axiosClient.get(`/${id}`),
  rechercher: (params) => axiosClient.get("", { params }),
  desactiver: (id) => axiosClient.delete(`/${id}`),
  crediter: (id, montant) =>
    axiosClient.post(`/${id}/fidelite/credit`, null, { params: { montant } }),
  utiliser: (id, points) =>
    axiosClient.post(`/${id}/fidelite/utiliser`, null, { params: { points } }),
  solde: (id) => axiosClient.get(`/${id}/fidelite`),
};

export default axiosClient;
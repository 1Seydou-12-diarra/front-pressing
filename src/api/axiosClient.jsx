// src/api/axiosClient.js
import axios from 'axios';
import keycloak from '../keycloak';

// On crée une instance Axios avec la base URL vers ton backend Spring Boot
const axiosClient = axios.create({
  baseURL: 'http://localhost:8284/api/clients', // endpoint de ton ClientController
});

// Intercepteur pour ajouter automatiquement le token Keycloak
axiosClient.interceptors.request.use((config) => {
  const token = keycloak.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fonctions pour utiliser les endpoints du ClientController

export const ClientApi = {
  creer: (clientDto) => axiosClient.post('', clientDto), // POST /api/clients
  trouver: (id) => axiosClient.get(`/${id}`), // GET /api/clients/{id}
  rechercher: (params) => axiosClient.get('', { params }), // GET /api/clients?nom=...&telephone=...
  desactiver: (id) => axiosClient.delete(`/${id}`), // DELETE /api/clients/{id}
  crediter: (id, montant) => axiosClient.post(`/${id}/fidelite/credit`, null, { params: { montant } }), // POST /{id}/fidelite/credit
  utiliser: (id, points) => axiosClient.post(`/${id}/fidelite/utiliser`, null, { params: { points } }), // POST /{id}/fidelite/utiliser
  solde: (id) => axiosClient.get(`/${id}/fidelite`), // GET /{id}/fidelite
};

export default axiosClient;
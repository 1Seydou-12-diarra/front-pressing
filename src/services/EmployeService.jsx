import { createAuthClient } from "./axiosBase";

const axiosClient = createAuthClient("http://localhost:8284/api/employes");

const employeService = {
  creer: (data) =>
    axiosClient.post("", data).then((r) => r.data),

  lister: () =>
    axiosClient.get("").then((r) => r.data),

  modifier: (id, data) =>
    axiosClient.put(`/${id}`, data).then((r) => r.data),

  supprimer: (id) =>
    axiosClient.delete(`/${id}`).then((r) => r.data),

  findByKeycloak: (keycloakId) =>
    axiosClient.get(`/keycloak/${keycloakId}`).then((r) => r.data),

  findByAgence: (agenceId) =>
    axiosClient.get(`/agence/${agenceId}`).then((r) => r.data),
};

export default employeService;
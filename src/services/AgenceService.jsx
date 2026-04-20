import { createAuthClient } from "./axiosBase";

const axiosClient = createAuthClient("http://localhost:8284/api/agences");

const agenceService = {
  lister: () => axiosClient.get("").then((r) => r.data),

  trouverParId: (id) => axiosClient.get(`/${id}`).then((r) => r.data),

  creer: (data) => axiosClient.post("", data).then((r) => r.data),

  modifier: (id, data) => axiosClient.put(`/${id}`, data).then((r) => r.data),

  supprimer: (id) => axiosClient.delete(`/${id}`).then((r) => r.data),

  transfererCommande: (commandeId, agenceId) =>
    axiosClient.put(`/transferer-commande/${commandeId}/vers/${agenceId}`).then((r) => r.data),
};

export default agenceService;
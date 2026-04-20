// src/services/PaiementService.jsx
import { createAuthClient } from "./axiosBase";

const axiosClient = createAuthClient("http://localhost:8284/api/paiements");

const paiementService = {
  payer: (data) =>
    axiosClient.post("", data).then((r) => r.data),

  rembourser: (commandeId, montant) =>
    axiosClient
      .post(`/remboursement/${commandeId}`, null, { params: { montant } })
      .then((r) => r.data),

  totalPaye: (commandeId) =>
    axiosClient.get(`/total/${commandeId}`).then((r) => r.data),
};

export default paiementService;
// src/pages/ClientDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, Tab, Box, Typography } from '@mui/material';
import { ClientApi } from '../api/axiosClient';

export default function ClientDetail() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await ClientApi.trouver(id);
        setClient(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchClient();
  }, [id]);

  if (!client) return <Typography>Chargement...</Typography>;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {client.nom} {client.prenom}
      </Typography>
      <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
        <Tab label="Infos" />
        <Tab label="Historique" />
        <Tab label="Fidélité" />
      </Tabs>
      <Box mt={2}>
        {tab === 0 && (
          <Box>
            <Typography>Email: {client.email}</Typography>
            <Typography>Téléphone: {client.telephone}</Typography>
            <Typography>Adresse: {client.adresse}</Typography>
          </Box>
        )}
        {tab === 1 && (
          <Box>
            <Typography>Historique des commandes (à implémenter)</Typography>
          </Box>
        )}
        {tab === 2 && (
          <Box>
            <Typography>Points fidélité: {client.pointsFidelite}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
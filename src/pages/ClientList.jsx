// src/pages/ClientList.jsx
import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import axios from 'axios';

export default function ClientList() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { keycloak, initialized } = useKeycloak();

  const fetchClients = async () => {
    if (!initialized || !keycloak.authenticated) return; // ⚠️ sécurité

    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8284/api/clients', {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      });
      setClients(response.data);
    } catch (error) {
      console.error('Erreur API:', error.response || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [initialized, keycloak]); // ⚡ relance si keycloak s'initialise

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'nom', headerName: 'Nom', width: 150 },
    { field: 'prenom', headerName: 'Prénom', width: 150 },
    { field: 'telephone', headerName: 'Téléphone', width: 130 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'adresse', headerName: 'Adresse', width: 200 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate(`/clients/${params.row.id}`)}
          >
            Voir
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={async () => {
              try {
                await axios.delete(
                  `http://localhost:8284/api/clients/${params.row.id}`,
                  { headers: { Authorization: `Bearer ${keycloak.token}` } }
                );
                fetchClients();
              } catch (err) {
                console.error('Erreur désactivation:', err.response || err.message);
              }
            }}
          >
            Désactiver
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <div style={{ height: 500, width: '100%' }}>
      <DataGrid
        rows={clients}
        columns={columns}
        loading={loading}
        pageSizeOptions={[5, 10, 20]}
        initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
      />
    </div>
  );
}
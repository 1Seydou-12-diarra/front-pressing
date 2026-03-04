// src/pages/ClientList.jsx
import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Stack } from '@mui/material';
import { ClientApi } from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';

export default function ClientList() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await ClientApi.rechercher({});
      setClients(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

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
              await ClientApi.desactiver(params.row.id);
              fetchClients();
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
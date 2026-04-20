import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import CommandesPage from './pages/CommandesPage';
import PrivateRoute from './components/PrivateRoute';
import CaissePage from './pages/CaissePage';
import EmployesPage from './pages/EmployesPage';
import AgencesPage from './pages/AgencesPage';   // ✅ import ajouté

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route element={<MainLayout />}>

          <Route path="dashboard"
            element={
              <PrivateRoute roles={['ROLE_ADMIN', 'ROLE_MANAGER']}>
                <DashboardPage />
              </PrivateRoute>
            }
          />

          <Route path="clients"
            element={
              <PrivateRoute roles={['ROLE_ADMIN', 'ROLE_EMPLOYE', 'ROLE_CAISSIER']}>
                <ClientsPage />
              </PrivateRoute>
            }
          />

          <Route path="commandes"
            element={
              <PrivateRoute roles={['ROLE_ADMIN', 'ROLE_EMPLOYE', 'ROLE_CAISSIER']}>
                <CommandesPage />
              </PrivateRoute>
            }
          />

          <Route path="employes"
            element={
              <PrivateRoute roles={['ROLE_ADMIN', 'ROLE_MANAGER']}>
                <EmployesPage />
              </PrivateRoute>
            }
          />

          <Route path="caisse"
            element={
              <PrivateRoute roles={['ROLE_ADMIN', 'ROLE_CAISSIER']}>
                <CaissePage />
              </PrivateRoute>
            }
          />

          <Route path="agences"                          // ✅ "agences" avec s
            element={
              <PrivateRoute roles={['ROLE_ADMIN', 'ROLE_MANAGER']}>
                <AgencesPage />                          // ✅ AgencesPage avec s
              </PrivateRoute>
            }
          />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}
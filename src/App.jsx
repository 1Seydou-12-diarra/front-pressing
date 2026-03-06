import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import ClientsPage from './pages/ClientsPage';
import CommandesPage from './pages/CommandesPage';
import PrivateRoute from './components/PrivateRoute';
import CaissePage from './pages/CaissePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route element={<MainLayout />}>

          {/* Dashboard */}
          <Route
            path="dashboard"
            element={
              <PrivateRoute roles={['ROLE_ADMIN', 'ROLE_MANAGER']}>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          {/* Clients */}
          <Route
            path="clients"
            element={
              <PrivateRoute roles={['ROLE_ADMIN', 'ROLE_EMPLOYE', 'ROLE_CAISSIER']}>
                <ClientsPage />
              </PrivateRoute>
            }
          />

          {/* Commandes */}
          <Route
            path="commandes"
            element={
              <PrivateRoute roles={['ROLE_ADMIN', 'ROLE_EMPLOYE', 'ROLE_CAISSIER']}>
                <CommandesPage />
              </PrivateRoute>
            }
          />

          {/* Caisse */}
          <Route
            path="caisse"
            element={
              <PrivateRoute roles={['ROLE_ADMIN', 'ROLE_CAISSIER']}>
                <CaissePage />
              </PrivateRoute>
            }
          />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}
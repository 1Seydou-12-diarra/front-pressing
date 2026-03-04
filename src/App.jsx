import React from 'react';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import ClientList from './pages/ClientList';
import ClientDetail from './pages/ClientDetail';
import ClientForm from './pages/ClientForm';
import PrivateRoute from './components/PrivateRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Navigate to="/dashboard" />} /> {/* redirige "/" vers "/dashboard" */}
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

          {/* Users */}
          <Route
            path="users"
            element={
              <PrivateRoute roles={['ROLE_ADMIN']}>
                <UsersPage />
              </PrivateRoute>
            }
          />

          {/* Clients */}
          <Route
            path="clients"
            element={
              <PrivateRoute roles={['ROLE_ADMIN', 'ROLE_EMPLOYE', 'ROLE_CAISSIER']}>
                <ClientList />
              </PrivateRoute>
            }
          />
          <Route
            path="clients/new"
            element={
              <PrivateRoute roles={['ROLE_ADMIN', 'ROLE_EMPLOYE']}>
                <ClientForm />
              </PrivateRoute>
            }
          />
          <Route
            path="clients/:id"
            element={
              <PrivateRoute roles={['ROLE_ADMIN', 'ROLE_EMPLOYE', 'ROLE_CAISSIER']}>
                <ClientDetail />
              </PrivateRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
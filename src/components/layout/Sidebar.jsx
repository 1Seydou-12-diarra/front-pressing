// src/components/layout/Sidebar.jsx
import React from 'react';
import { List, ListItemButton, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';

export default function Sidebar() {
  const navigate = useNavigate();
  const { keycloak, initialized } = useKeycloak();

  // 🔥 Récupération correcte des rôles
  const userRoles = keycloak?.tokenParsed?.realm_access?.roles || [];

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', roles: ['ROLE_ADMIN', 'ROLE_MANAGER'] },
    { label: 'Clients', path: '/clients', roles: ['ROLE_ADMIN', 'ROLE_EMPLOYE', 'ROLE_CAISSIER'] },
    { label: 'Users', path: '/users', roles: ['ROLE_ADMIN'] },
  ];

  // 🔥 Attendre que Keycloak soit initialisé
  if (!initialized) {
    return null; // ou loader
  }

  return (
    <List>
      {menuItems
        .filter((item) =>
          item.roles.some((role) => userRoles.includes(role))
        )
        .map((item) => (
          <ListItemButton
            key={item.path}
            onClick={() => navigate(item.path)}
          >
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
    </List>
  );
}// src/components/layout/Sidebar.jsx
import React from 'react';
import { List, ListItemButton, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';

export default function Sidebar() {
  const navigate = useNavigate();
  const { keycloak, initialized } = useKeycloak();

  // 🔥 Récupération correcte des rôles
  const userRoles = keycloak?.tokenParsed?.realm_access?.roles || [];

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', roles: ['ROLE_ADMIN', 'ROLE_MANAGER'] },
    { label: 'Clients', path: '/clients', roles: ['ROLE_ADMIN', 'ROLE_EMPLOYE', 'ROLE_CAISSIER'] },
    { label: 'Users', path: '/users', roles: ['ROLE_ADMIN'] },
  ];

  // 🔥 Attendre que Keycloak soit initialisé
  if (!initialized) {
    return null; // ou loader
  }

  return (
    <List>
      {menuItems
        .filter((item) =>
          item.roles.some((role) => userRoles.includes(role))
        )
        .map((item) => (
          <ListItemButton
            key={item.path}
            onClick={() => navigate(item.path)}
          >
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
    </List>
  );
}
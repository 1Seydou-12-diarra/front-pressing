// src/services/axiosBase.js
import axios from "axios";
import keycloak from "../keycloak";

export const createAuthClient = (baseURL) => {
  const client = axios.create({ baseURL });

  client.interceptors.request.use(
    async (config) => {
      try {
        await keycloak.updateToken(30);
      } catch (e) {
        keycloak.login();
        return Promise.reject(e);
      }
      if (keycloak?.token) {
        config.headers.Authorization = `Bearer ${keycloak.token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) keycloak.login();
      return Promise.reject(error);
    }
  );

  return client;
};
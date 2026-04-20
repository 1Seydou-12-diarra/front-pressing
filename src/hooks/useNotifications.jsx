// src/hooks/useNotifications.js
import { useEffect, useState, useCallback } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const WS_URL = "http://localhost:8284/ws";
const TOPIC  = "/topic/notifications";

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected]         = useState(false);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        client.subscribe(TOPIC, (message) => {
          try {
            const notif = JSON.parse(message.body);
            setNotifications((prev) => [
              { ...notif, id: Date.now(), lu: false },
              ...prev,
            ]);
          } catch (e) {
            console.error("Erreur parsing notification", e);
          }
        });
      },
      onDisconnect: () => setConnected(false),
      onStompError: (frame) => console.error("STOMP error", frame),
    });

    client.activate();
    return () => client.deactivate();
  }, []);

  const marquerCommeLu = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lu: true } : n))
    );
  }, []);

  const toutMarquerCommeLu = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
  }, []);

  const supprimerNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const nonLues = notifications.filter((n) => !n.lu).length;

  return {
    notifications,
    nonLues,
    connected,
    marquerCommeLu,
    toutMarquerCommeLu,
    supprimerNotification,
  };
}
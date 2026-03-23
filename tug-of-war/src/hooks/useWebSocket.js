import { useRef, useEffect, useState, useCallback } from "react";

export function getServerIP() {
  if (typeof window !== "undefined" && window.__SERVER_IP__) return window.__SERVER_IP__;
  return window.location.hostname || "localhost";
}
export function getWsPort() {
  if (typeof window !== "undefined" && window.__WS_PORT__) return window.__WS_PORT__;
  return 4000;
}

export function useWebSocket({ onMessage, onOpen } = {}) {
  const ws       = useRef(null);
  const [connected, setConnected] = useState(false);
  const onMsgRef = useRef(onMessage);
  const onOpenRef = useRef(onOpen);
  onMsgRef.current  = onMessage;
  onOpenRef.current = onOpen;

  useEffect(() => {
    const ip   = getServerIP();
    const port = getWsPort();
    const url  = `ws://${ip}:${port}`;
    let socket, reconnectTimer;

    function connect() {
      socket = new WebSocket(url);
      ws.current = socket;
      socket.onopen = () => {
        setConnected(true);
        if (onOpenRef.current) onOpenRef.current();
      };
      socket.onmessage = (e) => {
        try { const msg = JSON.parse(e.data); if (onMsgRef.current) onMsgRef.current(msg); } catch {}
      };
      socket.onclose = () => {
        setConnected(false);
        ws.current = null;
        reconnectTimer = setTimeout(connect, 2000);
      };
      socket.onerror = () => socket.close();
    }
    connect();
    return () => { clearTimeout(reconnectTimer); if (socket) { socket.onclose=null; socket.close(); } };
  }, []);

  const send = useCallback((msg) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) ws.current.send(JSON.stringify(msg));
  }, []);

  return { send, connected };
}

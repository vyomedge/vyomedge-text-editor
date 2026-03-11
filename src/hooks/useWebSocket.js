"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const RECONNECT_DELAY = 3000;
const PING_INTERVAL = 25000;

function resolveWebSocketUrl(apiBaseUrl = "") {
  if (typeof window === "undefined") return null;

  if (!apiBaseUrl) {
    return `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/ws`;
  }

  const url = new URL(apiBaseUrl, window.location.origin);
  return `${url.protocol === "https:" ? "wss" : "ws"}://${url.host}/ws`;
}

export function useWebSocket(docId, apiBaseUrl = "") {
  const [wsStatus, setWsStatus] = useState("disconnected");
  const [saveStatus, setSaveStatus] = useState("");
  const wsRef = useRef(null);
  const pingRef = useRef(null);
  const retriesRef = useRef(0);
  const reconnectRef = useRef(null);
  const docIdRef = useRef(docId);

  docIdRef.current = docId;

  const cleanup = useCallback(() => {
    clearInterval(pingRef.current);
    clearTimeout(reconnectRef.current);
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    const wsUrl = resolveWebSocketUrl(apiBaseUrl);
    if (!wsUrl || !docIdRef.current) return;
    cleanup();
    setWsStatus("connecting");

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      retriesRef.current = 0;
      setWsStatus("connected");
      ws.send(JSON.stringify({ type: "join", docId: docIdRef.current }));
      pingRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, PING_INTERVAL);
    };

    ws.onmessage = (e) => {
      let msg;
      try {
        msg = JSON.parse(e.data);
      } catch {
        return;
      }
      if (msg.type === "saved") {
        setSaveStatus(`Auto-saved · ${msg.wordCount || ""} words`);
        setTimeout(() => setSaveStatus(""), 3000);
      }
      if (msg.type === "queued") {
        setSaveStatus("Saving...");
      }
      if (msg.type === "error") {
        setSaveStatus("Save error");
        setTimeout(() => setSaveStatus(""), 3000);
      }
    };

    ws.onclose = () => {
      setWsStatus("disconnected");
      clearInterval(pingRef.current);
      const delay = Math.min(
        RECONNECT_DELAY * (retriesRef.current + 1),
        30000,
      );
      retriesRef.current++;
      reconnectRef.current = setTimeout(() => {
        if (docIdRef.current) connect();
      }, delay);
    };

    ws.onerror = () => {
      setWsStatus("error");
    };
  }, [apiBaseUrl, cleanup]);

  useEffect(() => {
    if (docId) {
      connect();
    } else {
      cleanup();
      setWsStatus("disconnected");
    }
    return cleanup;
  }, [docId, connect, cleanup]);

  const sendAutoSave = useCallback((html, title) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN && docIdRef.current) {
      ws.send(
        JSON.stringify({
          type: "autosave",
          docId: docIdRef.current,
          html,
          title,
        }),
      );
    }
  }, []);

  return { wsStatus, saveStatus, sendAutoSave };
}

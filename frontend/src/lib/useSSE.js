"use client";
import { getApiUrl } from "@/lib/api-url";
import { useState, useEffect, useRef, useCallback } from "react";

const API = () => getApiUrl();

export function useSSE(paperId) {
  const [steps, setSteps] = useState([]);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    if (!paperId) return;

    const es = new EventSource(`${API()}/api/pipeline/${paperId}/status`);
    eventSourceRef.current = es;

    es.onopen = () => setConnected(true);

    es.addEventListener("step", (e) => {
      try {
        const data = JSON.parse(e.data);
        setSteps(prev => {
          const exists = prev.find(s => s.step === data.step);
          if (exists) return prev.map(s => s.step === data.step ? data : s);
          return [...prev, data];
        });
      } catch(err) {}
    });

    es.onerror = () => {
      setConnected(false);
      es.close();
    };

    return () => {
      es.close();
      setConnected(false);
    };
  }, [paperId]);

  return { steps, connected };
}

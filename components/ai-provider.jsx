"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { AIAssistant } from "./ai-assistant";

const AIContext = createContext({
  sendContext: (ctx) => {},
  registerLocationHandler: (h) => {},
});

export function AIAssistantProvider({ children }) {
  const [externalContext, setExternalContext] = useState(null);

  // keep handler in a ref so registering/unregistering doesn't recreate functions
  const locationHandlerRef = useRef(null);

  // Keep a ref of last sent context to avoid re-sending identical payloads
  const lastContextRef = useRef(null);

  const sendContext = useCallback((context, options = { force: false }) => {
    try {
      const ctxString =
        typeof context === "string" ? context : JSON.stringify(context);

      if (!options.force && lastContextRef.current === ctxString) {
        // skip duplicate
        return;
      }

      lastContextRef.current = ctxString;
      setExternalContext(context);
    } catch (err) {
      console.error("sendContext error:", err);
    }
  }, []);

  const registerLocationHandler = useCallback((handler) => {
    // store the handler function (or null) in a ref to avoid re-rendering the assistant
    locationHandlerRef.current = handler;
  }, []);

  // stable proxy passed to the assistant so its prop identity doesn't change
  const handleLocationSelectProxy = useCallback((location, ...args) => {
    const fn = locationHandlerRef.current;
    if (typeof fn === "function") {
      try {
        return fn(location, ...args);
      } catch (err) {
        console.error("Error in registered location handler:", err);
      }
    } else {
      console.warn("No location handler registered to provider");
    }
  }, []);

  const value = useMemo(
    () => ({ sendContext, registerLocationHandler }),
    [sendContext, registerLocationHandler]
  );

  return (
    <AIContext.Provider value={value}>
      {children}
      <AIAssistant
        externalContext={externalContext}
        handleLocationSelect={handleLocationSelectProxy}
      />
    </AIContext.Provider>
  );
}

export function useAI() {
  return useContext(AIContext);
}

export default AIAssistantProvider;

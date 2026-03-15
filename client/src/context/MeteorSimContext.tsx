"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface MeteorSimState {
  timeScale: number; // 0.1 – 5.0
  sizeScale: number; // 0.1 – 3.0
  setTimeScale: (v: number) => void;
  setSizeScale: (v: number) => void;
}

const MeteorSimContext = createContext<MeteorSimState>({
  timeScale: 1,
  sizeScale: 1,
  setTimeScale: () => {},
  setSizeScale: () => {},
});

export function MeteorSimProvider({ children }: { children: ReactNode }) {
  const [timeScale, setTimeScale] = useState(1);
  const [sizeScale, setSizeScale] = useState(1);

  return (
    <MeteorSimContext.Provider
      value={{ timeScale, sizeScale, setTimeScale, setSizeScale }}
    >
      {children}
    </MeteorSimContext.Provider>
  );
}

export function useMeteorSim() {
  return useContext(MeteorSimContext);
}

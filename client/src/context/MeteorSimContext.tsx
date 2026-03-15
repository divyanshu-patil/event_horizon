"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface MeteorSimState {
  timeScale: number;
  sizeScale: number;
  paused: boolean;
  setTimeScale: (v: number) => void;
  setSizeScale: (v: number) => void;
  togglePause: () => void;
}

const MeteorSimContext = createContext<MeteorSimState>({
  timeScale: 1,
  sizeScale: 1,
  paused: false,
  setTimeScale: () => {},
  setSizeScale: () => {},
  togglePause: () => {},
});

export function MeteorSimProvider({ children }: { children: ReactNode }) {
  const [timeScale, setTimeScale] = useState(1);
  const [sizeScale, setSizeScale] = useState(1);
  const [paused, setPaused] = useState(false);

  const togglePause = () => setPaused((p) => !p);

  return (
    <MeteorSimContext.Provider
      value={{
        timeScale,
        sizeScale,
        paused,
        setTimeScale,
        setSizeScale,
        togglePause,
      }}
    >
      {children}
    </MeteorSimContext.Provider>
  );
}

export function useMeteorSim() {
  return useContext(MeteorSimContext);
}

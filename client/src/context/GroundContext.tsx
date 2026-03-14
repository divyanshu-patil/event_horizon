import React, { createContext, useContext, useRef, RefObject } from "react";
import * as THREE from "three";

export const GroundContext = createContext<RefObject<THREE.Mesh | null> | null>(
  null
);

export function useGroundRef() {
  const ref = useContext(GroundContext);
  if (!ref) {
    throw new Error("useGroundRef must be used inside GroundProvider");
  }
  return ref;
}

export function GroundProvider({ children }: { children: React.ReactNode }) {
  const groundRef = useRef<THREE.Mesh>(null);

  return (
    <GroundContext.Provider value={groundRef}>
      {children}
    </GroundContext.Provider>
  );
}

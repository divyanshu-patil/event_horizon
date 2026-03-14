"use client";
import { Leva } from "leva";

export default function PerfMonitor({ hidden = false }: { hidden?: boolean }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        zIndex: 1000,
        width: 70,
        height: 50,
      }}
    >
      <Leva hidden={hidden} />
    </div>
  );
}

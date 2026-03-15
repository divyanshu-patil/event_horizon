"use client";

import {
  MeteorData,
  velToward,
} from "@/components/playground/meteor/meteorData";
import { Canvas } from "@react-three/fiber";
import { Stats, OrbitControls, Loader } from "@react-three/drei";
import { GroundProvider } from "@/context/GroundContext";
import Earth from "@/components/playground/earth";
import { Meteor } from "@/components/playground/meteor";
import { massToColor } from "@/components/playground/meteor/meteorData";
import { Leva, useControls } from "leva";
import { Suspense, useEffect, useState, useCallback } from "react";
import {
  getMeteorTrajectory,
  getRandomMeteorTrajectory,
} from "@/lib/api/meteor";
import { IMeteorTrajectory } from "@/types/api/meteor";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import { MeteorSimProvider, useMeteorSim } from "@/context/MeteorSimContext";

const ALT_SCALE = 50;

interface TrackedMeteor {
  uid: string;
  eventId: string;
  data: IMeteorTrajectory;
}

export function trajectoryToMeteorData(t: IMeteorTrajectory): MeteorData {
  return {
    id: t._id,
    startLat: t.startLat,
    startLng: t.startLng,
    startAltKm: t.startAltKm * ALT_SCALE,
    endLat: t.endLat,
    endLng: t.endLng,
    endAltKm: t.endAltKm * ALT_SCALE,
    ...velToward(
      t.startLat,
      t.startLng,
      t.startAltKm * ALT_SCALE,
      t.endLat,
      t.endLng,
      t.endAltKm * ALT_SCALE,
      t.initial_velocity,
    ),
    m0: t.mass,
  };
}

// ─── Slider ──────────────────────────────────────────────────────────────────

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
  onReset: () => void;
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
  onReset: () => void;
  /** Optional element rendered to the right of the value (e.g. a quick-action button) */
  action?: React.ReactNode;
}

function SimSlider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
  onReset,
  action,
}: SliderProps) {
  const display = format ? format(value) : value.toFixed(2);
  // Clamp pct to [0,100] — value can exceed max via the +10 button
  const pct = Math.min(((value - min) / (max - min)) * 100, 100);
  const isDefault = value === 1;

  return (
    <div className="flex flex-col gap-1.5 px-3 py-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/60 font-mono">{label}</span>
        <div className="flex items-center gap-2">
          {!isDefault && (
            <button
              onClick={onReset}
              className="text-[10px] text-blue-400/70 hover:text-blue-400 font-mono transition"
            >
              reset
            </button>
          )}
          {action}
          <span className="text-xs text-white font-mono tabular-nums w-10 text-right">
            {display}
          </span>
        </div>
      </div>

      <div className="relative h-1.5 w-full rounded-full bg-white/10">
        <div
          className="absolute h-full rounded-full bg-blue-400/80 transition-[width]"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={Math.min(value, max)} // native range can't exceed max
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      <div className="flex justify-between text-[10px] text-white/20 font-mono">
        <span>{min}×</span>
        <span>{value > max ? `${value.toFixed(1)}×` : `${max}×`}</span>
      </div>
    </div>
  );
}
// ─── Inner component ──────────────────────────────────────────────────────────

function PlayGroundInner() {
  const { useMockData } = useControls({ useMockData: true });
  const { timeScale, sizeScale, setTimeScale, setSizeScale } = useMeteorSim();

  const [meteorData, setMeteorData] = useState<MeteorData[]>([]);
  const [trackedMeteors, setTrackedMeteors] = useState<TrackedMeteor[]>([]);
  const [loadingCount, setLoadingCount] = useState(0);
  const [isListOpen, setIsListOpen] = useState(true);
  const [isSimOpen, setIsSimOpen] = useState(true);

  const searchParams = useSearchParams();
  const eventId = searchParams.get("event") ?? undefined;
  const hasEventId = !!eventId;

  useEffect(() => {
    const load = async () => {
      if (hasEventId) {
        const data = await getMeteorTrajectory(eventId);
        if (data)
          setMeteorData((prev) => [...prev, trajectoryToMeteorData(data)]);
      }
    };
    if (useMockData) load();
  }, [useMockData, eventId, hasEventId]);

  const handleAddMeteor = useCallback(async () => {
    setLoadingCount((c) => c + 1);
    try {
      const traj = await getRandomMeteorTrajectory();
      if (traj) {
        const uid = `${traj._id}-${Date.now()}`;
        setTrackedMeteors((prev) => [
          ...prev,
          { uid, eventId: traj._id, data: traj },
        ]);
        setMeteorData((prev) => [...prev, trajectoryToMeteorData(traj)]);
      }
    } finally {
      setLoadingCount((c) => c - 1);
    }
  }, []);

  const handleRemoveMeteor = useCallback((uid: string) => {
    setTrackedMeteors((prev) => {
      const target = prev.find((m) => m.uid === uid);
      if (target)
        setMeteorData((d) => d.filter((m) => m.id !== target.data._id));
      return prev.filter((m) => m.uid !== uid);
    });
  }, []);

  const isLoading = loadingCount > 0;
  const simIsDefault = timeScale === 1 && sizeScale === 1;

  return (
    <div className="w-screen h-screen bg-black">
      <Loader />
      <Leva collapsed />

      {/* ── Overlay UI ── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 min-w-64 max-w-sm w-full px-2">
        {/* Controls only when no eventId */}
        {!hasEventId && (
          <>
            {/* Add button */}
            <button
              onClick={handleAddMeteor}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium backdrop-blur transition disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
            >
              {isLoading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Plus size={15} />
              )}
              Request Random Meteor
            </button>

            {/* Loading bar */}
            {isLoading && (
              <div className="w-full h-0.5 bg-white/10 rounded overflow-hidden">
                <div className="h-full bg-blue-400 animate-[loading_1s_ease-in-out_infinite]" />
              </div>
            )}

            {/* Active meteors list */}
            {trackedMeteors.length > 0 && (
              <div className="w-full bg-black/60 border border-white/15 rounded-lg backdrop-blur overflow-hidden">
                <button
                  onClick={() => setIsListOpen((o) => !o)}
                  className="flex items-center justify-between w-full px-3 py-2 text-white/70 hover:text-white text-xs font-medium transition"
                >
                  <span>Active meteors ({trackedMeteors.length})</span>
                  {isListOpen ? (
                    <ChevronUp size={13} />
                  ) : (
                    <ChevronDown size={13} />
                  )}
                </button>

                {isListOpen && (
                  <ul className="divide-y divide-white/10 max-h-56 overflow-y-auto">
                    {trackedMeteors.map((m) => (
                      <li
                        key={m.uid}
                        className="flex items-center justify-between px-3 py-2 text-white/80 text-xs"
                      >
                        <span className="font-mono truncate">{m.eventId}</span>
                        <button
                          onClick={() => handleRemoveMeteor(m.uid)}
                          className="ml-2 p-1 rounded hover:bg-white/10 text-white/50 hover:text-red-400 transition shrink-0"
                          title="Remove"
                        >
                          <X size={13} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        )}

        {/* ── Sim controls — always visible ── */}
        <div className="w-full bg-black/60 border border-white/15 rounded-lg backdrop-blur overflow-hidden">
          <button
            onClick={() => setIsSimOpen((o) => !o)}
            className="flex items-center justify-between w-full px-3 py-2 text-white/70 hover:text-white text-xs font-medium transition group"
          >
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal
                size={12}
                className="opacity-50 group-hover:opacity-100 transition"
              />
              <span>Simulation</span>
              {!simIsDefault && !isSimOpen && (
                <span className="ml-1 px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-mono">
                  modified
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!simIsDefault && isSimOpen && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTimeScale(1);
                    setSizeScale(1);
                  }}
                  className="text-[10px] text-white/30 hover:text-blue-400 font-mono transition"
                >
                  reset all
                </button>
              )}
              {isSimOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </div>
          </button>

          {isSimOpen && (
            <div className="border-t border-white/10 divide-y divide-white/5">
              <SimSlider
                label="Time Scale"
                value={timeScale}
                min={0.1}
                max={2}
                step={0.1}
                format={(v) => `${v.toFixed(1)}×`}
                onChange={setTimeScale}
                onReset={() => setTimeScale(1)}
                action={
                  <button
                    onClick={() =>
                      setTimeScale(parseFloat((timeScale * 0.5).toFixed(2)))
                    }
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white/90 text-[10px] font-mono transition"
                    title="Half speed"
                  >
                    ×0.5
                  </button>
                }
              />
              <SimSlider
                label="Size Scale"
                value={sizeScale}
                min={0.1}
                max={50}
                step={0.1}
                format={(v) => `${v.toFixed(1)}×`}
                onChange={setSizeScale}
                onReset={() => setSizeScale(1)}
                action={
                  <button
                    onClick={() =>
                      setSizeScale(parseFloat((sizeScale + 10).toFixed(1)))
                    }
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white/90 text-[10px] font-mono transition"
                    title="+10 size"
                  >
                    +10
                  </button>
                }
              />
            </div>
          )}
        </div>
      </div>

      <Canvas
        camera={{
          fov: 45,
          position: [100, 50, -70],
          near: 0.1,
          far: 1000000,
          zoom: 2.5,
        }}
        shadows
      >
        <GroundProvider>
          {process.env.NODE_ENV === "development" && (
            <>
              <Stats />
              <axesHelper args={[10]} />
            </>
          )}
          <ambientLight intensity={0.05} />
          <directionalLight position={[0, 0, -30]} />
          <OrbitControls target={[0, 40, 0]} />
          <Suspense fallback={null}>
            <Earth>
              {meteorData.map(({ id, ...props }) => (
                <Meteor
                  key={id}
                  {...props}
                  color={massToColor(props.m0)}
                  loop
                />
              ))}
            </Earth>
          </Suspense>
        </GroundProvider>
      </Canvas>
    </div>
  );
}

export default function PlayGround() {
  return (
    <MeteorSimProvider>
      <PlayGroundInner />
    </MeteorSimProvider>
  );
}

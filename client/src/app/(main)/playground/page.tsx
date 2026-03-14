"use client";

import { Canvas } from "@react-three/fiber";
import { Stats, OrbitControls } from "@react-three/drei";

import { GroundProvider } from "@/context/GroundContext";
import Earth from "@/components/playground/earth";
import { CameraSetup } from "@/components/playground/environment/CameraSetup";

export default function PlayGround() {
  return (
    <div className="w-screen h-screen">
      {/* <PerfMonitor /> */}

      <Canvas
        camera={{
          fov: 45,
          position: [100, 50, 10],
          rotateY: 40,
          near: 0.1,
          far: 400,
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

          {/* 🌍 Ambient Environment */}
          <ambientLight intensity={0.01} />
          <directionalLight position={[0, 20, -30]} />

          <OrbitControls
            maxDistance={200}
            minDistance={100}
            target={[0, 40, 0]}
            maxPolarAngle={Math.PI / 2}
          />
          <Earth />
          {/* ♾️ Infinite Ground */}
        </GroundProvider>
      </Canvas>
    </div>
  );
}

import { Gltf } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const EARTH_RADIUS = 78.62 / 2;
const SURFACE_OFFSET = 1.01; // adjust to match your model's actual scale
const LNG_OFFSET = 90;

// Convert lat/lng to a 3D position on the globe
function latLngToVector3(lat: number, lng: number): THREE.Vector3 {
  const latRad = (lat * Math.PI) / 180;
  const lngRad = ((lng + LNG_OFFSET) * Math.PI) / 180;
  const radius = EARTH_RADIUS * SURFACE_OFFSET;
  return new THREE.Vector3(
    radius * Math.cos(latRad) * Math.sin(lngRad), // X
    radius * Math.sin(latRad), // Y
    radius * Math.cos(latRad) * Math.cos(lngRad), // Z
  );
}

const markers = [
  { name: "New York", lat: 40.7128, lng: -74.006 },
  { name: "London", lat: 51.5074, lng: -0.1278 },
  { name: "Tokyo", lat: 35.6762, lng: 139.6503 },
  { name: "Shri Lanks", lat: 8.036409, lng: 80.575488 },
];

export default function Earth() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null);
  const TILT = ((-23.4 * Math.PI) / 180) * 2;

  // Inside a useEffect after the model loads:
  useEffect(() => {
    if (ref.current) {
      const box = new THREE.Box3().setFromObject(ref.current);
      const size = box.getSize(new THREE.Vector3());
      console.log("Model size:", size); // Use size.x / 2 as your radius
    }
  }, []);

  return (
    <group rotation={[TILT, 0, 0]}>
      {/* Earth model */}
      <Gltf ref={ref} src="/assets/playground/models/earth.glb" />

      {/* Lat/Lng Markers */}
      {markers.map(({ name, lat, lng }) => {
        const pos = latLngToVector3(lat, lng);
        console.log(pos);
        return (
          <mesh key={name} position={pos}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshStandardMaterial color="red" />
          </mesh>
        );
      })}
    </group>
  );
}

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

export function CameraSetup() {
  const { camera } = useThree();

  useEffect(() => {
    camera.lookAt(0, 50, 0);
  }, [camera]);

  return null;
}

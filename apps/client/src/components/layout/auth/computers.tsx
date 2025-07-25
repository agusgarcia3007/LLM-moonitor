// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as THREE from "three";
import { useMemo, useContext, createContext, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  useGLTF,
  Merged,
  RenderTexture,
  PerspectiveCamera,
  Text,
} from "@react-three/drei";
import { SpinningBox } from "./spinning-box";
THREE.ColorManagement.legacyMode = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const context = createContext<any>(null);

interface InstancesProps {
  children: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export function Instances({ children, ...props }: InstancesProps) {
  const { nodes } = useGLTF("/computers_1-transformed.glb");
  const instances = useMemo(
    () => ({
      Object: nodes.Object_4,
      Object1: nodes.Object_16,
      Object3: nodes.Object_52,
      Object13: nodes.Object_172,
      Object14: nodes.Object_174,
      Object23: nodes.Object_22,
      Object24: nodes.Object_26,
      Object32: nodes.Object_178,
      Object36: nodes.Object_28,
      Object45: nodes.Object_206,
      Object46: nodes.Object_207,
      Object47: nodes.Object_215,
      Object48: nodes.Object_216,
      Sphere: nodes.Sphere,
    }),
    [nodes]
  );
  return (
    <Merged castShadow receiveShadow meshes={instances} {...props}>
      {(instances) => (
        <context.Provider value={instances} children={children} />
      )}
    </Merged>
  );
}

interface ComputersProps {
  scale?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export function Computers(props: ComputersProps) {
  const { nodes: n, materials: m } = useGLTF(
    "/computers_1-transformed.glb"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as any;
  const instances = useContext(context);
  return (
    <group {...props} dispose={null}>
      <instances.Object
        position={[0.16, 0.79, -1.97]}
        rotation={[-0.54, 0.93, -1.12]}
        scale={0.5}
      />
      <instances.Object
        position={[-2.79, 0.27, 1.82]}
        rotation={[-1.44, 1.22, 1.43]}
        scale={0.5}
      />
      <instances.Object
        position={[-5.6, 4.62, -0.03]}
        rotation={[-1.96, 0.16, 1.2]}
        scale={0.5}
      />
      <instances.Object
        position={[2.62, 1.98, -2.47]}
        rotation={[-0.42, -0.7, -1.85]}
        scale={0.5}
      />
      <instances.Object
        position={[4.6, 3.46, 1.19]}
        rotation={[-1.24, -0.72, 0.48]}
        scale={0.5}
      />
      <instances.Object1
        position={[0.63, 0, -3]}
        rotation={[0, 0.17, 0]}
        scale={1.52}
      />
      <instances.Object1
        position={[-2.36, 0.32, -2.02]}
        rotation={[0, 0.53, -Math.PI / 2]}
        scale={1.52}
      />
      <mesh
        castShadow
        receiveShadow
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        geometry={(n.Object_24 as any).geometry}
        material={m.Texture}
        position={[-2.42, 0.94, -2.25]}
        rotation={[0, 0.14, Math.PI / 2]}
        scale={-1.52}
      />
      <instances.Object1
        position={[-3.53, 0, 0.59]}
        rotation={[Math.PI, -1.09, Math.PI]}
        scale={1.52}
      />
      <instances.Object1
        position={[-3.53, 1.53, 0.59]}
        rotation={[0, 0.91, 0]}
        scale={1.52}
      />
      <instances.Object1
        position={[3.42, 0, 0]}
        rotation={[-Math.PI, 1.13, -Math.PI]}
        scale={1.52}
      />
      <instances.Object1
        position={[4.09, 2.18, 2.41]}
        rotation={[0, -1.55, 1.57]}
        scale={1.52}
      />
      <instances.Object3
        position={[4.31, 1.57, 2.34]}
        rotation={[0, -1.15, -Math.PI / 2]}
        scale={-1.52}
      />
      <instances.Object3
        position={[-3.79, 0, 1.66]}
        rotation={[Math.PI, -1.39, 0]}
        scale={-1.52}
      />
      <instances.Object3
        position={[-3.79, 1.53, 1.66]}
        rotation={[0, 1.22, -Math.PI]}
        scale={-1.52}
      />
      <instances.Object1
        position={[-3.69, 0, 2.59]}
        rotation={[0, -1.57, 0]}
        scale={1.52}
      />
      <instances.Object1
        position={[-5.36, 2.18, 0.81]}
        rotation={[0, 0.77, Math.PI / 2]}
        scale={1.52}
      />
      <instances.Object3
        position={[-5.56, 1.57, 0.69]}
        rotation={[0, 1.17, -Math.PI / 2]}
        scale={-1.52}
      />
      <instances.Object1
        position={[-5.47, 2.79, 0.74]}
        rotation={[Math.PI, -1.16, Math.PI / 2]}
        scale={1.52}
      />
      <instances.Object3
        position={[-5.29, 3.41, 0.89]}
        rotation={[Math.PI, -0.76, -Math.PI / 2]}
        scale={-1.52}
      />
      <instances.Object1
        position={[-5.28, 0, -2.33]}
        rotation={[0, 0.75, 0]}
        scale={1.52}
      />
      <instances.Object1
        position={[-5.49, 0, -1.38]}
        rotation={[Math.PI, -0.99, Math.PI]}
        scale={1.52}
      />
      <instances.Object1
        position={[-3.01, 0, -3.79]}
        rotation={[0, 0.6, 0]}
        scale={1.52}
      />
      <instances.Object1
        position={[-2.08, 0, -4.32]}
        rotation={[Math.PI, -0.6, Math.PI]}
        scale={1.52}
      />
      <instances.Object1
        position={[-1.02, 0, -4.49]}
        rotation={[0, 0.31, 0]}
        scale={1.52}
      />
      <instances.Object1
        position={[-5.31, 1.83, -1.41]}
        rotation={[0, 1.06, Math.PI / 2]}
        scale={1.52}
      />
      <instances.Object1
        position={[-4.18, 1.83, -3.06]}
        rotation={[-Math.PI, -0.46, -Math.PI / 2]}
        scale={1.52}
      />
      <instances.Object1
        position={[-1.76, 1.83, -3.6]}
        rotation={[0, -1.16, Math.PI / 2]}
        scale={1.52}
      />
      <instances.Object1
        position={[-0.25, 1.83, -5.54]}
        rotation={[0, 1.55, 1.57]}
        scale={1.52}
      />
      <instances.Object1
        position={[-5.28, 2.14, -2.33]}
        rotation={[Math.PI, -0.75, Math.PI]}
        scale={1.52}
      />
      <instances.Object1
        position={[-5.49, 2.14, -1.38]}
        rotation={[0, 0.99, 0]}
        scale={1.52}
      />
      <instances.Object1
        position={[-3.01, 2.14, -3.79]}
        rotation={[Math.PI, -0.6, Math.PI]}
        scale={1.52}
      />
      <instances.Object1
        position={[-2.08, 2.14, -4.32]}
        rotation={[0, 0.6, 0]}
        scale={1.52}
      />
      <instances.Object1
        position={[-1.02, 2.14, -4.49]}
        rotation={[Math.PI, -0.31, Math.PI]}
        scale={1.52}
      />
      <instances.Object1
        position={[-5.31, 3.98, -1.41]}
        rotation={[0, 1.06, Math.PI / 2]}
        scale={1.52}
      />
      <instances.Object1
        position={[-4.18, 3.98, -3.06]}
        rotation={[-Math.PI, -0.46, -Math.PI / 2]}
        scale={1.52}
      />
      <instances.Object1
        position={[-1.17, 3.98, -4.45]}
        rotation={[0, 0.17, Math.PI / 2]}
        scale={1.52}
      />
      <instances.Object1
        position={[-0.94, 3.98, -4.66]}
        rotation={[Math.PI, 0.02, -Math.PI / 2]}
        scale={1.52}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={n.Object_140.geometry}
        material={m.Texture}
        position={[5.53, 2.18, 0.17]}
        rotation={[-Math.PI, 0, 0]}
        scale={-1}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={n.Object_144.geometry}
        material={m.Texture}
        position={[5.74, 1.57, 0.05]}
        rotation={[-Math.PI, 0, 0]}
        scale={-1}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={n.Object_148.geometry}
        material={m.Texture}
        position={[5.65, 2.79, 0.11]}
        rotation={[-Math.PI, 0, 0]}
        scale={-1}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={n.Object_152.geometry}
        material={m.Texture}
        position={[5.46, 3.41, 0.26]}
        rotation={[-Math.PI, 0, 0]}
        scale={-1}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={n.Object_156.geometry}
        material={m.Texture}
        position={[4.86, 0, -2.54]}
        rotation={[-Math.PI, 0, 0]}
        scale={-1}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={n.Object_160.geometry}
        material={m.Texture}
        position={[5.06, 0, -1.6]}
        rotation={[-Math.PI, 0, 0]}
        scale={-1}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={n.Object_164.geometry}
        material={m.Texture}
        position={[2.59, 0, -4]}
        rotation={[-Math.PI, 0, 0]}
        scale={-1}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={n.Object_168.geometry}
        material={m.Texture}
        position={[1.66, 0, -4.54]}
        rotation={[-Math.PI, 0, 0]}
        scale={-1}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={n.Object_170.geometry}
        material={m.Texture}
        position={[0.59, 0, -4.7]}
        rotation={[-Math.PI, 0, 0]}
        scale={-1}
      />
      <instances.Object13
        position={[4.89, 1.83, -1.62]}
        rotation={[-Math.PI, 0, 0]}
        scale={-1}
      />
      <instances.Object14
        position={[3.75, 1.83, -3.28]}
        rotation={[-Math.PI, 0, 0]}
        scale={-1}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={n.Object_176.geometry}
        material={m.Texture}
        position={[1.33, 1.83, -3.82]}
        rotation={[-Math.PI, 0, 0]}
        scale={-1}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={n.Object_180.geometry}
        material={m.Texture}
        position={[4.86, 2.14, -2.54]}
        rotation={[-Math.PI, 0, 0]}
        scale={-1}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={n.Object_184.geometry}
        material={m.Texture}
        position={[5.06, 2.14, -1.6]}
        rotation={[-Math.PI, 0, 0]}
        scale={-1}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={n.Object_188.geometry}
        material={m.Texture}
        position={[2.59, 2.14, -4]}
        rotation={[-Math.PI, 0, 0]}
        scale={-1}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={n.Object_192.geometry}
        material={m.Texture}
        position={[1.66, 2.14, -4.54]}
        rotation={[-Math.PI, 0, 0]}
        scale={-1}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={n.Object_194.geometry}
        material={m.Texture}
        position={[0.59, 2.14, -4.7]}
        rotation={[-Math.PI, 0, 0]}
        scale={-1}
      />
      <instances.Object13
        position={[4.89, 3.98, -1.62]}
        rotation={[-Math.PI, 0, 0]}
        scale={-1}
      />
      <instances.Object14
        position={[3.75, 3.98, -3.28]}
        rotation={[-Math.PI, 0, 0]}
        scale={-1}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={n.Object_200.geometry}
        material={m.Texture}
        position={[0.75, 3.98, -4.66]}
        rotation={[-Math.PI, 0, 0]}
        scale={-1}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={n.Object_18.geometry}
        material={m.Texture}
        position={[-0.19, 0, -2.96]}
        rotation={[0, -0.06, 0]}
        scale={1.52}
      />
      <instances.Object23
        position={[-2.29, 1.56, -2.26]}
        rotation={[0, -0.005, -Math.PI / 2]}
        scale={1.52}
      />
      <instances.Object24
        position={[-2.19, 2.19, -1.87]}
        rotation={[0, 0.51, Math.PI / 2]}
        scale={-1.52}
      />
      <instances.Object23
        position={[-2.9, 0.3, -1.47]}
        rotation={[Math.PI, -1.35, Math.PI / 2]}
        scale={1.52}
      />
      <instances.Object23
        position={[3.22, 0, -0.8]}
        rotation={[0, -1.32, 0]}
        scale={1.52}
      />
      <instances.Object23
        position={[3.53, 1.83, 0.44]}
        rotation={[-Math.PI, 1.32, Math.PI / 2]}
        scale={1.52}
      />
      <instances.Object23
        position={[4.26, 0.94, 2.22]}
        rotation={[0, -1, Math.PI / 2]}
        scale={1.52}
      />
      <instances.Object24
        position={[3.87, 0.32, 2.35]}
        rotation={[0, -1.53, -1.57]}
        scale={-1.52}
      />
      <instances.Object23
        position={[-5.61, 0.94, 0.82]}
        rotation={[0, 1.32, 1.57]}
        scale={1.52}
      />
      <instances.Object24
        position={[-5.26, 0.32, 1.01]}
        rotation={[0, 0.79, -Math.PI / 2]}
        scale={-1.52}
      />
      <instances.Object23
        position={[-5.39, 4.03, 0.99]}
        rotation={[Math.PI, -0.61, Math.PI / 2]}
        scale={1.52}
      />
      <instances.Object24
        position={[-5.7, 4.66, 0.72]}
        rotation={[Math.PI, -1.13, -Math.PI / 2]}
        scale={-1.52}
      />
      <instances.Object23
        position={[-5.95, 0, -0.64]}
        rotation={[0, 0.95, 0]}
        scale={1.52}
      />
      <instances.Object23
        position={[-4.48, 0, -2.75]}
        rotation={[Math.PI, -0.57, Math.PI]}
        scale={1.52}
      />
      <instances.Object23
        position={[-3.72, 0, -2.89]}
        rotation={[0, 0.64, 0]}
        scale={1.52}
      />
      <instances.Object23
        position={[-0.08, 0, -5.03]}
        rotation={[Math.PI, -0.04, Math.PI]}
        scale={1.52}
      />
      <instances.Object24
        position={[-4.19, 1.84, -2.77]}
        rotation={[Math.PI, -0.66, -Math.PI / 2]}
        scale={-1.52}
      />
      <instances.Object23
        position={[-5.95, 2.14, -0.64]}
        rotation={[Math.PI, -0.95, Math.PI]}
        scale={1.52}
      />
      <instances.Object23
        position={[-4.48, 2.14, -2.75]}
        rotation={[0, 0.57, 0]}
        scale={1.52}
      />
      <instances.Object23
        position={[-3.73, 2.14, -3.1]}
        rotation={[Math.PI, -0.64, Math.PI]}
        scale={1.52}
      />
      <instances.Object23
        position={[-0.08, 2.14, -5.03]}
        rotation={[0, 0.04, 0]}
        scale={1.52}
      />
      <instances.Object24
        position={[-4.19, 3.98, -2.77]}
        rotation={[Math.PI, -0.66, -Math.PI / 2]}
        scale={-1.52}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={n.Object_142.geometry}
        material={m.Texture}
        position={[5.79, 0.94, 0.18]}
        rotation={[-Math.PI, 0, 0]}
        scale={-1}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={n.Object_146.geometry}
        material={m.Texture}
        position={[5.43, 0.32, 0.37]}
        rotation={[-Math.PI, 0, 0]}
        scale={-1}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={n.Object_150.geometry}
        material={m.Texture}
        position={[5.56, 4.03, 0.35]}
        rotation={[-Math.PI, 0, 0]}
        scale={-1}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={n.Object_154.geometry}
        material={m.Texture}
        position={[5.87, 4.66, 0.08]}
        rotation={[-Math.PI, 0, 0]}
        scale={-1}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={n.Object_158.geometry}
        material={m.Texture}
        position={[5.53, 0, -0.85]}
        rotation={[-Math.PI, 0, 0]}
        scale={-1}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={n.Object_162.geometry}
        material={m.Texture}
        position={[4.05, 0, -2.96]}
        rotation={[-Math.PI, 0, 0]}
        scale={-1}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={n.Object_166.geometry}
        material={m.Texture}
        position={[3.29, 0, -3.1]}
        rotation={[-Math.PI, 0, 0]}
        scale={-1}
      />
      <instances.Object32
        position={[3.77, 1.84, -2.98]}
        rotation={[-Math.PI, 0, 0]}
        scale={-1}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={n.Object_182.geometry}
        material={m.Texture}
        position={[5.53, 2.14, -0.85]}
        rotation={[-Math.PI, 0, 0]}
        scale={-1}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={n.Object_186.geometry}
        material={m.Texture}
        position={[4.05, 2.14, -2.96]}
        rotation={[-Math.PI, 0, 0]}
        scale={-1}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={n.Object_190.geometry}
        material={m.Texture}
        position={[3.3, 2.14, -3.31]}
        rotation={[-Math.PI, 0, 0]}
        scale={-1}
      />
      <instances.Object32
        position={[3.77, 3.98, -2.98]}
        rotation={[-Math.PI, 0, 0]}
        scale={-1}
      />
      <instances.Object36
        position={[0.35, 2.35, -3.34]}
        rotation={[-0.26, 0, 0]}
      />
      <instances.Object36
        position={[0.18, 2.8, -2.85]}
        rotation={[0.09, 0.15, -0.005]}
      />
      <instances.Object36
        position={[1.89, 0, -1.94]}
        rotation={[0, -0.44, 0]}
        scale={[1.5, 1, 1.5]}
      />
      <instances.Object36
        position={[1.86, 1.61, -1.81]}
        rotation={[0, -Math.PI / 3, 0]}
      />
      <instances.Object36
        position={[3.95, 2.49, 1.61]}
        rotation={[0, -Math.PI / 3, 0]}
      />
      <instances.Object36
        position={[-1.1, 4.29, -4.43]}
        rotation={[0, 0.36, 0]}
      />
      <instances.Object36
        position={[-5.25, 4.29, -1.47]}
        rotation={[0, 1.25, 0]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={n.Object_204.geometry}
        material={m.Texture}
        position={[3.2, 4.29, -3.09]}
        rotation={[-Math.PI, 0.56, 0]}
        scale={-1}
      />
      <ScreenInteractive
        frame="Object_206"
        panel="Object_207"
        position={[0.27, 1.53, -2.61]}
      />
      <ScreenText
        frame="Object_209"
        panel="Object_210"
        y={5}
        position={[-1.43, 2.5, -1.8]}
        rotation={[0, 1, 0]}
      />
      <ScreenText
        invert
        frame="Object_212"
        panel="Object_213"
        x={-5}
        y={5}
        position={[-2.73, 0.63, -0.52]}
        rotation={[0, 1.09, 0]}
      />
      <ScreenText
        invert
        frame="Object_215"
        panel="Object_216"
        position={[1.84, 0.38, -1.77]}
        rotation={[0, -Math.PI / 9, 0]}
      />
      <ScreenText
        invert
        frame="Object_218"
        panel="Object_219"
        x={-5}
        position={[3.11, 2.15, -0.18]}
        rotation={[0, -0.79, 0]}
        scale={0.81}
      />
      <ScreenText
        frame="Object_221"
        panel="Object_222"
        y={5}
        position={[-3.42, 3.06, 1.3]}
        rotation={[0, 1.22, 0]}
        scale={0.9}
      />
      <ScreenText
        invert
        frame="Object_224"
        panel="Object_225"
        position={[-3.9, 4.29, -2.64]}
        rotation={[0, 0.54, 0]}
      />
      <ScreenText
        frame="Object_227"
        panel="Object_228"
        position={[0.96, 4.28, -4.2]}
        rotation={[0, -0.65, 0]}
      />
      <ScreenText
        frame="Object_230"
        panel="Object_231"
        position={[4.68, 4.29, -1.56]}
        rotation={[0, -Math.PI / 3, 0]}
      />
      <Leds instances={instances} />
    </group>
  );
}

/* This component renders a monitor (taken out of the gltf model)
   It renders a custom scene into a texture and projects it onto monitors screen */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Screen({ frame, panel, children, ...props }: any) {
  const { nodes, materials } = useGLTF("/computers_1-transformed.glb");
  return (
    <group {...props}>
      <mesh
        castShadow
        receiveShadow
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        geometry={(nodes[frame] as any).geometry}
        material={materials.Texture}
      />
      <mesh
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        geometry={(nodes[panel] as any).geometry}
      >
        <meshBasicMaterial toneMapped={false}>
          <RenderTexture width={512} height={512} attach="map" anisotropy={16}>
            {children}
          </RenderTexture>
        </meshBasicMaterial>
      </mesh>
    </group>
  );
}

/* Renders a monitor with some text */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ScreenText({ invert, x = 0, y = 1.2, ...props }: any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const textRef = useRef<any>(null);
  const rand = Math.random() * 10000;
  useFrame(
    (state) =>
      (textRef.current.position.x =
        x + Math.sin(rand + state.clock.elapsedTime / 4) * 8)
  );
  return (
    <Screen {...props}>
      <PerspectiveCamera
        makeDefault
        manual
        aspect={1 / 1}
        position={[0, 0, 15]}
      />
      <color attach="background" args={[invert ? "black" : "#2b7fff"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />
      <Text
        position={[x, y, 0]}
        ref={textRef}
        fontSize={4}
        letterSpacing={-0.1}
        color={!invert ? "black" : "#2b7fff"}
      >
        LLMonitor.
      </Text>
    </Screen>
  );
}

/* Renders a monitor with a spinning box */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ScreenInteractive(props: any) {
  return (
    <Screen {...props}>
      <PerspectiveCamera
        makeDefault
        manual
        aspect={1 / 1}
        position={[0, 0, 10]}
      />
      <color attach="background" args={["orange"]} />
      <ambientLight intensity={Math.PI / 2} />
      <pointLight decay={0} position={[10, 10, 10]} intensity={Math.PI} />
      <pointLight decay={0} position={[-10, -10, -10]} />
      <SpinningBox position={[-3.15, 0.75, 0]} scale={0.5} />
    </Screen>
  );
}

// Renders flashing LED's
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Leds({ instances }: any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null);
  const { nodes } = useGLTF("/computers_1-transformed.glb");
  useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (nodes.Sphere as any).material = new THREE.MeshBasicMaterial();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (nodes.Sphere as any).material.toneMapped = false;
  }, []);
  useFrame((state) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref.current.children.forEach((instance: any) => {
      const rand = Math.abs(2 + instance.position.x);
      const t = Math.round(
        (1 + Math.sin(rand * 10000 + state.clock.elapsedTime * rand)) / 2
      );
      instance.color.setRGB(0, t * 1.1, t);
    });
  });
  return (
    <group ref={ref}>
      <instances.Sphere
        position={[-0.41, 1.1, -2.21]}
        scale={0.005}
        color={[1, 2, 1]}
      />
      <instances.Sphere
        position={[0.59, 1.32, -2.22]}
        scale={0.005}
        color={[1, 2, 1]}
      />
      <instances.Sphere
        position={[1.77, 1.91, -1.17]}
        scale={0.005}
        color={[1, 2, 1]}
      />
      <instances.Sphere
        position={[2.44, 1.1, -0.79]}
        scale={0.005}
        color={[1, 2, 1]}
      />
      <instances.Sphere
        position={[4.87, 3.8, -0.1]}
        scale={0.005}
        color={[1, 2, 1]}
      />
      <instances.Sphere
        position={[1.93, 3.8, -3.69]}
        scale={0.005}
        color={[1, 2, 1]}
      />
      <instances.Sphere
        position={[-2.35, 3.8, -3.48]}
        scale={0.005}
        color={[1, 2, 1]}
      />
      <instances.Sphere
        position={[-4.71, 4.59, -1.81]}
        scale={0.005}
        color={[1, 2, 1]}
      />
      <instances.Sphere
        position={[-3.03, 2.85, 1.19]}
        scale={0.005}
        color={[1, 2, 1]}
      />
      <instances.Sphere
        position={[-1.21, 1.73, -1.49]}
        scale={0.005}
        color={[1, 2, 1]}
      />
    </group>
  );
}

import { Canvas, useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { CAPTURE } from '../anim'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { Rig } from './Rig'

function Lights() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[3.5, 6, 5]}
        intensity={2.3}
        color="#fff3e2"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
      />
      {/* warm rim from behind for a cinematic edge */}
      <spotLight position={[-4, 3.5, -4]} angle={0.6} penumbra={1} intensity={60} color="#ffb27a" />
      <pointLight position={[2.5, 1, 3]} intensity={6} color="#ffe2c2" />

      {/* studio softboxes, no external HDR file needed */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.4} position={[0, 5, 2]} rotation-x={Math.PI / 2} scale={[8, 4, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[4, 6, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#ffd2a8" position={[5, 1, -1]} rotation-y={-Math.PI / 2} scale={[4, 6, 1]} />
        <Lightformer form="ring" intensity={0.8} position={[0, 0.5, 6]} scale={3} />
      </Environment>
    </>
  )
}

/** In ?capture mode the canvas only renders when the QA script calls window.__advance(). */
function CaptureHook() {
  const advance = useThree((s) => s.advance)
  useEffect(() => {
    const w = window as unknown as { __advance?: () => void; __t?: number }
    w.__t = w.__t ?? 0
    w.__advance = () => advance(performance.now())
  }, [advance])
  return null
}

export function Scene() {
  return (
    <Canvas
      className="!fixed inset-0 z-[2] !pointer-events-none"
      shadows={{ type: THREE.PCFShadowMap }}
      frameloop={CAPTURE ? 'never' : 'always'}
      dpr={[1, 2]}
      camera={{ position: [0, 0, 7], fov: 32, near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping
        gl.toneMappingExposure = 1.05
        gl.setClearColor(0x000000, 0)
      }}
    >
      <Lights />
      <Rig />
      {CAPTURE && <CaptureHook />}
    </Canvas>
  )
}

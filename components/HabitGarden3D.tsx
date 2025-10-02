import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Platform, Dimensions, Text } from 'react-native';
import * as THREE from 'three';

interface HabitCityBuilderProps {
  habits: {
    id: string;
    name: string;
    color: string;
    streak: number;
  }[];
  onHabitClick?: (habitId: string) => void;
}

export function HabitGarden3D({ habits, onHabitClick }: HabitCityBuilderProps) {
  const containerRef = useRef<View>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const buildingsRef = useRef<Map<string, THREE.Group>>(new Map());
  const animationFrameRef = useRef<number | null>(null);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    try {
      const canvas = document.createElement('canvas');
    canvasRef.current = canvas;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f1729);
    scene.fog = new THREE.FogExp2(0x1a2332, 0.015);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      50,
      dimensions.width / (dimensions.height - 200),
      0.1,
      1000
    );
    camera.position.set(20, 18, 20);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(dimensions.width, dimensions.height - 200);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0x5a6a8a, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(25, 40, 15);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 120;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    directionalLight.shadow.bias = -0.0001;
    scene.add(directionalLight);

    const moonLight = new THREE.PointLight(0x8b9dff, 2, 120);
    moonLight.position.set(-20, 35, -20);
    scene.add(moonLight);

    const cityGlow1 = new THREE.PointLight(0xff6b9d, 1.2, 60);
    cityGlow1.position.set(-8, 8, -8);
    scene.add(cityGlow1);

    const cityGlow2 = new THREE.PointLight(0x6bffd9, 1.2, 60);
    cityGlow2.position.set(8, 8, 8);
    scene.add(cityGlow2);

    const cityGlow3 = new THREE.PointLight(0xffd96b, 1, 50);
    cityGlow3.position.set(0, 12, 0);
    scene.add(cityGlow3);

    const groundSize = 60;
    const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a2332,
      roughness: 0.85,
      metalness: 0.15,
      emissive: 0x0a0f1a,
      emissiveIntensity: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(groundSize, 60, 0x3d4a6b, 0x252f45);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    const roadWidth = 2.5;
    const roadMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2a3548,
      roughness: 0.7,
      metalness: 0.3,
      emissive: 0x1a2030,
      emissiveIntensity: 0.15
    });

    const mainRoad1 = new THREE.Mesh(
      new THREE.PlaneGeometry(groundSize, roadWidth),
      roadMaterial
    );
    mainRoad1.rotation.x = -Math.PI / 2;
    mainRoad1.position.y = 0.02;
    mainRoad1.receiveShadow = true;
    scene.add(mainRoad1);

    const mainRoad2 = new THREE.Mesh(
      new THREE.PlaneGeometry(roadWidth, groundSize),
      roadMaterial
    );
    mainRoad2.rotation.x = -Math.PI / 2;
    mainRoad2.position.y = 0.02;
    mainRoad2.receiveShadow = true;
    scene.add(mainRoad2);

    const sidewalkWidth = 0.4;
    const sidewalkMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x3a4558,
      roughness: 0.9,
      metalness: 0.1
    });

    for (let side of [-1, 1]) {
      const sidewalk1 = new THREE.Mesh(
        new THREE.PlaneGeometry(groundSize, sidewalkWidth),
        sidewalkMaterial
      );
      sidewalk1.rotation.x = -Math.PI / 2;
      sidewalk1.position.set(0, 0.03, side * (roadWidth / 2 + sidewalkWidth / 2));
      sidewalk1.receiveShadow = true;
      scene.add(sidewalk1);

      const sidewalk2 = new THREE.Mesh(
        new THREE.PlaneGeometry(sidewalkWidth, groundSize),
        sidewalkMaterial
      );
      sidewalk2.rotation.x = -Math.PI / 2;
      sidewalk2.position.set(side * (roadWidth / 2 + sidewalkWidth / 2), 0.03, 0);
      sidewalk2.receiveShadow = true;
      scene.add(sidewalk2);
    }

    for (let i = 0; i < 24; i++) {
      const lineGeometry = new THREE.PlaneGeometry(0.12, 1.2);
      const lineMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffd700,
        emissive: 0xffd700,
        emissiveIntensity: 0.5
      });
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      line.rotation.x = -Math.PI / 2;
      line.position.set(i * 2.5 - 30, 0.04, 0);
      scene.add(line);

      const line2 = line.clone();
      line2.rotation.z = Math.PI / 2;
      line2.position.set(0, 0.04, i * 2.5 - 30);
      scene.add(line2);
    }

    for (let i = 0; i < 20; i++) {
      const x = (Math.random() - 0.5) * 45;
      const z = (Math.random() - 0.5) * 45;
      const distance = Math.sqrt(x * x + z * z);
      
      if (distance < 10 || distance > 25) continue;

      const lampHeight = 3.5;
      const poleGeometry = new THREE.CylinderGeometry(0.06, 0.12, lampHeight, 12);
      const poleMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2a3548,
        roughness: 0.4,
        metalness: 0.9,
        emissive: 0x1a2030,
        emissiveIntensity: 0.1
      });
      const pole = new THREE.Mesh(poleGeometry, poleMaterial);
      pole.position.set(x, lampHeight / 2, z);
      pole.castShadow = true;
      scene.add(pole);

      const lampArmGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8);
      const lampArm = new THREE.Mesh(lampArmGeometry, poleMaterial);
      lampArm.rotation.z = Math.PI / 2;
      lampArm.position.set(x + 0.3, lampHeight, z);
      scene.add(lampArm);

      const lightGeometry = new THREE.SphereGeometry(0.18, 20, 20);
      const lightColor = i % 3 === 0 ? 0xffd700 : i % 3 === 1 ? 0xff9d6b : 0x6bffd9;
      const lightMaterial = new THREE.MeshStandardMaterial({ 
        color: lightColor,
        emissive: lightColor,
        emissiveIntensity: 3,
        transparent: true,
        opacity: 0.95
      });
      const lightBulb = new THREE.Mesh(lightGeometry, lightMaterial);
      lightBulb.position.set(x + 0.6, lampHeight, z);
      scene.add(lightBulb);

      const streetLight = new THREE.PointLight(lightColor, 1.5, 10);
      streetLight.position.set(x + 0.6, lampHeight, z);
      streetLight.castShadow = true;
      scene.add(streetLight);

      const glowGeometry = new THREE.SphereGeometry(0.25, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({ 
        color: lightColor,
        transparent: true,
        opacity: 0.3
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.set(x + 0.6, lampHeight, z);
      scene.add(glow);
    }

    for (let i = 0; i < 35; i++) {
      const x = (Math.random() - 0.5) * 50;
      const z = (Math.random() - 0.5) * 50;
      const distance = Math.sqrt(x * x + z * z);
      
      if (distance < 18) continue;

      const treeHeight = 1.8 + Math.random() * 1.2;
      const trunkGeometry = new THREE.CylinderGeometry(0.12, 0.18, treeHeight * 0.35, 10);
      const trunkMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4a3828,
        roughness: 0.95,
        metalness: 0.05
      });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.set(x, treeHeight * 0.175, z);
      trunk.castShadow = true;
      scene.add(trunk);

      const foliageGeometry = new THREE.SphereGeometry(0.6, 12, 12);
      const foliageColor = i % 4 === 0 ? 0x2a4a3a : i % 4 === 1 ? 0x1e3a2e : i % 4 === 2 ? 0x3a5a4a : 0x254a38;
      const foliageMaterial = new THREE.MeshStandardMaterial({ 
        color: foliageColor,
        roughness: 0.85,
        metalness: 0.05
      });
      const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
      foliage.position.set(x, treeHeight * 0.35 + 0.5, z);
      foliage.castShadow = true;
      scene.add(foliage);

      const foliage2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.45, 10, 10),
        foliageMaterial
      );
      foliage2.position.set(x + 0.2, treeHeight * 0.35 + 0.8, z + 0.1);
      foliage2.castShadow = true;
      scene.add(foliage2);
    }

    if (containerRef.current) {
      const viewElement = containerRef.current as any;
      if (viewElement._nativeTag) {
        const domNode = viewElement._nativeTag;
        if (domNode && domNode.appendChild) {
          domNode.appendChild(canvas);
        }
      } else {
        const element = document.getElementById('garden-container');
        if (element) {
          element.appendChild(canvas);
        }
      }
    }

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const object = intersects[0].object;
        let parent = object.parent;
        while (parent) {
          if (parent.userData.habitId) {
            onHabitClick?.(parent.userData.habitId);
            break;
          }
          parent = parent.parent;
        }
      }
    };

    canvas.addEventListener('click', handleClick);

    let time = 0;
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      time += 0.005;

      const radius = 25;
      camera.position.x = Math.sin(time * 0.3) * radius;
      camera.position.z = Math.cos(time * 0.3) * radius;
      camera.position.y = 18 + Math.sin(time * 0.2) * 3;
      camera.lookAt(0, 3, 0);

      buildingsRef.current.forEach((building) => {
        building.children.forEach((child) => {
          if (child.userData.isWindow) {
            const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
            mat.emissiveIntensity = 1.2 + Math.sin(time * 2 + child.position.y) * 0.3;
          }
        });
        
        building.rotation.y = Math.sin(time * 0.5) * 0.02;
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      canvas.removeEventListener('click', handleClick);
      renderer.dispose();
      scene.clear();
    };
    } catch (err) {
      console.error('Error initializing 3D scene:', err);
      setError('Failed to initialize 3D scene. Your browser may not support WebGL.');
    }
  }, [dimensions, onHabitClick]);

  useEffect(() => {
    if (!sceneRef.current || Platform.OS !== 'web') return;

    const scene = sceneRef.current;
    const currentBuildingIds = new Set(habits.map(h => h.id));
    
    buildingsRef.current.forEach((building, id) => {
      if (!currentBuildingIds.has(id)) {
        scene.remove(building);
        buildingsRef.current.delete(id);
      }
    });

    habits.forEach((habit, index) => {
      const existingBuilding = buildingsRef.current.get(habit.id);
      
      if (existingBuilding) {
        updateBuilding(existingBuilding, habit);
      } else {
        const building = createBuilding(habit, index, habits.length);
        scene.add(building);
        buildingsRef.current.set(habit.id, building);
      }
    });
  }, [habits]);

  const createBuilding = (
    habit: { id: string; name: string; color: string; streak: number },
    index: number,
    total: number
  ): THREE.Group => {
    const building = new THREE.Group();
    building.userData.habitId = habit.id;

    const gridSize = Math.ceil(Math.sqrt(total));
    const spacing = 5;
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const offsetX = (gridSize - 1) * spacing / 2;
    const offsetZ = (gridSize - 1) * spacing / 2;
    
    building.position.x = col * spacing - offsetX;
    building.position.z = row * spacing - offsetZ;

    const baseHeight = 0.6;
    const floorHeight = 0.9;
    const floors = Math.min(Math.floor(habit.streak / 2) + 1, 25);
    const totalHeight = baseHeight + floors * floorHeight;
    const width = 1.8 + Math.min(habit.streak * 0.06, 1.2);
    const depth = 1.8 + Math.min(habit.streak * 0.06, 1.2);
    const color = new THREE.Color(habit.color);

    const buildingGeometry = new THREE.BoxGeometry(width, totalHeight, depth);
    const buildingMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2a3548,
      roughness: 0.6,
      metalness: 0.4,
      emissive: 0x1a2332,
      emissiveIntensity: 0.2
    });
    const buildingMesh = new THREE.Mesh(buildingGeometry, buildingMaterial);
    buildingMesh.position.y = totalHeight / 2;
    buildingMesh.castShadow = true;
    buildingMesh.receiveShadow = true;
    building.add(buildingMesh);

    const edgeGeometry = new THREE.EdgesGeometry(buildingGeometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ 
      color: color.getHex(),
      transparent: true,
      opacity: 0.6
    });
    const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    edges.position.y = totalHeight / 2;
    building.add(edges);

    const baseGeometry = new THREE.BoxGeometry(width + 0.2, baseHeight, depth + 0.2);
    const baseMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a2332,
      roughness: 0.8,
      metalness: 0.5,
      emissive: color.getHex(),
      emissiveIntensity: 0.15
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = baseHeight / 2;
    base.castShadow = true;
    base.receiveShadow = true;
    building.add(base);

    const windowSize = 0.18;
    const windowSpacing = 0.35;
    const windowsPerFloor = Math.floor(width / windowSpacing);
    
    for (let floor = 0; floor < floors; floor++) {
      const floorY = baseHeight + floor * floorHeight + floorHeight / 2;
      
      for (let w = 0; w < windowsPerFloor; w++) {
        const windowX = (w - windowsPerFloor / 2) * windowSpacing + windowSpacing / 2;
        
        [1, -1].forEach((side) => {
          const windowGeometry = new THREE.PlaneGeometry(windowSize, windowSize * 1.2);
          const windowMaterial = new THREE.MeshStandardMaterial({ 
            color: color,
            emissive: color,
            emissiveIntensity: 1.5,
            transparent: true,
            opacity: 0.95
          });
          const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
          window1.position.set(windowX, floorY, side * (depth / 2 + 0.01));
          window1.userData.isWindow = true;
          building.add(window1);

          const frameGeometry = new THREE.PlaneGeometry(windowSize + 0.04, windowSize * 1.2 + 0.04);
          const frameMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1a2332,
            roughness: 0.5,
            metalness: 0.7
          });
          const frame1 = new THREE.Mesh(frameGeometry, frameMaterial);
          frame1.position.set(windowX, floorY, side * (depth / 2 + 0.005));
          building.add(frame1);

          const glowGeometry = new THREE.PlaneGeometry(windowSize * 1.3, windowSize * 1.5);
          const glowMaterial = new THREE.MeshBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.2
          });
          const glow1 = new THREE.Mesh(glowGeometry, glowMaterial);
          glow1.position.set(windowX, floorY, side * (depth / 2 + 0.015));
          building.add(glow1);

          const window2 = window1.clone();
          window2.rotation.y = Math.PI / 2;
          window2.position.set(side * (width / 2 + 0.01), floorY, windowX);
          window2.userData.isWindow = true;
          building.add(window2);

          const frame2 = frame1.clone();
          frame2.rotation.y = Math.PI / 2;
          frame2.position.set(side * (width / 2 + 0.005), floorY, windowX);
          building.add(frame2);

          const glow2 = glow1.clone();
          glow2.rotation.y = Math.PI / 2;
          glow2.position.set(side * (width / 2 + 0.015), floorY, windowX);
          building.add(glow2);
        });
      }
    }

    if (habit.streak >= 10) {
      const antennaHeight = 1.5;
      const antennaGeometry = new THREE.CylinderGeometry(0.03, 0.05, antennaHeight, 8);
      const antennaMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4a5568,
        roughness: 0.3,
        metalness: 0.9,
        emissive: color.getHex(),
        emissiveIntensity: 0.3
      });
      const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
      antenna.position.y = totalHeight + antennaHeight / 2;
      antenna.castShadow = true;
      building.add(antenna);

      const beaconGeometry = new THREE.SphereGeometry(0.15, 16, 16);
      const beaconMaterial = new THREE.MeshStandardMaterial({ 
        color: color,
        emissive: color,
        emissiveIntensity: 3,
        transparent: true,
        opacity: 0.9
      });
      const beacon = new THREE.Mesh(beaconGeometry, beaconMaterial);
      beacon.position.y = totalHeight + antennaHeight;
      building.add(beacon);

      const beaconGlowGeometry = new THREE.SphereGeometry(0.25, 16, 16);
      const beaconGlowMaterial = new THREE.MeshBasicMaterial({ 
        color: color,
        transparent: true,
        opacity: 0.4
      });
      const beaconGlow = new THREE.Mesh(beaconGlowGeometry, beaconGlowMaterial);
      beaconGlow.position.y = totalHeight + antennaHeight;
      building.add(beaconGlow);

      const beaconLight = new THREE.PointLight(color.getHex(), 3, 15);
      beaconLight.position.y = totalHeight + antennaHeight;
      building.add(beaconLight);

      for (let i = 0; i < 3; i++) {
        const ringGeometry = new THREE.TorusGeometry(0.08 + i * 0.05, 0.01, 8, 16);
        const ringMaterial = new THREE.MeshStandardMaterial({ 
          color: color,
          emissive: color,
          emissiveIntensity: 1,
          transparent: true,
          opacity: 0.6
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.y = totalHeight + antennaHeight / 2 + i * 0.3;
        ring.rotation.x = Math.PI / 2;
        building.add(ring);
      }
    }

    if (habit.streak >= 15) {
      const helipadsGeometry = new THREE.CylinderGeometry(width * 0.4, width * 0.4, 0.1, 16);
      const helipadMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2a3548,
        roughness: 0.5,
        metalness: 0.6,
        emissive: color.getHex(),
        emissiveIntensity: 0.3
      });
      const helipad = new THREE.Mesh(helipadsGeometry, helipadMaterial);
      helipad.position.y = totalHeight + 0.05;
      building.add(helipad);

      const hCircleGeometry = new THREE.TorusGeometry(width * 0.25, 0.02, 8, 24);
      const hCircleMaterial = new THREE.MeshStandardMaterial({ 
        color: color,
        emissive: color,
        emissiveIntensity: 2
      });
      const hCircle = new THREE.Mesh(hCircleGeometry, hCircleMaterial);
      hCircle.position.y = totalHeight + 0.11;
      hCircle.rotation.x = Math.PI / 2;
      building.add(hCircle);
    }

    if (habit.streak >= 20) {
      const particleCount = 80;
      const particlesGeometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * width * 2.5;
        positions[i * 3 + 1] = totalHeight + Math.random() * 3;
        positions[i * 3 + 2] = (Math.random() - 0.5) * depth * 2.5;
      }
      
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particlesMaterial = new THREE.PointsMaterial({
        color: color,
        size: 0.2,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
      });
      const particles = new THREE.Points(particlesGeometry, particlesMaterial);
      building.add(particles);

      const spotlightCount = 4;
      for (let i = 0; i < spotlightCount; i++) {
        const angle = (i / spotlightCount) * Math.PI * 2;
        const spotLight = new THREE.SpotLight(color.getHex(), 2, 20, Math.PI / 6, 0.5, 2);
        spotLight.position.set(
          Math.cos(angle) * width * 0.5,
          totalHeight + 0.2,
          Math.sin(angle) * depth * 0.5
        );
        spotLight.target.position.set(
          Math.cos(angle) * width * 2,
          0,
          Math.sin(angle) * depth * 2
        );
        building.add(spotLight);
        building.add(spotLight.target);
      }
    }

    return building;
  };

  const updateBuilding = (
    building: THREE.Group,
    habit: { id: string; name: string; color: string; streak: number }
  ) => {
    const color = new THREE.Color(habit.color);

    building.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.userData.isWindow) {
          (child.material as THREE.MeshStandardMaterial).color.set(color);
          (child.material as THREE.MeshStandardMaterial).emissive.set(color);
        }
      }
    });
  };

  if (Platform.OS !== 'web') {
    return null;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View 
      ref={containerRef}
      style={styles.container}
      nativeID="garden-container"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
});

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
    scene.background = new THREE.Color(0x0a0e27);
    scene.fog = new THREE.Fog(0x0a0e27, 30, 100);
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

    const ambientLight = new THREE.AmbientLight(0x4a5568, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 30, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -40;
    directionalLight.shadow.camera.right = 40;
    directionalLight.shadow.camera.top = 40;
    directionalLight.shadow.camera.bottom = -40;
    directionalLight.shadow.bias = -0.0001;
    scene.add(directionalLight);

    const moonLight = new THREE.PointLight(0x6366f1, 1.5, 100);
    moonLight.position.set(-15, 25, -15);
    scene.add(moonLight);

    const cityGlow = new THREE.PointLight(0xff6b6b, 0.8, 50);
    cityGlow.position.set(0, 5, 0);
    scene.add(cityGlow);

    const groundSize = 50;
    const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a1f3a,
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(groundSize, 50, 0x2d3561, 0x1e2442);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    const roadWidth = 2;
    const roadMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2d3561,
      roughness: 0.8,
      metalness: 0.2
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

    for (let i = 0; i < 20; i++) {
      const lineGeometry = new THREE.PlaneGeometry(0.1, 1);
      const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      line.rotation.x = -Math.PI / 2;
      line.position.set(i * 2.5 - 25, 0.03, 0);
      scene.add(line);

      const line2 = line.clone();
      line2.rotation.z = Math.PI / 2;
      line2.position.set(0, 0.03, i * 2.5 - 25);
      scene.add(line2);
    }

    for (let i = 0; i < 15; i++) {
      const x = (Math.random() - 0.5) * 40;
      const z = (Math.random() - 0.5) * 40;
      const distance = Math.sqrt(x * x + z * z);
      
      if (distance < 8 || distance > 22) continue;

      const lampHeight = 3;
      const poleGeometry = new THREE.CylinderGeometry(0.08, 0.1, lampHeight, 8);
      const poleMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4a5568,
        roughness: 0.6,
        metalness: 0.8
      });
      const pole = new THREE.Mesh(poleGeometry, poleMaterial);
      pole.position.set(x, lampHeight / 2, z);
      pole.castShadow = true;
      scene.add(pole);

      const lightGeometry = new THREE.SphereGeometry(0.15, 16, 16);
      const lightMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xfbbf24,
        emissive: 0xfbbf24,
        emissiveIntensity: 2
      });
      const lightBulb = new THREE.Mesh(lightGeometry, lightMaterial);
      lightBulb.position.set(x, lampHeight, z);
      scene.add(lightBulb);

      const streetLight = new THREE.PointLight(0xfbbf24, 1, 8);
      streetLight.position.set(x, lampHeight, z);
      streetLight.castShadow = true;
      scene.add(streetLight);
    }

    for (let i = 0; i < 30; i++) {
      const x = (Math.random() - 0.5) * 45;
      const z = (Math.random() - 0.5) * 45;
      const distance = Math.sqrt(x * x + z * z);
      
      if (distance < 15) continue;

      const treeHeight = 1.5 + Math.random() * 1;
      const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.15, treeHeight * 0.3, 8);
      const trunkMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x3d2817,
        roughness: 0.9
      });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.set(x, treeHeight * 0.15, z);
      trunk.castShadow = true;
      scene.add(trunk);

      const foliageGeometry = new THREE.SphereGeometry(0.5, 8, 8);
      const foliageMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1e3a2e,
        roughness: 0.8
      });
      const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
      foliage.position.set(x, treeHeight * 0.3 + 0.4, z);
      foliage.castShadow = true;
      scene.add(foliage);
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
            mat.emissiveIntensity = 0.8 + Math.sin(time * 2 + child.position.y) * 0.2;
          }
        });
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

    const baseHeight = 0.5;
    const floorHeight = 0.8;
    const floors = Math.min(Math.floor(habit.streak / 2) + 1, 20);
    const totalHeight = baseHeight + floors * floorHeight;
    const width = 1.5 + Math.min(habit.streak * 0.05, 1);
    const depth = 1.5 + Math.min(habit.streak * 0.05, 1);
    const color = new THREE.Color(habit.color);

    const buildingGeometry = new THREE.BoxGeometry(width, totalHeight, depth);
    const buildingMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2d3561,
      roughness: 0.7,
      metalness: 0.3
    });
    const buildingMesh = new THREE.Mesh(buildingGeometry, buildingMaterial);
    buildingMesh.position.y = totalHeight / 2;
    buildingMesh.castShadow = true;
    buildingMesh.receiveShadow = true;
    building.add(buildingMesh);

    const windowSize = 0.15;
    const windowSpacing = 0.3;
    const windowsPerFloor = Math.floor(width / windowSpacing);
    
    for (let floor = 0; floor < floors; floor++) {
      const floorY = baseHeight + floor * floorHeight + floorHeight / 2;
      
      for (let w = 0; w < windowsPerFloor; w++) {
        const windowX = (w - windowsPerFloor / 2) * windowSpacing + windowSpacing / 2;
        
        [1, -1].forEach((side) => {
          const windowGeometry = new THREE.PlaneGeometry(windowSize, windowSize);
          const windowMaterial = new THREE.MeshStandardMaterial({ 
            color: color,
            emissive: color,
            emissiveIntensity: 1,
            transparent: true,
            opacity: 0.9
          });
          const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
          window1.position.set(windowX, floorY, side * (depth / 2 + 0.01));
          window1.userData.isWindow = true;
          building.add(window1);

          const window2 = window1.clone();
          window2.rotation.y = Math.PI / 2;
          window2.position.set(side * (width / 2 + 0.01), floorY, windowX);
          window2.userData.isWindow = true;
          building.add(window2);
        });
      }
    }

    if (habit.streak >= 10) {
      const roofGeometry = new THREE.ConeGeometry(width * 0.7, 1, 4);
      const roofMaterial = new THREE.MeshStandardMaterial({ 
        color: color,
        emissive: color,
        emissiveIntensity: 0.5,
        roughness: 0.5,
        metalness: 0.5
      });
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.y = totalHeight + 0.5;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      building.add(roof);

      const beaconLight = new THREE.PointLight(color.getHex(), 2, 10);
      beaconLight.position.y = totalHeight + 1;
      building.add(beaconLight);
    }

    if (habit.streak >= 20) {
      const particleCount = 50;
      const particlesGeometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * width * 2;
        positions[i * 3 + 1] = totalHeight + Math.random() * 2;
        positions[i * 3 + 2] = (Math.random() - 0.5) * depth * 2;
      }
      
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particlesMaterial = new THREE.PointsMaterial({
        color: color,
        size: 0.15,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });
      const particles = new THREE.Points(particlesGeometry, particlesMaterial);
      building.add(particles);
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

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
    scene.background = new THREE.Color(0xb8d4e8);
    scene.fog = new THREE.Fog(0xb8d4e8, 30, 100);
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
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(dimensions.width, dimensions.height - 200);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xfff8e1, 1.2);
    directionalLight.position.set(40, 60, 30);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 150;
    directionalLight.shadow.camera.left = -60;
    directionalLight.shadow.camera.right = 60;
    directionalLight.shadow.camera.top = 60;
    directionalLight.shadow.camera.bottom = -60;
    directionalLight.shadow.bias = -0.001;
    scene.add(directionalLight);

    const skyLight = new THREE.HemisphereLight(0xb8d4e8, 0xd4c4a8, 0.6);
    scene.add(skyLight);

    const groundSize = 80;
    const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xd4c4a8,
      roughness: 0.95,
      metalness: 0.0,
      flatShading: true
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const roadWidth = 3;
    const roadMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8a8a8a,
      roughness: 0.9,
      metalness: 0.0,
      flatShading: true
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

    const lineGeometry = new THREE.PlaneGeometry(0.15, 1.5);
    const lineMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.9
    });
    
    for (let i = 0; i < 20; i++) {
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      line.rotation.x = -Math.PI / 2;
      line.position.set(i * 3 - 30, 0.04, 0);
      scene.add(line);

      const line2 = new THREE.Mesh(lineGeometry, lineMaterial);
      line2.rotation.z = Math.PI / 2;
      line2.position.set(0, 0.04, i * 3 - 30);
      scene.add(line2);
    }



    const trunkGeometry = new THREE.CylinderGeometry(0.15, 0.2, 1.2, 6);
    const trunkMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x5d4e37,
      roughness: 1.0,
      metalness: 0.0,
      flatShading: true
    });
    
    const foliageColors = [0x2d5016, 0x3a6b1f, 0x4a7c2f, 0x2a5814];
    const foliageMaterials = foliageColors.map(color => new THREE.MeshStandardMaterial({ 
      color,
      roughness: 1.0,
      metalness: 0.0,
      flatShading: true
    }));
    
    for (let i = 0; i < 40; i++) {
      const x = (Math.random() - 0.5) * 70;
      const z = (Math.random() - 0.5) * 70;
      const distance = Math.sqrt(x * x + z * z);
      
      if (distance < 20) continue;

      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.set(x, 0.6, z);
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      scene.add(trunk);

      const foliageMaterial = foliageMaterials[i % 4];
      
      const coneGeometry1 = new THREE.ConeGeometry(0.8, 1.8, 6);
      const cone1 = new THREE.Mesh(coneGeometry1, foliageMaterial);
      cone1.position.set(x, 1.8, z);
      cone1.castShadow = true;
      cone1.receiveShadow = true;
      scene.add(cone1);

      const coneGeometry2 = new THREE.ConeGeometry(0.65, 1.4, 6);
      const cone2 = new THREE.Mesh(coneGeometry2, foliageMaterial);
      cone2.position.set(x, 2.6, z);
      cone2.castShadow = true;
      cone2.receiveShadow = true;
      scene.add(cone2);

      const coneGeometry3 = new THREE.ConeGeometry(0.45, 1.0, 6);
      const cone3 = new THREE.Mesh(coneGeometry3, foliageMaterial);
      cone3.position.set(x, 3.3, z);
      cone3.castShadow = true;
      cone3.receiveShadow = true;
      scene.add(cone3);
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

      const radius = 30;
      camera.position.x = Math.sin(time * 0.25) * radius;
      camera.position.z = Math.cos(time * 0.25) * radius;
      camera.position.y = 20 + Math.sin(time * 0.15) * 4;
      camera.lookAt(0, 5, 0);



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
      
      if (!existingBuilding) {
        const building = createBuilding(habit, index, habits.length);
        scene.add(building);
        buildingsRef.current.set(habit.id, building);
      }
    });
  }, [habits]);

  const sharedMaterialsRef = useRef<{
    buildingMaterial: THREE.MeshStandardMaterial;
    baseMaterial: THREE.MeshStandardMaterial;
    antennaMaterial: THREE.MeshStandardMaterial;
    helipadMaterial: THREE.MeshStandardMaterial;
    windowGeometry: THREE.PlaneGeometry;
    windowMaterials: Map<string, THREE.MeshBasicMaterial>;
    beaconMaterials: Map<string, THREE.MeshBasicMaterial>;
    edgeMaterials: Map<string, THREE.LineBasicMaterial>;
    hCircleMaterials: Map<string, THREE.MeshBasicMaterial>;
    particleMaterials: Map<string, THREE.PointsMaterial>;
  } | null>(null);

  const createBuilding = (
    habit: { id: string; name: string; color: string; streak: number },
    index: number,
    total: number
  ): THREE.Group => {
    const building = new THREE.Group();
    building.userData.habitId = habit.id;

    if (!sharedMaterialsRef.current) {
      sharedMaterialsRef.current = {
        buildingMaterial: new THREE.MeshStandardMaterial({ 
          color: 0xe8e8e8,
          roughness: 0.9,
          metalness: 0.0,
          flatShading: true
        }),
        baseMaterial: new THREE.MeshStandardMaterial({ 
          color: 0xc0c0c0,
          roughness: 0.9,
          metalness: 0.0,
          flatShading: true
        }),
        antennaMaterial: new THREE.MeshStandardMaterial({ 
          color: 0x808080,
          roughness: 0.8,
          metalness: 0.2,
          flatShading: true
        }),
        helipadMaterial: new THREE.MeshStandardMaterial({ 
          color: 0xa0a0a0,
          roughness: 0.9,
          metalness: 0.0,
          flatShading: true
        }),
        windowGeometry: new THREE.PlaneGeometry(0.18, 0.18 * 1.2),
        windowMaterials: new Map(),
        beaconMaterials: new Map(),
        edgeMaterials: new Map(),
        hCircleMaterials: new Map(),
        particleMaterials: new Map()
      };
    }

    const gridSize = Math.ceil(Math.sqrt(total));
    const spacing = 5;
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const offsetX = (gridSize - 1) * spacing / 2;
    const offsetZ = (gridSize - 1) * spacing / 2;
    
    building.position.x = col * spacing - offsetX;
    building.position.z = row * spacing - offsetZ;

    const baseHeight = 0.8;
    const floorHeight = 1.2;
    const floors = Math.min(Math.floor(habit.streak / 2) + 1, 25);
    const totalHeight = baseHeight + floors * floorHeight;
    const width = 2.0 + Math.min(habit.streak * 0.05, 1.0);
    const depth = 2.0 + Math.min(habit.streak * 0.05, 1.0);
    const color = new THREE.Color(habit.color);

    const buildingGeometry = new THREE.BoxGeometry(width, totalHeight, depth);
    const buildingMesh = new THREE.Mesh(buildingGeometry, sharedMaterialsRef.current.buildingMaterial);
    buildingMesh.position.y = totalHeight / 2;
    buildingMesh.castShadow = true;
    buildingMesh.receiveShadow = true;
    building.add(buildingMesh);

    const colorHex = color.getHex();
    const colorKey = colorHex.toString();
    
    if (!sharedMaterialsRef.current.edgeMaterials.has(colorKey)) {
      sharedMaterialsRef.current.edgeMaterials.set(colorKey, new THREE.LineBasicMaterial({ 
        color: colorHex,
        transparent: true,
        opacity: 0.9,
        linewidth: 2
      }));
    }
    const edgeMaterial = sharedMaterialsRef.current.edgeMaterials.get(colorKey)!;
    
    const edgeGeometry = new THREE.EdgesGeometry(buildingGeometry);
    const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    edges.position.y = totalHeight / 2;
    building.add(edges);

    const baseGeometry = new THREE.BoxGeometry(width + 0.2, baseHeight, depth + 0.2);
    const base = new THREE.Mesh(baseGeometry, sharedMaterialsRef.current.baseMaterial);
    base.position.y = baseHeight / 2;
    base.castShadow = true;
    base.receiveShadow = true;
    building.add(base);

    if (!sharedMaterialsRef.current.windowMaterials.has(colorKey)) {
      sharedMaterialsRef.current.windowMaterials.set(colorKey, new THREE.MeshBasicMaterial({ 
        color: color,
        transparent: true,
        opacity: 0.9
      }));
    }
    const windowMaterial = sharedMaterialsRef.current.windowMaterials.get(colorKey)!;
    
    const windowSpacing = 0.5;
    const windowsPerFloor = Math.max(2, Math.floor(width / windowSpacing));
    
    for (let floor = 0; floor < floors; floor++) {
      const floorY = baseHeight + floor * floorHeight + floorHeight / 2;
      
      for (let w = 0; w < windowsPerFloor; w++) {
        const windowX = (w - windowsPerFloor / 2) * windowSpacing + windowSpacing / 2;
        
        [1, -1].forEach((side) => {
          const window1 = new THREE.Mesh(sharedMaterialsRef.current!.windowGeometry, windowMaterial);
          window1.position.set(windowX, floorY, side * (depth / 2 + 0.01));
          window1.userData.isWindow = true;
          building.add(window1);

          const window2 = new THREE.Mesh(sharedMaterialsRef.current!.windowGeometry, windowMaterial);
          window2.rotation.y = Math.PI / 2;
          window2.position.set(side * (width / 2 + 0.01), floorY, windowX);
          window2.userData.isWindow = true;
          building.add(window2);
        });
      }
    }

    if (habit.streak >= 10) {
      const antennaHeight = 2.0;
      const antennaGeometry = new THREE.CylinderGeometry(0.05, 0.08, antennaHeight, 6);
      const antenna = new THREE.Mesh(antennaGeometry, sharedMaterialsRef.current.antennaMaterial);
      antenna.position.y = totalHeight + antennaHeight / 2;
      antenna.castShadow = true;
      building.add(antenna);

      if (!sharedMaterialsRef.current.beaconMaterials.has(colorKey)) {
        sharedMaterialsRef.current.beaconMaterials.set(colorKey, new THREE.MeshBasicMaterial({ 
          color: color,
          transparent: false,
          opacity: 1
        }));
      }
      const beaconMaterial = sharedMaterialsRef.current.beaconMaterials.get(colorKey)!;
      
      const beaconGeometry = new THREE.SphereGeometry(0.2, 8, 8);
      const beacon = new THREE.Mesh(beaconGeometry, beaconMaterial);
      beacon.position.y = totalHeight + antennaHeight;
      beacon.castShadow = true;
      building.add(beacon);
    }

    if (habit.streak >= 15) {
      const helipadsGeometry = new THREE.CylinderGeometry(width * 0.45, width * 0.45, 0.15, 8);
      const helipad = new THREE.Mesh(helipadsGeometry, sharedMaterialsRef.current.helipadMaterial);
      helipad.position.y = totalHeight + 0.075;
      helipad.castShadow = true;
      building.add(helipad);

      if (!sharedMaterialsRef.current.hCircleMaterials.has(colorKey)) {
        sharedMaterialsRef.current.hCircleMaterials.set(colorKey, new THREE.MeshBasicMaterial({ 
          color: color
        }));
      }
      const hCircleMaterial = sharedMaterialsRef.current.hCircleMaterials.get(colorKey)!;
      
      const hCircleGeometry = new THREE.TorusGeometry(width * 0.3, 0.04, 4, 12);
      const hCircle = new THREE.Mesh(hCircleGeometry, hCircleMaterial);
      hCircle.position.y = totalHeight + 0.16;
      hCircle.rotation.x = Math.PI / 2;
      building.add(hCircle);
    }

    if (habit.streak >= 20) {
      const spireHeight = 2.5;
      const spireGeometry = new THREE.ConeGeometry(width * 0.3, spireHeight, 4);
      if (!sharedMaterialsRef.current.beaconMaterials.has(colorKey)) {
        sharedMaterialsRef.current.beaconMaterials.set(colorKey, new THREE.MeshBasicMaterial({ 
          color: color,
          transparent: false,
          opacity: 1
        }));
      }
      const spireMaterial = sharedMaterialsRef.current.beaconMaterials.get(colorKey)!;
      const spire = new THREE.Mesh(spireGeometry, spireMaterial);
      spire.position.y = totalHeight + spireHeight / 2;
      spire.castShadow = true;
      building.add(spire);

      const flagPoleGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1.5, 6);
      const flagPole = new THREE.Mesh(flagPoleGeometry, sharedMaterialsRef.current.antennaMaterial);
      flagPole.position.y = totalHeight + spireHeight + 0.75;
      flagPole.castShadow = true;
      building.add(flagPole);
    }

    return building;
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

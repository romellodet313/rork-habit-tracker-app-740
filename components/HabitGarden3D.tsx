import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';
import * as THREE from 'three';

interface HabitGarden3DProps {
  habits: Array<{
    id: string;
    name: string;
    color: string;
    streak: number;
  }>;
  onHabitClick?: (habitId: string) => void;
}

export function HabitGarden3D({ habits, onHabitClick }: HabitGarden3DProps) {
  const containerRef = useRef<View>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const plantsRef = useRef<Map<string, THREE.Group>>(new Map());
  const animationFrameRef = useRef<number | null>(null);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

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

    const canvas = document.createElement('canvas');
    canvasRef.current = canvas;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 20, 60);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      dimensions.width / (dimensions.height - 200),
      0.1,
      1000
    );
    camera.position.set(0, 8, 12);
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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xfff4e6, 1.2);
    directionalLight.position.set(10, 15, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);

    const soilGeometry = new THREE.CircleGeometry(12, 64);
    const soilMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4a3520,
      roughness: 1.0,
      metalness: 0.0
    });
    const soil = new THREE.Mesh(soilGeometry, soilMaterial);
    soil.rotation.x = -Math.PI / 2;
    soil.receiveShadow = true;
    scene.add(soil);

    const grassGeometry = new THREE.CircleGeometry(20, 64);
    const grassMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4a7c3e,
      roughness: 0.9,
      metalness: 0.0
    });
    const grass = new THREE.Mesh(grassGeometry, grassMaterial);
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = -0.01;
    grass.receiveShadow = true;
    scene.add(grass);

    const fenceRadius = 13;
    const fencePostCount = 24;
    for (let i = 0; i < fencePostCount; i++) {
      const angle = (i / fencePostCount) * Math.PI * 2;
      const x = Math.cos(angle) * fenceRadius;
      const z = Math.sin(angle) * fenceRadius;

      const postGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1.5, 8);
      const postMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8b6f47,
        roughness: 0.9
      });
      const post = new THREE.Mesh(postGeometry, postMaterial);
      post.position.set(x, 0.75, z);
      post.castShadow = true;
      post.receiveShadow = true;
      scene.add(post);

      const nextAngle = ((i + 1) / fencePostCount) * Math.PI * 2;
      const nextX = Math.cos(nextAngle) * fenceRadius;
      const nextZ = Math.sin(nextAngle) * fenceRadius;

      const railGeometry = new THREE.CylinderGeometry(0.04, 0.04, 
        Math.sqrt((nextX - x) ** 2 + (nextZ - z) ** 2), 8);
      const railMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8b6f47,
        roughness: 0.9
      });
      const rail = new THREE.Mesh(railGeometry, railMaterial);
      rail.position.set((x + nextX) / 2, 0.9, (z + nextZ) / 2);
      rail.rotation.z = Math.PI / 2;
      rail.rotation.y = -angle - Math.PI / fencePostCount;
      rail.castShadow = true;
      scene.add(rail);

      const lowerRail = rail.clone();
      lowerRail.position.y = 0.5;
      scene.add(lowerRail);
    }

    const pathSegments = 32;
    for (let i = 0; i < pathSegments; i++) {
      const angle = (i / pathSegments) * Math.PI * 2;
      const radius = 11.5;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const stoneGeometry = new THREE.CylinderGeometry(
        0.15 + Math.random() * 0.1, 
        0.15 + Math.random() * 0.1, 
        0.05, 
        6
      );
      const stoneMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x9ca3af,
        roughness: 0.8
      });
      const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
      stone.position.set(x, 0.025, z);
      stone.rotation.x = -Math.PI / 2;
      stone.rotation.z = Math.random() * Math.PI;
      stone.receiveShadow = true;
      scene.add(stone);
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
      time += 0.01;

      camera.position.x = Math.sin(time * 0.1) * 12;
      camera.position.z = Math.cos(time * 0.1) * 12;
      camera.lookAt(0, 2, 0);

      plantsRef.current.forEach((plant) => {
        plant.children.forEach((child, index) => {
          if (child instanceof THREE.Mesh) {
            child.rotation.y = Math.sin(time + index * 0.5) * 0.1;
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
  }, [dimensions, onHabitClick]);

  useEffect(() => {
    if (!sceneRef.current || Platform.OS !== 'web') return;

    const scene = sceneRef.current;
    const currentPlantIds = new Set(habits.map(h => h.id));
    
    plantsRef.current.forEach((plant, id) => {
      if (!currentPlantIds.has(id)) {
        scene.remove(plant);
        plantsRef.current.delete(id);
      }
    });

    habits.forEach((habit, index) => {
      const existingPlant = plantsRef.current.get(habit.id);
      
      if (existingPlant) {
        updatePlant(existingPlant, habit);
      } else {
        const plant = createPlant(habit, index, habits.length);
        scene.add(plant);
        plantsRef.current.set(habit.id, plant);
      }
    });
  }, [habits]);

  const createPlant = (
    habit: { id: string; name: string; color: string; streak: number },
    index: number,
    total: number
  ): THREE.Group => {
    const plant = new THREE.Group();
    plant.userData.habitId = habit.id;

    const angle = (index / total) * Math.PI * 2;
    const radius = Math.min(5 + total * 0.3, 10);
    plant.position.x = Math.cos(angle) * radius;
    plant.position.z = Math.sin(angle) * radius;

    const height = Math.max(0.5, Math.min(habit.streak * 0.15, 6));
    const color = new THREE.Color(habit.color);

    const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.15, height * 0.4, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4a3728,
      roughness: 0.9
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = height * 0.2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    plant.add(trunk);

    const foliageLevels = Math.min(Math.floor(habit.streak / 3) + 1, 5);
    for (let i = 0; i < foliageLevels; i++) {
      const levelHeight = height * 0.4 + i * 0.6;
      const size = (1 - i * 0.15) * (0.5 + habit.streak * 0.05);
      
      const foliageGeometry = new THREE.SphereGeometry(size, 8, 8);
      const foliageMaterial = new THREE.MeshStandardMaterial({ 
        color: color,
        roughness: 0.7,
        metalness: 0.1,
        emissive: color,
        emissiveIntensity: 0.2
      });
      const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
      foliage.position.y = levelHeight;
      foliage.castShadow = true;
      foliage.receiveShadow = true;
      plant.add(foliage);

      if (habit.streak > 7 && i === foliageLevels - 1) {
        const particleCount = Math.min(habit.streak, 30);
        const particlesGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let j = 0; j < particleCount; j++) {
          positions[j * 3] = (Math.random() - 0.5) * size * 2;
          positions[j * 3 + 1] = Math.random() * 0.5;
          positions[j * 3 + 2] = (Math.random() - 0.5) * size * 2;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particlesMaterial = new THREE.PointsMaterial({
          color: color,
          size: 0.1,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending
        });
        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        particles.position.y = levelHeight;
        plant.add(particles);
      }
    }

    return plant;
  };

  const updatePlant = (
    plant: THREE.Group,
    habit: { id: string; name: string; color: string; streak: number }
  ) => {
    const targetHeight = Math.max(0.5, Math.min(habit.streak * 0.15, 6));
    const color = new THREE.Color(habit.color);

    plant.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry instanceof THREE.CylinderGeometry) {
          const currentHeight = (child.geometry.parameters as any).height;
          const newHeight = targetHeight * 0.4;
          if (Math.abs(currentHeight - newHeight) > 0.1) {
            child.geometry.dispose();
            child.geometry = new THREE.CylinderGeometry(0.1, 0.15, newHeight, 8);
            child.position.y = newHeight / 2;
          }
        } else if (child.geometry instanceof THREE.SphereGeometry) {
          (child.material as THREE.MeshStandardMaterial).color.set(color);
          (child.material as THREE.MeshStandardMaterial).emissive.set(color);
        }
      }
    });
  };

  if (Platform.OS !== 'web') {
    return null;
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
});

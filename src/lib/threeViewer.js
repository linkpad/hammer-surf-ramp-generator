import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

THREE.Object3D.DEFAULT_UP.set(0,0,1);

export class ThreeViewer {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 10000);
    this.renderer = null;
    this.controls = null;
    this.mesh = null;
    this.path3D = null;
    this.pathPoints = [];
    this.pathLine = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.selectedPoint = null;
    this.isDragging = false;
    this.onPointMoved = null;
    this.onPointSelected = null;
    this.sphereGeometry = new THREE.SphereGeometry(12, 16, 16);
    this.hasFittedCamera = false;
    
    this.init();
    this.setupMouseEvents();
  }

  init() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setClearColor(0x2a2a2a);
    this.container.appendChild(this.renderer.domElement);
    
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.camera.position.set(200, 200, 150);
    this.camera.lookAt(0, 0, 0);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 200);
    this.scene.add(directionalLight);
    
    this.gridHelper = new THREE.GridHelper(2000, 40, 0x444444, 0x222222);
    this.gridHelper.rotation.x = Math.PI / 2;
    this.scene.add(this.gridHelper);
    
    this.axesHelper = new THREE.AxesHelper(200);
    this.scene.add(this.axesHelper);
    
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 5000;
    
    this.camera.up.set(0, 0, 1);
    this.controls.update();
    
    this.animate();
  }

  setupMouseEvents() {
    this.renderer.domElement.addEventListener('mousedown', (e) => this.onMouseDown(e));
    this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.renderer.domElement.addEventListener('mouseup', (e) => this.onMouseUp(e));
  }

  onMouseDown(event) {
    if (event.button !== 0) return;
    
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.pathPoints);
    
    if (intersects.length > 0) {
      this.selectedPoint = intersects[0].object;
      this.isDragging = true;
      this.controls.enabled = false;
      
      this.updatePathVisualization();
      
      if (this.onPointSelected) {
        this.onPointSelected(this.selectedPoint.userData.index);
      }
      
      event.preventDefault();
    }
  }

  onMouseMove(event) {
    if (this.isDragging && this.selectedPoint) {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      const cameraDirection = new THREE.Vector3();
      this.camera.getWorldDirection(cameraDirection);
      const planeNormal = cameraDirection.normalize();
      const planePoint = this.selectedPoint.position.clone();
      const plane = new THREE.Plane();
      plane.setFromNormalAndCoplanarPoint(planeNormal, planePoint);
      
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersection = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(plane, intersection);
      
      if (intersection) {
        this.selectedPoint.position.copy(intersection);
        
        const pointIndex = this.selectedPoint.userData.index;
        if (this.path3D && pointIndex !== undefined) {
          this.path3D.updateControlPoint(
            pointIndex,
            intersection.x,
            intersection.y,
            intersection.z
          );
          
          if (this.onPointMoved) {
            this.onPointMoved();
          }
        }
        
        this.updatePathVisualization();
      }
    }
  }

  onMouseUp(event) {
    if (this.isDragging) {
      this.isDragging = false;
      this.selectedPoint = null;
      this.controls.enabled = true;
    }
  }

  setOnPointMoved(callback) {
    this.onPointMoved = callback;
  }

  setOnPointSelected(callback) {
    this.onPointSelected = callback;
  }

  updateRamp(geometryData) {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
    }
    
    const { faces } = geometryData;
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    
    if (faces) {
      for (const face of faces) {
          for (const v of face) {
              vertices.push(v[0], v[1], v[2]);
          }
      }
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshLambertMaterial({ 
      color: 0x4a9eff,
      side: THREE.DoubleSide,
      wireframe: false
    });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
    
    if (!this.hasFittedCamera) {
      this.fitCamera();
      this.hasFittedCamera = true;
    }
  }

  updatePathVisualization() {
    this.pathPoints.forEach(point => {
      this.scene.remove(point);
      point.material.dispose();
    });
    this.pathPoints = [];
    
    if (this.pathLine) {
      this.scene.remove(this.pathLine);
      this.pathLine.geometry.dispose();
      this.pathLine.material.dispose();
      this.pathLine = null;
    }
  }

  setSelectedPoint(index) {
    this.pathPoints.forEach((point, i) => {
      if (point.material) {
        point.material.dispose();
      }
      point.material = new THREE.MeshBasicMaterial({ 
        color: i === index ? 0xff6b6b : 0x4a9eff 
      });
    });
  }

  fitCamera() {
    if (!this.mesh) return;
    
    const box = new THREE.Box3().setFromObject(this.mesh);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim === 0) return;
    
    const fov = this.camera.fov * (Math.PI / 180);
    const distance = maxDim / (2 * Math.tan(fov / 2)) * 1.5;
    const offset = distance * 0.7;
    this.camera.position.set(
      center.x + offset,
      center.y + offset,
      center.z + offset
    );
    this.camera.lookAt(center);
    
    if (this.controls) {
      this.controls.target.copy(center);
      this.controls.update();
    }
  }

  setCameraView(view) {
    if (!this.mesh) return;
    
    const box = new THREE.Box3().setFromObject(this.mesh);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    
    switch(view) {
      case 'top':
        this.camera.position.set(center.x, center.y, center.z + maxDim * 2);
        this.camera.lookAt(center);
        if (this.controls) {
          this.controls.target.copy(center);
          this.controls.update();
        }
        break;
      case 'front':
        this.camera.position.set(center.x, center.y + maxDim * 2, center.z);
        this.camera.lookAt(center);
        if (this.controls) {
          this.controls.target.copy(center);
          this.controls.update();
        }
        break;
      case 'side':
        this.camera.position.set(center.x + maxDim * 2, center.y, center.z);
        this.camera.lookAt(center);
        if (this.controls) {
          this.controls.target.copy(center);
          this.controls.update();
        }
        break;
      case 'iso':
        const dist = maxDim * 1.5;
        this.camera.position.set(center.x + dist, center.y + dist, center.z + dist);
        this.camera.lookAt(center);
        if (this.controls) {
          this.controls.target.copy(center);
          this.controls.update();
        }
        break;
    }
  }

  resize(width, height) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    if (this.controls) {
      this.controls.update();
    }
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
    }
    this.renderer.dispose();
  }
}


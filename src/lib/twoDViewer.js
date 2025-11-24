export class TwoDViewer {
  constructor(canvas, viewType) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.viewType = viewType;
    this.geometryData = null;
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.isPanning = false;
    this.lastPanX = 0;
    this.lastPanY = 0;
    this.hasBeenPanned = false;
    
    this.setupCanvas();
    this.setupEventListeners();
  }

  setupCanvas() {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    this.ctx = this.canvas.getContext('2d');
    this.canvas.style.cursor = 'grab';
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
    this.canvas.addEventListener('mouseleave', (e) => this.onMouseUp(e));
    this.canvas.addEventListener('wheel', (e) => this.onWheel(e));
  }

  onMouseDown(e) {
    this.isPanning = true;
    this.lastPanX = e.clientX;
    this.lastPanY = e.clientY;
    this.canvas.style.cursor = 'grabbing';
  }

  onMouseMove(e) {
    if (this.isPanning) {
      const deltaX = e.clientX - this.lastPanX;
      const deltaY = e.clientY - this.lastPanY;
      
      this.offsetX += deltaX;
      this.offsetY += deltaY;
      
      this.lastPanX = e.clientX;
      this.lastPanY = e.clientY;
      this.hasBeenPanned = true;
      
      this.draw();
    }
  }

  onMouseUp(e) {
    if (this.isPanning) {
      this.isPanning = false;
      this.canvas.style.cursor = 'grab';
    }
  }

  onWheel(e) {
    e.preventDefault();
    
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const worldX = (mouseX - this.offsetX) / this.scale;
    const worldY = (mouseY - this.offsetY) / this.scale;
    
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    this.scale *= zoomFactor;
    this.scale = Math.max(0.1, Math.min(10, this.scale));
    
    this.offsetX = mouseX - worldX * this.scale;
    this.offsetY = mouseY - worldY * this.scale;
    this.hasBeenPanned = true;
    
    this.draw();
  }

  updateGeometry(geometryData, fitView = false) {
    this.geometryData = geometryData;
    if (fitView || !this.hasBeenPanned) {
      this.fitView();
    } else {
      this.draw();
    }
  }

  fitView() {
    if (!this.geometryData || !this.geometryData.geometry || !this.geometryData.geometry.solids) return;
    
    const { solids } = this.geometryData.geometry;
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    
    for (const solid of solids) {
        for (const step of solid.vertices) {
            for (const vertex of step) {
                minX = Math.min(minX, vertex[0]);
                maxX = Math.max(maxX, vertex[0]);
                minY = Math.min(minY, vertex[1]);
                maxY = Math.max(maxY, vertex[1]);
                minZ = Math.min(minZ, vertex[2]);
                maxZ = Math.max(maxZ, vertex[2]);
            }
        }
    }
    
    let width, height;
    if (this.viewType === 'top') {
      width = maxX - minX;
      height = maxY - minY;
    } else if (this.viewType === 'front') {
      width = maxX - minX;
      height = maxZ - minZ;
    } else if (this.viewType === 'side') {
      width = maxY - minY;
      height = maxZ - minZ;
    }
    const maxDim = Math.max(width, height);
    
    if (!isFinite(maxDim) || maxDim === 0) return;

    const padding = 20;
    this.scale = Math.min(
      (this.canvas.width - padding * 2) / maxDim,
      (this.canvas.height - padding * 2) / maxDim
    );
    
    if (this.viewType === 'top') {
      this.offsetX = this.canvas.width / 2 - (minX + maxX) / 2 * this.scale;
      this.offsetY = this.canvas.height / 2 + (minY + maxY) / 2 * this.scale;
    } else if (this.viewType === 'front') {
      this.offsetX = this.canvas.width / 2 - (minX + maxX) / 2 * this.scale;
      this.offsetY = this.canvas.height / 2 + (minZ + maxZ) / 2 * this.scale;
    } else if (this.viewType === 'side') {
      this.offsetX = this.canvas.width / 2 - (minY + maxY) / 2 * this.scale;
      this.offsetY = this.canvas.height / 2 + (minZ + maxZ) / 2 * this.scale;
    }
    
    this.draw();
  }

  projectVertex(vertex) {
    const [x, y, z] = vertex;
    let px, py;
    
    switch(this.viewType) {
      case 'top':
        px = x * this.scale + this.offsetX;
        py = -y * this.scale + this.offsetY;
        break;
      case 'front':
        px = x * this.scale + this.offsetX;
        py = -z * this.scale + this.offsetY; 
        break;
      case 'side':
        px = y * this.scale + this.offsetX;
        py = -z * this.scale + this.offsetY;
        break;
    }
    
    return [px, py];
  }

  draw() {
    if (!this.geometryData || !this.geometryData.geometry || !this.geometryData.geometry.solids) return;
    
    const { solids } = this.geometryData.geometry;
    
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.drawGrid();
    
    this.ctx.strokeStyle = '#4a9eff';
    this.ctx.fillStyle = '#4a9eff33';
    this.ctx.lineWidth = 1;
    
    for (const solid of solids) {
        const steps = solid.vertices;
        const numSteps = steps.length;
        if (numSteps === 0) continue;
        
        const pointsPerStep = steps[0].length;
        
        for (let j = 0; j < pointsPerStep; j++) {
            this.ctx.beginPath();
            for (let i = 0; i < numSteps; i++) {
                const [px, py] = this.projectVertex(steps[i][j]);
                if (i === 0) this.ctx.moveTo(px, py);
                else this.ctx.lineTo(px, py);
            }
            this.ctx.stroke();
        }
        
        for (let i = 0; i < numSteps; i++) {
             this.ctx.beginPath();
             for (let j = 0; j < pointsPerStep; j++) {
                 const [px, py] = this.projectVertex(steps[i][j]);
                 if (j === 0) this.ctx.moveTo(px, py);
                 else this.ctx.lineTo(px, py);
             }
             const [px, py] = this.projectVertex(steps[i][0]);
             this.ctx.lineTo(px, py);
             this.ctx.stroke();
        }
    }
  }

  drawGrid() {
    this.ctx.strokeStyle = '#333333';
    this.ctx.lineWidth = 1;
    
    const gridSize = 64;
    const startX = Math.floor(-this.offsetX / this.scale / gridSize) * gridSize;
    const endX = Math.ceil((this.canvas.width - this.offsetX) / this.scale / gridSize) * gridSize;
    const startY = Math.floor(-this.offsetY / this.scale / gridSize) * gridSize;
    const endY = Math.ceil((this.canvas.height - this.offsetY) / this.scale / gridSize) * gridSize;
    
    for (let x = startX; x <= endX; x += gridSize) {
      const px = x * this.scale + this.offsetX;
      this.ctx.beginPath();
      this.ctx.moveTo(px, 0);
      this.ctx.lineTo(px, this.canvas.height);
      this.ctx.stroke();
    }
    
    for (let y = startY; y <= endY; y += gridSize) {
      const py = y * this.scale + this.offsetY;
      this.ctx.beginPath();
      this.ctx.moveTo(0, py);
      this.ctx.lineTo(this.canvas.width, py);
      this.ctx.stroke();
    }
  }

  resize() {
    this.setupCanvas();
    if (this.geometryData) {
      this.fitView();
      this.draw();
    }
  }
}


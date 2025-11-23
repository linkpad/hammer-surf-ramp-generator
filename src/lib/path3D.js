export class Path3D {
  constructor(controlPoints = []) {
    this.controlPoints = controlPoints.length > 0 ? controlPoints : [
      { x: 0, y: 0, z: 0 },
      { x: 512, y: 128, z: 0 }
    ];
  }

  evaluate(t) {
    if (this.controlPoints.length === 0) return { position: [0, 0, 0], tangent: [1, 0, 0] };
    if (this.controlPoints.length === 1) {
      const p = this.controlPoints[0];
      return { position: [p.x, p.y, p.z], tangent: [1, 0, 0] };
    }
    if (this.controlPoints.length === 2) {
      const p0 = this.controlPoints[0];
      const p1 = this.controlPoints[1];
      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      const dz = p1.z - p0.z;
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const tangent = len > 0 ? [dx / len, dy / len, dz / len] : [1, 0, 0];
      
      return {
        position: [
          p0.x + dx * t,
          p0.y + dy * t,
          p0.z + dz * t
        ],
        tangent
      };
    }

    t = Math.max(0, Math.min(1, t));

    const n = this.controlPoints.length - 1;
    const scaledT = t * n;
    const segment = Math.floor(scaledT);
    const localT = scaledT - segment;

    const seg = Math.min(segment, n - 1);
    
    const p0 = this.controlPoints[Math.max(0, seg - 1)];
    const p1 = this.controlPoints[seg];
    const p2 = this.controlPoints[seg + 1];
    const p3 = this.controlPoints[Math.min(this.controlPoints.length - 1, seg + 2)];

    const t2 = localT * localT;
    const t3 = t2 * localT;

    const x = 0.5 * (
      (2 * p1.x) +
      (-p0.x + p2.x) * localT +
      (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
      (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
    );

    const y = 0.5 * (
      (2 * p1.y) +
      (-p0.y + p2.y) * localT +
      (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
      (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
    );

    const z = 0.5 * (
      (2 * p1.z) +
      (-p0.z + p2.z) * localT +
      (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 +
      (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3
    );

    const tx = 0.5 * (
      (-p0.x + p2.x) +
      2 * (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * localT +
      3 * (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t2
    );

    const ty = 0.5 * (
      (-p0.y + p2.y) +
      2 * (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * localT +
      3 * (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t2
    );

    const tz = 0.5 * (
      (-p0.z + p2.z) +
      2 * (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * localT +
      3 * (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t2
    );

    const tlen = Math.sqrt(tx * tx + ty * ty + tz * tz);
    const tangent = tlen > 0 ? [tx / tlen, ty / tlen, tz / tlen] : [1, 0, 0];

    return {
      position: [x, y, z],
      tangent
    };
  }

  addControlPoint(x, y, z) {
    this.controlPoints.push({ x, y, z });
  }

  removeControlPoint(index) {
    if (this.controlPoints.length > 2) {
      this.controlPoints.splice(index, 1);
    }
  }

  updateControlPoint(index, x, y, z) {
    if (index >= 0 && index < this.controlPoints.length) {
      this.controlPoints[index].x = x;
      this.controlPoints[index].y = y;
      this.controlPoints[index].z = z;
    }
  }

  getControlPoints() {
    return this.controlPoints;
  }

  setControlPoints(points) {
    this.controlPoints = points;
  }

  reset() {
    this.controlPoints = [
      { x: 0, y: 0, z: 0 },
      { x: 512, y: 128, z: 0 }
    ];
  }

  getApproximateLength() {
    if (this.controlPoints.length < 2) return 0;
    
    let length = 0;
    for (let i = 0; i < this.controlPoints.length - 1; i++) {
      const p0 = this.controlPoints[i];
      const p1 = this.controlPoints[i + 1];
      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      const dz = p1.z - p0.z;
      length += Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    return length;
  }
}


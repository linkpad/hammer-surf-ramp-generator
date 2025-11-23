export class Spline {
  constructor(controlPoints = []) {
    this.controlPoints = controlPoints.length > 0 ? controlPoints : [
      { x: 0, y: 0 },
      { x: 1, y: 1 }
    ];
  }

  evaluate(t) {
    if (this.controlPoints.length === 0) return 0;
    if (this.controlPoints.length === 1) return this.controlPoints[0].y;
    if (this.controlPoints.length === 2) {
      const p0 = this.controlPoints[0];
      const p1 = this.controlPoints[1];
      return p0.y + (p1.y - p0.y) * t;
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

    return 0.5 * (
      (2 * p1.y) +
      (-p0.y + p2.y) * localT +
      (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
      (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
    );
  }

  addControlPoint(x, y) {
    this.controlPoints.push({ x, y });
    this.sortControlPoints();
  }

  removeControlPoint(index) {
    if (this.controlPoints.length > 2) {
      this.controlPoints.splice(index, 1);
    }
  }

  updateControlPoint(index, x, y) {
    if (index >= 0 && index < this.controlPoints.length) {
      this.controlPoints[index].x = Math.max(0, Math.min(1, x));
      this.controlPoints[index].y = y;
      this.sortControlPoints();
    }
  }

  sortControlPoints() {
    this.controlPoints.sort((a, b) => a.x - b.x);
    
    if (this.controlPoints.length > 0) {
      this.controlPoints[0].x = 0;
      if (this.controlPoints.length > 1) {
        this.controlPoints[this.controlPoints.length - 1].x = 1;
      }
    }
  }

  getControlPoints() {
    return this.controlPoints;
  }

  setControlPoints(points) {
    this.controlPoints = points;
    this.sortControlPoints();
  }

  reset() {
    this.controlPoints = [
      { x: 0, y: 0 },
      { x: 1, y: 1 }
    ];
  }
}


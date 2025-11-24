export function createIdentityMatrix() {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ];
}

export function transformVertex(vertex, matrix) {
  const [x, y, z] = vertex;
  return [
    matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12],
    matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13],
    matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]
  ];
}

export function multiplyMatrices(matrixA, matrixB) {
  const result = new Array(16).fill(0);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      for (let k = 0; k < 4; k++) {
        result[row * 4 + col] += matrixA[row * 4 + k] * matrixB[k * 4 + col];
      }
    }
  }
  return result;
}

export function normalize(vector) {
  const [x, y, z] = vector;
  const length = Math.sqrt(x * x + y * y + z * z);
  return length > 0 ? [x / length, y / length, z / length] : [0, 0, 1];
}

export function cross(vectorA, vectorB) {
  return [
    vectorA[1] * vectorB[2] - vectorA[2] * vectorB[1],
    vectorA[2] * vectorB[0] - vectorA[0] * vectorB[2],
    vectorA[0] * vectorB[1] - vectorA[1] * vectorB[0]
  ];
}

export function transformVector(vector, matrix) {
  const [x, y, z] = vector;
  return [
    matrix[0] * x + matrix[4] * y + matrix[8] * z,
    matrix[1] * x + matrix[5] * y + matrix[9] * z,
    matrix[2] * x + matrix[6] * y + matrix[10] * z
  ];
}

export function createBasisMatrix(position, forward, up) {
  const side = cross(up, forward);
  return [
    forward[0], forward[1], forward[2], 0,
    side[0], side[1], side[2], 0,
    up[0], up[1], up[2], 0,
    position[0], position[1], position[2], 1
  ];
}

export function invertTransformMatrix(matrix) {
  const [r00, r10, r20] = [matrix[0], matrix[1], matrix[2]];
  const [r01, r11, r21] = [matrix[4], matrix[5], matrix[6]];
  const [r02, r12, r22] = [matrix[8], matrix[9], matrix[10]];
  const [tx, ty, tz] = [matrix[12], matrix[13], matrix[14]];

  const newTx = -(r00 * tx + r10 * ty + r20 * tz);
  const newTy = -(r01 * tx + r11 * ty + r21 * tz);
  const newTz = -(r02 * tx + r12 * ty + r22 * tz);

  return [
    r00, r01, r02, 0,
    r10, r11, r12, 0,
    r20, r21, r22, 0,
    newTx, newTy, newTz, 1
  ];
}

export function calculateFaceNormal(vertices) {
  if (vertices.length < 3) return [0, 0, 1];

  const edge1 = [
    vertices[1][0] - vertices[0][0],
    vertices[1][1] - vertices[0][1],
    vertices[1][2] - vertices[0][2]
  ];
  const edge2 = [
    vertices[2][0] - vertices[0][0],
    vertices[2][1] - vertices[0][1],
    vertices[2][2] - vertices[0][2]
  ];

  return normalize(cross(edge1, edge2));
}

export function rotateAroundAxis(point, axis, center, angle) {
  const [px, py, pz] = point;
  const [cx, cy, cz] = center;
  const [ax, ay, az] = axis;

  const relX = px - cx;
  const relY = py - cy;
  const relZ = pz - cz;

  const cosAngle = Math.cos(angle);
  const sinAngle = Math.sin(angle);
  const dotProduct = relX * ax + relY * ay + relZ * az;

  const crossX = relY * az - relZ * ay;
  const crossY = relZ * ax - relX * az;
  const crossZ = relX * ay - relY * ax;

  const rotatedX = relX * cosAngle + crossX * sinAngle + ax * dotProduct * (1 - cosAngle);
  const rotatedY = relY * cosAngle + crossY * sinAngle + ay * dotProduct * (1 - cosAngle);
  const rotatedZ = relZ * cosAngle + crossZ * sinAngle + az * dotProduct * (1 - cosAngle);

  return [rotatedX + cx, rotatedY + cy, rotatedZ + cz];
}

export function getNormal2D(point1, point2) {
  const dy = point2[1] - point1[1];
  const dz = point2[2] - point1[2];
  const length = Math.sqrt(dy * dy + dz * dz);
  if (length === 0) return [0, 0];
  return [-dz / length, dy / length];
}

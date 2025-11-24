const TEXTURE_SIZE = 1024.0;

export function calculateFaceUV(vertex1, vertex2, vertex3, vertex4, uvScale, textureOffset = 0) {
  const midStart = getMidpoint(vertex1, vertex2);
  const midEnd = getMidpoint(vertex4, vertex3);

  const uAxis = normalizeVector(subtractVectors(midEnd, midStart));
  const faceNormal = calculateNormal(vertex4, vertex3, vertex2);
  const vAxis = calculateVAxis(faceNormal, uAxis, vertex1, vertex2, vertex3, vertex4);

  const uLength = vectorLength(subtractVectors(midEnd, midStart));
  const shiftU = calculateShiftU(midStart, uAxis, uvScale, textureOffset);
  const shiftV = calculateShiftV(vertex1, vAxis, uvScale);

  return {
    uaxis: formatAxis(uAxis, shiftU, uvScale),
    vaxis: formatAxis(vAxis, shiftV, uvScale),
    uLength
  };
}

function getMidpoint(point1, point2) {
  return [
    (point1[0] + point2[0]) / 2,
    (point1[1] + point2[1]) / 2,
    (point1[2] + point2[2]) / 2
  ];
}

function subtractVectors(vectorA, vectorB) {
  return [
    vectorA[0] - vectorB[0],
    vectorA[1] - vectorB[1],
    vectorA[2] - vectorB[2]
  ];
}

function vectorLength(vector) {
  return Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1] + vector[2] * vector[2]);
}

function normalizeVector(vector) {
  const length = vectorLength(vector);
  return length > 0 ? [vector[0] / length, vector[1] / length, vector[2] / length] : [1, 0, 0];
}

function crossProduct(vectorA, vectorB) {
  return [
    vectorA[1] * vectorB[2] - vectorA[2] * vectorB[1],
    vectorA[2] * vectorB[0] - vectorA[0] * vectorB[2],
    vectorA[0] * vectorB[1] - vectorA[1] * vectorB[0]
  ];
}

function dotProduct(vectorA, vectorB) {
  return vectorA[0] * vectorB[0] + vectorA[1] * vectorB[1] + vectorA[2] * vectorB[2];
}

function calculateNormal(vertex1, vertex2, vertex3) {
  const edge1 = subtractVectors(vertex2, vertex1);
  const edge2 = subtractVectors(vertex3, vertex1);
  const normal = crossProduct(edge1, edge2);
  const length = vectorLength(normal);
  return length > 0 ? [normal[0] / length, normal[1] / length, normal[2] / length] : [0, 0, 1];
}

function calculateVAxis(normal, uAxis, vertex1, vertex2, vertex3, vertex4) {
  const vCandidate = crossProduct(normal, uAxis);
  const vLength = vectorLength(vCandidate);
  const vAxis = vLength > 0 ? [vCandidate[0] / vLength, vCandidate[1] / vLength, vCandidate[2] / vLength] : [0, 1, 0];

  const edgeDirection = [
    (vertex2[0] + vertex3[0]) - (vertex1[0] + vertex4[0]),
    (vertex2[1] + vertex3[1]) - (vertex1[1] + vertex4[1]),
    (vertex2[2] + vertex3[2]) - (vertex1[2] + vertex4[2])
  ];
  const dotDir = dotProduct(edgeDirection, vAxis);

  if (dotDir < 0) {
    return [-vAxis[0], -vAxis[1], -vAxis[2]];
  }
  return vAxis;
}

function calculateShiftU(midpoint, uAxis, uvScale, textureOffset) {
  const dotU = dotProduct(midpoint, uAxis);
  let shiftU = textureOffset - (dotU / uvScale);
  return wrapTextureCoord(shiftU);
}

function calculateShiftV(vertex, vAxis, uvScale) {
  const dotV = dotProduct(vertex, vAxis);
  let shiftV = 0 - (dotV / uvScale);
  return wrapTextureCoord(shiftV);
}

function wrapTextureCoord(value) {
  return ((value % TEXTURE_SIZE) + TEXTURE_SIZE) % TEXTURE_SIZE;
}

function formatAxis(axis, shift, scale) {
  const format = (n) => Number(n).toFixed(4);
  return `[${format(axis[0])} ${format(axis[1])} ${format(axis[2])} ${format(shift)}] ${scale}`;
}


import { getNormal2D } from './mathUtils.js';

export function generateProfiles(params) {
  const { width, height, surfEnum, styleEnum, thickness } = params;

  const totalWidth = surfEnum === 'Both' ? width * 2 : width;
  const topZ = height;
  const bottomZ = 0;
  const leftY = -totalWidth / 2;
  const rightY = totalWidth / 2;
  const centerY = 0;

  let yOffset = 0;
  if (surfEnum === 'Left') {
    yOffset = -leftY;
  } else if (surfEnum === 'Right') {
    yOffset = -rightY;
  }

  if (styleEnum === 'Wedge') {
    return generateWedgeProfiles(surfEnum, topZ, bottomZ, leftY, rightY, centerY, yOffset);
  }
  return generateThinProfiles(surfEnum, topZ, bottomZ, leftY, rightY, centerY, yOffset, thickness, totalWidth, height);
}

function generateWedgeProfiles(surfEnum, topZ, bottomZ, leftY, rightY, centerY, yOffset) {
  if (surfEnum === 'Both') {
    return [[
      [0, centerY, topZ],
      [0, rightY, bottomZ],
      [0, leftY, bottomZ]
    ]];
  }
  if (surfEnum === 'Left') {
    return [[
      [0, leftY + yOffset, topZ],
      [0, rightY + yOffset, bottomZ],
      [0, leftY + yOffset, bottomZ]
    ]];
  }
  return [[
    [0, rightY + yOffset, topZ],
    [0, rightY + yOffset, bottomZ],
    [0, leftY + yOffset, bottomZ]
  ]];
}

function generateThinProfiles(surfEnum, topZ, bottomZ, leftY, rightY, centerY, yOffset, thickness, totalWidth, height) {
  if (surfEnum === 'Both') {
    return generateThinBothSidesProfiles(topZ, bottomZ, leftY, rightY, centerY, thickness, totalWidth, height);
  }

  if (surfEnum === 'Left') {
    const startPoint = [0, leftY + yOffset, topZ];
    const endPoint = [0, rightY + yOffset, bottomZ];
    return [generateThickenedSegment(startPoint, endPoint, thickness)];
  }

  const startPoint = [0, leftY + yOffset, bottomZ];
  const endPoint = [0, rightY + yOffset, topZ];
  return [generateThickenedSegment(startPoint, endPoint, thickness)];
}

function generateThinBothSidesProfiles(topZ, bottomZ, leftY, rightY, centerY, thickness, totalWidth, height) {
  const peak = [0, centerY, topZ];
  const leftBase = [0, leftY, bottomZ];
  const rightBase = [0, rightY, bottomZ];

  const halfWidth = totalWidth / 2;
  const slopeLength = Math.sqrt(halfWidth * halfWidth + height * height);
  const verticalOffset = halfWidth > 0 ? (thickness * slopeLength) / halfWidth : thickness;

  const innerPeakZ = topZ - verticalOffset;
  const innerPeak = [0, centerY, innerPeakZ];

  const [leftNormalY, leftNormalZ] = getNormal2D(leftBase, peak);
  const leftBaseInner = [0, leftBase[1] - leftNormalY * thickness, leftBase[2] - leftNormalZ * thickness];

  const [rightNormalY, rightNormalZ] = getNormal2D(peak, rightBase);
  const rightBaseInner = [0, rightBase[1] - rightNormalY * thickness, rightBase[2] - rightNormalZ * thickness];

  return [
    [leftBase, peak, innerPeak, leftBaseInner],
    [peak, rightBase, rightBaseInner, innerPeak]
  ];
}

function generateThickenedSegment(startPoint, endPoint, thickness) {
  const [normalY, normalZ] = getNormal2D(startPoint, endPoint);
  const offsetY = normalY * thickness;
  const offsetZ = normalZ * thickness;

  return [
    startPoint,
    endPoint,
    [endPoint[0], endPoint[1] - offsetY, endPoint[2] - offsetZ],
    [startPoint[0], startPoint[1] - offsetY, startPoint[2] - offsetZ]
  ];
}

import { getNormal2D } from './mathUtils.js';

export function generateProfiles(params) {
  const { width, height, surfEnum, styleEnum, thickness, baseHeight = 0, useVerticalBase = false } = params;

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

  const clampedBaseHeight = Math.max(0, Math.min(baseHeight, height - 1));

  if (styleEnum === 'Wedge') {
    return generateWedgeProfiles(surfEnum, topZ, bottomZ, leftY, rightY, centerY, yOffset, clampedBaseHeight);
  }
  return generateThinProfiles(surfEnum, topZ, bottomZ, leftY, rightY, centerY, yOffset, thickness, totalWidth, height, useVerticalBase);
}

function generateWedgeProfiles(surfEnum, topZ, bottomZ, leftY, rightY, centerY, yOffset, baseHeight = 0) {
  if (baseHeight <= 0) {
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

  if (surfEnum === 'Both') {
    const rightCutY = rightY + (centerY - rightY) * (baseHeight / topZ);
    const leftCutY = leftY + (centerY - leftY) * (baseHeight / topZ);
    
    return [[
      [0, centerY, topZ],
      [0, rightCutY, baseHeight],
      [0, rightCutY, bottomZ],
      [0, leftCutY, bottomZ],
      [0, leftCutY, baseHeight]
    ]];
  }
  
  if (surfEnum === 'Left') {
    const peakY = leftY + yOffset;
    const baseY = rightY + yOffset;
    const cutY = baseY + (peakY - baseY) * (baseHeight / topZ);
    
    return [[
      [0, peakY, topZ],
      [0, cutY, baseHeight],
      [0, cutY, bottomZ],
      [0, peakY, bottomZ]
    ]];
  }
  
  const peakY = rightY + yOffset;
  const baseY = leftY + yOffset;
  const cutY = baseY + (peakY - baseY) * (baseHeight / topZ);
  
  return [[
    [0, peakY, topZ],
    [0, peakY, bottomZ],
    [0, cutY, bottomZ],
    [0, cutY, baseHeight]
  ]];
}

function generateThinProfiles(surfEnum, topZ, bottomZ, leftY, rightY, centerY, yOffset, thickness, totalWidth, height, useVerticalBase = false) {
  if (surfEnum === 'Both') {
    return generateThinBothSidesProfiles(topZ, bottomZ, leftY, rightY, centerY, thickness, totalWidth, height, useVerticalBase);
  }

  if (surfEnum === 'Left') {
    const startPoint = [0, leftY + yOffset, topZ];
    const endPoint = [0, rightY + yOffset, bottomZ];
    return [generateThickenedSegment(startPoint, endPoint, thickness, useVerticalBase)];
  }

  const startPoint = [0, leftY + yOffset, bottomZ];
  const endPoint = [0, rightY + yOffset, topZ];
  return [generateThickenedSegment(startPoint, endPoint, thickness, useVerticalBase)];
}

function generateThinBothSidesProfiles(topZ, bottomZ, leftY, rightY, centerY, thickness, totalWidth, height, useVerticalBase = false) {
  const peak = [0, centerY, topZ];
  const leftBase = [0, leftY, bottomZ];
  const rightBase = [0, rightY, bottomZ];

  const halfWidth = totalWidth / 2;
  const slopeLength = Math.sqrt(halfWidth * halfWidth + height * height);
  const verticalOffset = halfWidth > 0 ? (thickness * slopeLength) / halfWidth : thickness;

  const innerPeakZ = topZ - verticalOffset;
  const innerPeak = [0, centerY, innerPeakZ];

  const [leftNormalY, leftNormalZ] = getNormal2D(leftBase, peak);
  const [rightNormalY, rightNormalZ] = getNormal2D(peak, rightBase);

  if (!useVerticalBase) {
    const leftBaseInner = [0, leftBase[1] - leftNormalY * thickness, leftBase[2] - leftNormalZ * thickness];
    const rightBaseInner = [0, rightBase[1] - rightNormalY * thickness, rightBase[2] - rightNormalZ * thickness];

    return [
      [leftBase, peak, innerPeak, leftBaseInner],
      [peak, rightBase, rightBaseInner, innerPeak]
    ];
  }

  const leftBaseInnerOriginal = [0, leftBase[1] - leftNormalY * thickness, leftBase[2] - leftNormalZ * thickness];
  const leftT = (leftY - centerY) / (leftBaseInnerOriginal[1] - centerY);
  const leftCutZ = innerPeakZ + leftT * (leftBaseInnerOriginal[2] - innerPeakZ);
  const leftBaseInner = [0, leftY, leftCutZ];

  const rightBaseInnerOriginal = [0, rightBase[1] - rightNormalY * thickness, rightBase[2] - rightNormalZ * thickness];
  const rightT = (rightY - centerY) / (rightBaseInnerOriginal[1] - centerY);
  const rightCutZ = innerPeakZ + rightT * (rightBaseInnerOriginal[2] - innerPeakZ);
  const rightBaseInner = [0, rightY, rightCutZ];

  return [
    [leftBase, peak, innerPeak, leftBaseInner],
    [peak, rightBase, rightBaseInner, innerPeak]
  ];
}

function generateThickenedSegment(startPoint, endPoint, thickness, useVerticalBase = false) {
  const [normalY, normalZ] = getNormal2D(startPoint, endPoint);
  const offsetY = normalY * thickness;
  const offsetZ = normalZ * thickness;

  const innerStart = [startPoint[0], startPoint[1] - offsetY, startPoint[2] - offsetZ];
  const innerEnd = [endPoint[0], endPoint[1] - offsetY, endPoint[2] - offsetZ];

  if (!useVerticalBase) {
    return [startPoint, endPoint, innerEnd, innerStart];
  }

  const startIsBottom = startPoint[2] < endPoint[2];
  
  if (startIsBottom) {
    const t = (startPoint[1] - innerEnd[1]) / (innerStart[1] - innerEnd[1]);
    const cutZ = innerEnd[2] + t * (innerStart[2] - innerEnd[2]);
    const verticalCutPoint = [0, startPoint[1], cutZ];
    
    return [startPoint, endPoint, innerEnd, verticalCutPoint];
  } else {
    const t = (endPoint[1] - innerStart[1]) / (innerEnd[1] - innerStart[1]);
    const cutZ = innerStart[2] + t * (innerEnd[2] - innerStart[2]);
    const verticalCutPoint = [0, endPoint[1], cutZ];
    
    return [startPoint, endPoint, verticalCutPoint, innerStart];
  }
}

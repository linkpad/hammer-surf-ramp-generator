import { rotateAroundAxis, getNormal2D } from './mathUtils.js';
import { generateProfiles } from './profileGenerator.js';

const RAMP_DIRECTION = {
  HORIZONTAL: ['Left', 'Right'],
  VERTICAL: ['Up', 'Down', 'Dip', 'Arc']
};

export function generateGeometry(params) {
  const { smoothness, angle, size, rampEnum, styleEnum, thickness, surfEnum, height } = params;

  const baseProfiles = generateProfiles(params);
  const angleRad = (angle * Math.PI) / 180;
  const segmentCount = angle === 0 ? 1 : smoothness;

  if (angle === 0) {
    return generateStraightGeometry(baseProfiles, size, styleEnum, surfEnum, rampEnum, thickness);
  }

  const spinConfig = getSpinConfiguration(rampEnum, angleRad, size, height);
  const solids = generateCurvedSolids(baseProfiles, spinConfig, segmentCount);
  const clipSolids = generateClipSolids(params, baseProfiles, spinConfig, segmentCount, solids);

  return {
    solids,
    clipSolids,
    segments: segmentCount,
    styleEnum,
    surfEnum,
    rampEnum,
    thickness,
    angle,
    isLoop: angle === 360
  };
}

function generateStraightGeometry(baseProfiles, size, styleEnum, surfEnum, rampEnum, thickness) {
  const solids = baseProfiles.map(profile => {
    const reversedProfile = [...profile].reverse();
    const startVertices = reversedProfile.map(v => [...v]);
    const endVertices = reversedProfile.map(v => [v[0] + size, v[1], v[2]]);

    return {
      vertices: [startVertices, endVertices],
      brushSegments: [{ start: startVertices, end: endVertices }]
    };
  });

  return {
    solids,
    clipSolids: [],
    segments: 1,
    styleEnum,
    surfEnum,
    rampEnum,
    thickness,
    angle: 0,
    isLoop: false
  };
}

function getSpinConfiguration(rampEnum, angleRad, size, height) {
  const configs = {
    Right: { axis: [0, 0, 1], center: [0, size, 0], angle: angleRad },
    Left: { axis: [0, 0, 1], center: [0, -size, 0], angle: -angleRad },
    Down: { axis: [0, -1, 0], center: [0, 0, -size], angle: -angleRad },
    Arc: { axis: [0, -1, 0], center: [0, 0, -size], angle: -angleRad },
    Up: { axis: [0, -1, 0], center: [0, 0, size + height], angle: angleRad },
    Dip: { axis: [0, -1, 0], center: [0, 0, size + height], angle: angleRad }
  };
  return configs[rampEnum] || configs.Right;
}

function generateCurvedSolids(baseProfiles, spinConfig, segmentCount) {
  const { axis, center, angle: spinAngle } = spinConfig;

  return baseProfiles.map(profile => {
    const allSteps = [];
    for (let step = 0; step <= segmentCount; step++) {
      const progress = step / segmentCount;
      const currentAngle = spinAngle * progress;
      allSteps.push(profile.map(vertex => rotateAroundAxis(vertex, axis, center, currentAngle)));
    }

    const brushSegments = [];
    for (let i = 0; i < segmentCount; i++) {
      brushSegments.push({ start: allSteps[i], end: allSteps[i + 1] });
    }

    return { vertices: allSteps, brushSegments };
  });
}

function generateClipSolids(params, baseProfiles, spinConfig, segmentCount, solids) {
  const { angle, size, rampEnum, styleEnum, surfEnum } = params;
  const { axis, center, angle: spinAngle } = spinConfig;

  let clipProfiles = baseProfiles.map(profile => profile.map(v => [...v]));
  const offsetAmount = 1.0;
  const isHorizontalTurn = RAMP_DIRECTION.HORIZONTAL.includes(rampEnum);

  const applyOffset = (point1, point2, keepPoint1Z = false, keepPoint2Z = false) => {
    const dy = point2[1] - point1[1];
    const dz = point2[2] - point1[2];
    const length = Math.sqrt(dy * dy + dz * dz);
    if (length === 0) return;

    const normalY = -dz / length;
    const normalZ = dy / length;
    const offsetY = normalY * offsetAmount;
    const offsetZ = normalZ * offsetAmount;

    const originalZ1 = point1[2];
    const originalZ2 = point2[2];

    point1[1] += offsetY;
    point1[2] += offsetZ;
    point2[1] += offsetY;
    point2[2] += offsetZ;

    if (keepPoint1Z) point1[2] = originalZ1;
    if (keepPoint2Z) point2[2] = originalZ2;
  };

  if (styleEnum === 'Wedge') {
    if (surfEnum === 'Both') {
      const profile = clipProfiles[0];
      const peak = [...profile[0]];
      const bottomRight = [...profile[1]];
      const bottomLeft = [...profile[2]];
      const bottomCenter = [0, 0, 0];

      const peakL = [...peak];
      const bottomCenterL = [...bottomCenter];
      const bottomLeftL = [...bottomLeft];
      applyOffset(bottomLeftL, peakL, isHorizontalTurn, false);
      const leftProfile = [peakL, bottomCenterL, bottomLeftL];

      const peakR = [...peak];
      const bottomRightR = [...bottomRight];
      const bottomCenterR = [...bottomCenter];
      applyOffset(peakR, bottomRightR, false, isHorizontalTurn);
      const rightProfile = [peakR, bottomRightR, bottomCenterR];

      clipProfiles = [leftProfile, rightProfile];
    } else if (surfEnum === 'Left') {
      applyOffset(clipProfiles[0][0], clipProfiles[0][1], false, isHorizontalTurn);
    } else {
      applyOffset(clipProfiles[0][2], clipProfiles[0][0], isHorizontalTurn, false);
    }
  } else {
    if (surfEnum === 'Both') {
      applyOffset(clipProfiles[0][0], clipProfiles[0][1], false, isHorizontalTurn);
      applyOffset(clipProfiles[1][0], clipProfiles[1][1], false, isHorizontalTurn);
    } else {
      applyOffset(clipProfiles[0][0], clipProfiles[0][1], false, isHorizontalTurn);
    }
  }

  const stepAngle = spinAngle / segmentCount;
  const isLoop = Math.abs(angle) >= 360;
  const overlapAngle = calculateOverlapAngle(size, stepAngle, isLoop);

  const clipSolids = clipProfiles.map(profile => {
    const isInward = isProfileInward(profile, rampEnum, surfEnum);
    const segments = generateClipSegments(profile, axis, center, stepAngle, segmentCount, overlapAngle, isInward, isLoop);
    return { brushSegments: segments };
  });

  if ((rampEnum === 'Arc' || rampEnum === 'Dip') && angle !== 0) {
    applyArcDipTransform(clipSolids, solids, params, segmentCount, angle);
  }

  return clipSolids;
}

function calculateOverlapAngle(size, stepAngle, isLoop) {
  const targetOverlapUnits = 4.0;
  const safeRadius = Math.max(size, 64);
  const radiusBasedOverlap = targetOverlapUnits / safeRadius;

  if (isLoop) {
    return Math.abs(stepAngle) * 0.45;
  }
  return Math.min(radiusBasedOverlap, Math.abs(stepAngle) * 0.45);
}

function isProfileInward(profile, rampEnum, surfEnum) {
  if (RAMP_DIRECTION.VERTICAL.includes(rampEnum)) {
    return true;
  }

  if (RAMP_DIRECTION.HORIZONTAL.includes(rampEnum)) {
    if (surfEnum === 'Both') {
      const avgY = profile.reduce((sum, v) => sum + v[1], 0) / profile.length;
      const isLeftSide = avgY < 0;
      return rampEnum === 'Right' ? !isLeftSide : isLeftSide;
    }
    return rampEnum !== surfEnum;
  }

  return false;
}

function generateClipSegments(profile, axis, center, stepAngle, segmentCount, overlapAngle, isInward, isLoop) {
  const segments = [];
  const overlapDirection = Math.sign(stepAngle || 1);
  const signedOverlap = overlapAngle * overlapDirection;

  for (let i = 0; i < segmentCount; i++) {
    let angleStart = i * stepAngle;
    let angleEnd = (i + 1) * stepAngle;

    const isFirst = i === 0;
    const isLast = i === segmentCount - 1;

    if (isInward) {
      if (!isFirst || isLoop) angleStart -= signedOverlap;
      if (!isLast || isLoop) angleEnd += signedOverlap;
    }

    const startVerts = profile.map(v => rotateAroundAxis(v, axis, center, angleStart));
    const endVerts = profile.map(v => rotateAroundAxis(v, axis, center, angleEnd));

    segments.push({ start: startVerts, end: endVerts });
  }

  return segments;
}

function applyArcDipTransform(clipSolids, solids, params, segmentCount, angle) {
  const { rampEnum } = params;
  const angleRad = (angle * Math.PI) / 180;

  const midStep = Math.floor(segmentCount / 2);
  const midVertices = solids[0].vertices[midStep];

  const center = midVertices.reduce(
    (acc, v) => [acc[0] + v[0], acc[1] + v[1], acc[2] + v[2]],
    [0, 0, 0]
  ).map(val => val / midVertices.length);

  const rotationAngle = rampEnum === 'Arc' ? angleRad / 2 : -angleRad / 2;

  for (const solid of clipSolids) {
    for (const segment of solid.brushSegments) {
      for (const vertices of [segment.start, segment.end]) {
        for (const vertex of vertices) {
          vertex[0] -= center[0];
          vertex[1] -= center[1];
          vertex[2] -= center[2];

          const rotated = rotateAroundAxis(vertex, [0, 1, 0], [0, 0, 0], rotationAngle);
          vertex[0] = rotated[0];
          vertex[1] = rotated[1];
          vertex[2] = rotated[2];
        }
      }
    }
  }
}

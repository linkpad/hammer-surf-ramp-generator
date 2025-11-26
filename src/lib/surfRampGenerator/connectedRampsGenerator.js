import { VMFGenerator } from '../vmfGenerator.js';
import { transformVertex, createIdentityMatrix } from './mathUtils.js';
import { calculateConnectionTransform } from './connectionUtils.js';
import { calculateFaceUV } from './uvCalculator.js';

const RAMP_DIRECTION = {
  HORIZONTAL: ['Left', 'Right'],
  VERTICAL: ['Up', 'Down'],
  STRAIGHT: ['Straight']
};

export function generateConnectedRamps(SurfRampGeneratorClass, sharedParams, rampConfigs, connectionMode = 'end') {
  if (!rampConfigs?.length) {
    return { faces: [], ramps: [] };
  }

  const generators = createGenerators(SurfRampGeneratorClass, sharedParams, rampConfigs);
  const transforms = calculateTransforms(generators, connectionMode);
  const capStates = calculateCapStates(generators.length, connectionMode);
  const { allFaces, allSolids, ramps } = buildRampData(generators, transforms, capStates);

  return {
    faces: allFaces,
    ramps,
    generators,
    transforms,
    capStates,
    sharedParams,
    connectionMode,
    combinedGeometry: {
      ...generators[0].generateGeometry(),
      solids: allSolids
    }
  };
}

function createGenerators(SurfRampGeneratorClass, sharedParams, rampConfigs) {
  return rampConfigs.map((config, index) => {
    const params = {
      ...sharedParams,
      rampEnum: config.rampEnum,
      angle: config.angle,
      size: config.size,
      smoothness: config.smoothness ?? sharedParams.smoothness,
      rampName: `${sharedParams.rampName}_${index + 1}`
    };
    return new SurfRampGeneratorClass(params);
  });
}

function calculateTransforms(generators, connectionMode) {
  const transforms = [createIdentityMatrix()];

  for (let i = 1; i < generators.length; i++) {
    const transform = calculateConnectionTransform(
      generators[i - 1],
      generators[i],
      transforms[i - 1],
      connectionMode
    );
    transforms.push(transform);
  }

  return transforms;
}

function calculateCapStates(rampCount, connectionMode) {
  const capStates = Array.from({ length: rampCount }, () => ({
    startConnected: false,
    endConnected: false
  }));

  for (let i = 1; i < rampCount; i++) {
    if (connectionMode === 'start') {
      capStates[i - 1].startConnected = true;
      capStates[i].endConnected = true;
    } else {
      capStates[i - 1].endConnected = true;
      capStates[i].startConnected = true;
    }
  }

  return capStates;
}

function buildRampData(generators, transforms, capStates) {
  const allFaces = [];
  const allSolids = [];
  const ramps = [];

  for (let i = 0; i < generators.length; i++) {
    const generator = generators[i];
    const transform = transforms[i];
    const geometryData = generator.getVisualizationData();
    const rawGeometry = generator.generateGeometry();

    const transformedFaces = geometryData.faces.map(face =>
      face.map(vertex => transformVertex(vertex, transform))
    );
    allFaces.push(...transformedFaces);

    const transformedSolids = rawGeometry.solids.map(solid => ({
      ...solid,
      vertices: solid.vertices.map(step => step.map(vertex => transformVertex(vertex, transform))),
      brushSegments: solid.brushSegments.map(segment => ({
        start: segment.start.map(v => transformVertex(v, transform)),
        end: segment.end.map(v => transformVertex(v, transform))
      }))
    }));
    allSolids.push(...transformedSolids);

    const capMaterials = {
      start: capStates[i].startConnected ? 'TOOLS/TOOLSNODRAW' : generator.params.materialName,
      end: capStates[i].endConnected ? 'TOOLS/TOOLSNODRAW' : generator.params.materialName
    };

    ramps.push({
      generator,
      transform,
      geometry: rawGeometry,
      faces: transformedFaces,
      capMaterials
    });
  }

  return { allFaces, allSolids, ramps };
}

export function generateConnectedVMF(connectedRampsData) {
  const { ramps, generators, transforms, sharedParams, connectionMode = 'end' } = connectedRampsData;

  if (!ramps?.length) return null;

  const vmfGenerator = new VMFGenerator();
  const solidGroups = [];
  const clipGroups = [];

  collectBrushData(ramps, generators, transforms, solidGroups, clipGroups, connectionMode);
  fixClipConnections(clipGroups, connectionMode);
  generateVisualBrushes(vmfGenerator, solidGroups, sharedParams);
  generateClipBrushes(vmfGenerator, clipGroups, sharedParams);

  return vmfGenerator;
}

function collectBrushData(ramps, generators, transforms, solidGroups, clipGroups, connectionMode) {
  for (let rampIdx = 0; rampIdx < ramps.length; rampIdx++) {
    const ramp = ramps[rampIdx];
    const transform = transforms[rampIdx];
    const geometry = ramp.geometry;
    const isFirstRamp = rampIdx === 0;
    const isLastRamp = rampIdx === ramps.length - 1;

    collectSolidSegments(geometry, transform, ramp.capMaterials, solidGroups, isFirstRamp, isLastRamp);
    collectClipSegments(geometry, generators[rampIdx], transform, clipGroups, rampIdx, isFirstRamp, isLastRamp, connectionMode);
  }
}

function collectSolidSegments(geometry, transform, capMaterials, solidGroups, isFirstRamp, isLastRamp) {
  for (let solidIdx = 0; solidIdx < geometry.solids.length; solidIdx++) {
    const solid = geometry.solids[solidIdx];

    if (!solidGroups[solidIdx]) {
      solidGroups[solidIdx] = {
        allSegments: [],
        numPoints: solid.brushSegments[0].start.length,
        isLoop: geometry.isLoop
      };
    }

    for (let segIdx = 0; segIdx < solid.brushSegments.length; segIdx++) {
      const segment = solid.brushSegments[segIdx];
      const isFirstSegment = segIdx === 0;
      const isLastSegment = segIdx === solid.brushSegments.length - 1;

      solidGroups[solidIdx].allSegments.push({
        start: segment.start.map(v => transformVertex(v, transform)),
        end: segment.end.map(v => transformVertex(v, transform)),
        capMaterial: capMaterials,
        isFirstOfRamp: isFirstRamp && isFirstSegment,
        isLastOfRamp: isLastRamp && isLastSegment,
        isLoop: geometry.isLoop
      });
    }
  }
}

function collectClipSegments(geometry, generator, transform, clipGroups, rampIdx, isFirstRamp, isLastRamp, connectionMode) {
  if (!geometry.clipSolids?.length) return;

  const baseProfiles = generator.generateProfiles();

  for (let clipIdx = 0; clipIdx < geometry.clipSolids.length; clipIdx++) {
    const clipSolid = geometry.clipSolids[clipIdx];

    if (!clipGroups[clipIdx]) {
      clipGroups[clipIdx] = {
        allSegments: [],
        rampBoundaries: []
      };
    }

    const rampStartIdx = clipGroups[clipIdx].allSegments.length;
    const isProfileInward = determineProfileInwardness(geometry, generator, baseProfiles, clipIdx);

    for (let segIdx = 0; segIdx < clipSolid.brushSegments.length; segIdx++) {
      const segment = clipSolid.brushSegments[segIdx];
      const isFirstSegment = segIdx === 0;
      const isLastSegment = segIdx === clipSolid.brushSegments.length - 1;

      let isConnectionStart, isConnectionEnd;
      if (connectionMode === 'start') {
        isConnectionStart = isFirstRamp && isFirstSegment;
        isConnectionEnd = !isFirstRamp && isLastSegment;
      } else {
        isConnectionStart = !isFirstRamp && isFirstSegment;
        isConnectionEnd = !isLastRamp && isLastSegment;
      }

      clipGroups[clipIdx].allSegments.push({
        start: segment.start.map(v => transformVertex([...v], transform)),
        end: segment.end.map(v => transformVertex([...v], transform)),
        rampIndex: rampIdx,
        rampEnum: geometry.rampEnum,
        segmentIndexInRamp: segIdx,
        isFirstOfRamp: isFirstRamp && isFirstSegment,
        isLastOfRamp: isLastRamp && isLastSegment,
        isProfileInward,
        isConnectionStart,
        isConnectionEnd
      });
    }

    clipGroups[clipIdx].rampBoundaries.push({
      rampIndex: rampIdx,
      rampEnum: geometry.rampEnum,
      startIdx: rampStartIdx,
      endIdx: clipGroups[clipIdx].allSegments.length - 1,
      isFirstRamp,
      isLastRamp
    });
  }
}

function determineProfileInwardness(geometry, generator, baseProfiles, clipIdx) {
  const { rampEnum } = geometry;
  const { surfEnum } = generator.params;

  if (RAMP_DIRECTION.VERTICAL.includes(rampEnum)) {
    return true;
  }

  if (RAMP_DIRECTION.HORIZONTAL.includes(rampEnum)) {
    if (surfEnum === 'Both') {
      const profile = baseProfiles[clipIdx] || baseProfiles[0];
      const avgY = profile.reduce((sum, v) => sum + v[1], 0) / profile.length;
      const isLeftSide = avgY < 0;
      return rampEnum === 'Right' ? !isLeftSide : isLeftSide;
    }
    return rampEnum !== surfEnum;
  }

  return false;
}

function areRampAxesCompatible(rampEnum1, rampEnum2) {
  const isHorizontal1 = RAMP_DIRECTION.HORIZONTAL.includes(rampEnum1);
  const isHorizontal2 = RAMP_DIRECTION.HORIZONTAL.includes(rampEnum2);
  const isVertical1 = RAMP_DIRECTION.VERTICAL.includes(rampEnum1);
  const isVertical2 = RAMP_DIRECTION.VERTICAL.includes(rampEnum2);
  const isStraight1 = RAMP_DIRECTION.STRAIGHT.includes(rampEnum1) || !rampEnum1;
  const isStraight2 = RAMP_DIRECTION.STRAIGHT.includes(rampEnum2) || !rampEnum2;
  
  if (isStraight1 || isStraight2) return true;
  if (isHorizontal1 && isHorizontal2) return true;
  if (isVertical1 && isVertical2) return true;
  
  return false;
}

function fixClipConnections(clipGroups, connectionMode = 'end') {
  for (const clipGroup of clipGroups) {
    const segments = clipGroup.allSegments;
    const boundaries = clipGroup.rampBoundaries;
    const segmentsToRemove = new Set();

    if (connectionMode === 'start') {
      const firstRampBoundary = boundaries[0];
      const firstRampSegCount = firstRampBoundary.endIdx - firstRampBoundary.startIdx + 1;
      
      const firstRampSegments = [];
      for (let i = firstRampBoundary.startIdx; i <= firstRampBoundary.endIdx; i++) {
        firstRampSegments.push({ segment: segments[i], index: i });
      }
      
      const firstRampFirstSeg = segments[firstRampBoundary.startIdx];
      let firstRampAdjusted = false;
      
      for (let boundaryIdx = 1; boundaryIdx < boundaries.length; boundaryIdx++) {
        const currRampBoundary = boundaries[boundaryIdx];
        const currRampLastSegIdx = currRampBoundary.endIdx;
        const currRampLastSeg = segments[currRampLastSegIdx];
        
        if (!areRampAxesCompatible(firstRampBoundary.rampEnum, currRampBoundary.rampEnum)) {
          continue;
        }
        
        if (firstRampFirstSeg.isProfileInward !== currRampLastSeg.isProfileInward) {
          if (firstRampSegCount === 1) {
            continue;
          }
          
          if (firstRampSegments.length >= 2 && !firstRampAdjusted) {
            const first = firstRampSegments[0];
            const second = firstRampSegments[1];
            
            currRampLastSeg.end = firstRampFirstSeg.isProfileInward
              ? first.segment.end.map(v => [...v])
              : second.segment.start.map(v => [...v]);
            
            segmentsToRemove.add(first.index);
            firstRampAdjusted = true;
          } else if (firstRampAdjusted) {
            const second = firstRampSegments[1];
            currRampLastSeg.end = firstRampFirstSeg.isProfileInward
              ? second.segment.start.map(v => [...v])
              : second.segment.start.map(v => [...v]);
          }
        }
      }
    } else {
      for (let i = 1; i < segments.length; i++) {
        const prevSeg = segments[i - 1];
        const currSeg = segments[i];

        if (currSeg.isConnectionStart && prevSeg.isProfileInward !== currSeg.isProfileInward) {
          if (!areRampAxesCompatible(prevSeg.rampEnum, currSeg.rampEnum)) {
            continue;
          }
          
          const currRampSegments = segments.filter(seg => seg.rampIndex === currSeg.rampIndex);
          if (currRampSegments.length === 1) {
            continue;
          }

          const prevRampSegments = segments
            .slice(0, i)
            .map((seg, idx) => ({ segment: seg, index: idx }))
            .filter(item => item.segment.rampIndex === prevSeg.rampIndex);

          if (prevRampSegments.length >= 2) {
            const secondToLast = prevRampSegments[prevRampSegments.length - 2];
            const last = prevRampSegments[prevRampSegments.length - 1];

            currSeg.start = prevSeg.isProfileInward
              ? last.segment.start.map(v => [...v])
              : secondToLast.segment.end.map(v => [...v]);

            segmentsToRemove.add(last.index);
          }
        }
      }
    }

    const sortedToRemove = Array.from(segmentsToRemove).sort((a, b) => b - a);
    for (const idx of sortedToRemove) {
      segments.splice(idx, 1);
    }
  }
}

function generateVisualBrushes(vmfGenerator, solidGroups, sharedParams) {
  const visualBrushes = [];

  for (const solidGroup of solidGroups) {
    const { allSegments, numPoints, isLoop } = solidGroup;
    const textureOffsets = new Array(numPoints).fill(0);

    for (const segment of allSegments) {
      const sides = generateVisualSegmentSides(vmfGenerator, segment, numPoints, sharedParams, textureOffsets);
      addVisualCapFaces(vmfGenerator, sides, segment, sharedParams, isLoop);
      visualBrushes.push(createVisualBrush(vmfGenerator, sides));
    }
  }

  if (visualBrushes.length > 0) {
    const visualEntity = sharedParams.visualEntity || 'func_brush';
    const entity = {
      id: vmfGenerator.getNextEntityId(),
      classname: visualEntity,
      solids: visualBrushes
    };

    if (visualEntity === 'func_brush') {
      entity.solidity = "1";
    }

    vmfGenerator.entities.push(entity);
  }
}

function generateVisualSegmentSides(vmfGenerator, segment, numPoints, sharedParams, textureOffsets) {
  const sides = [];
  const { start, end } = segment;

  for (let j = 0; j < numPoints; j++) {
    const nextJ = (j + 1) % numPoints;
    const v1 = start[j];
    const v2 = start[nextJ];
    const v3 = end[nextJ];
    const v4 = end[j];

    const { uaxis, vaxis, uLength } = calculateFaceUV(v1, v2, v3, v4, sharedParams.uvScale, textureOffsets[j]);
    textureOffsets[j] += uLength / sharedParams.uvScale;

    sides.push({
      plane: vmfGenerator.formatPlane(v2, v1, v4),
      material: sharedParams.materialName,
      uaxis,
      vaxis,
      vertices: [v4, v3, v2, v1]
    });
  }

  return sides;
}

function addVisualCapFaces(vmfGenerator, sides, segment, sharedParams, globalIsLoop) {
  const { start, end, capMaterial, isFirstOfRamp, isLastOfRamp, isLoop } = segment;
  const effectiveIsLoop = isLoop || globalIsLoop;

  const startMat = (isFirstOfRamp && !effectiveIsLoop) ? capMaterial.start : "TOOLS/TOOLSNODRAW";
  const endMat = (isLastOfRamp && !effectiveIsLoop) ? capMaterial.end : "TOOLS/TOOLSNODRAW";

  sides.push({
    plane: vmfGenerator.formatPlane(start[0], start[1], start[2]),
    material: startMat,
    ...vmfGenerator.calculateUVAxis(start[0], start[1], start[2], sharedParams.uvScale),
    vertices: [...start]
  });

  sides.push({
    plane: vmfGenerator.formatPlane(end[0], end[2], end[1]),
    material: endMat,
    ...vmfGenerator.calculateUVAxis(end[0], end[2], end[1], sharedParams.uvScale),
    vertices: [...end].reverse()
  });
}

function createVisualBrush(vmfGenerator, sides) {
  return {
    id: vmfGenerator.getNextSolidId(),
    sides: sides.map(side => ({
      id: vmfGenerator.getNextSideId(),
      plane: side.plane,
      material: side.material || "nodraw",
      uaxis: side.uaxis || `[1 0 0 0] 0.25`,
      vaxis: side.vaxis || `[0 -1 0 0] 0.25`,
      rotation: "0",
      lightmapscale: "16",
      smoothing_groups: "0",
      vertices: side.vertices
    })),
    editor: { color: "220 220 220", visgroupshown: "1", visgroupautoshown: "1" }
  };
}

function generateClipBrushes(vmfGenerator, clipGroups, sharedParams) {
  for (const clipGroup of clipGroups) {
    const groupId = vmfGenerator.getNextGroupId();

    for (const segment of clipGroup.allSegments) {
      const sides = generateClipSegmentSides(vmfGenerator, segment, sharedParams);
      addClipCapFaces(vmfGenerator, sides, segment, sharedParams);

      const solid = createClipSolid(vmfGenerator, sides, groupId);
      vmfGenerator.world.solids.push(solid);
    }

    vmfGenerator.addGroup(groupId);
  }
}

function generateClipSegmentSides(vmfGenerator, segment, sharedParams) {
  const sides = [];
  const { start, end } = segment;
  const numPoints = start.length;

  for (let j = 0; j < numPoints; j++) {
    const nextJ = (j + 1) % numPoints;
    const v1 = start[j];
    const v2 = start[nextJ];
    const v3 = end[nextJ];
    const v4 = end[j];

    sides.push({
      plane: vmfGenerator.formatPlane(v2, v1, v4),
      material: "tools/toolsplayerclip",
      ...vmfGenerator.calculateUVAxis(v2, v1, v4, sharedParams.uvScale),
      vertices: [v4, v3, v2, v1]
    });
  }

  return sides;
}

function addClipCapFaces(vmfGenerator, sides, segment, sharedParams) {
  const { start, end } = segment;

  sides.push({
    plane: vmfGenerator.formatPlane(start[0], start[1], start[2]),
    material: "tools/toolsplayerclip",
    ...vmfGenerator.calculateUVAxis(start[0], start[1], start[2], sharedParams.uvScale),
    vertices: [...start]
  });

  sides.push({
    plane: vmfGenerator.formatPlane(end[0], end[2], end[1]),
    material: "tools/toolsplayerclip",
    ...vmfGenerator.calculateUVAxis(end[0], end[2], end[1], sharedParams.uvScale),
    vertices: [...end].reverse()
  });
}

function createClipSolid(vmfGenerator, sides, groupId) {
  return {
    id: vmfGenerator.getNextSolidId(),
    sides: sides.map(side => ({
      id: vmfGenerator.getNextSideId(),
      plane: side.plane,
      material: side.material || "tools/toolsplayerclip",
      uaxis: side.uaxis || `[1 0 0 0] 0.25`,
      vaxis: side.vaxis || `[0 -1 0 0] 0.25`,
      rotation: "0",
      lightmapscale: "16",
      smoothing_groups: "0",
      vertices: side.vertices
    })),
    editor: {
      color: "220 30 220",
      visgroupshown: "1",
      visgroupautoshown: "1",
      groupid: String(groupId)
    }
  };
}

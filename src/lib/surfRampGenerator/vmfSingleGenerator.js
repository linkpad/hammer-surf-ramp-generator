import { VMFGenerator } from '../vmfGenerator.js';
import { calculateFaceUV } from './uvCalculator.js';

export function generateVMF(generator, options = {}) {
  const vmfGenerator = new VMFGenerator();
  const geometryData = generator.generateGeometry();
  const { solids, clipSolids, isLoop } = geometryData;

  const defaultCapMaterial = generator.params.materialName;
  const capMaterials = {
    start: options.capMaterials?.start || defaultCapMaterial,
    end: options.capMaterials?.end || defaultCapMaterial
  };

  const visualBrushes = generateVisualBrushes(vmfGenerator, solids, generator.params, capMaterials, isLoop);

  if (visualBrushes.length > 0) {
    vmfGenerator.entities.push({
      id: vmfGenerator.getNextEntityId(),
      classname: "func_detail",
      solids: visualBrushes
    });
  }

  if (clipSolids?.length > 0) {
    generateClipBrushes(vmfGenerator, clipSolids, generator.params);
  }

  return vmfGenerator;
}

function generateVisualBrushes(vmfGenerator, solids, params, capMaterials, isLoop) {
  const brushes = [];

  for (const solid of solids) {
    const numPoints = solid.vertices[0].length;
    const textureOffsets = new Array(numPoints).fill(0);

    for (let segmentIdx = 0; segmentIdx < solid.brushSegments.length; segmentIdx++) {
      const segment = solid.brushSegments[segmentIdx];
      const isFirstSegment = segmentIdx === 0;
      const isLastSegment = segmentIdx === solid.brushSegments.length - 1;

      const sides = generateSegmentSides(vmfGenerator, segment, numPoints, params, textureOffsets);
      addCapFaces(vmfGenerator, sides, segment, params, capMaterials, isFirstSegment, isLastSegment, isLoop);

      brushes.push(createBrush(vmfGenerator, sides));
    }
  }

  return brushes;
}

function generateSegmentSides(vmfGenerator, segment, numPoints, params, textureOffsets) {
  const sides = [];
  const { start, end } = segment;

  for (let vertexIdx = 0; vertexIdx < numPoints; vertexIdx++) {
    const nextIdx = (vertexIdx + 1) % numPoints;

    const v1 = start[vertexIdx];
    const v2 = start[nextIdx];
    const v3 = end[nextIdx];
    const v4 = end[vertexIdx];

    const { uaxis, vaxis, uLength } = calculateFaceUV(v1, v2, v3, v4, params.uvScale, textureOffsets[vertexIdx]);
    textureOffsets[vertexIdx] += uLength / params.uvScale;

    sides.push({
      plane: vmfGenerator.formatPlane(v2, v1, v4),
      material: params.materialName,
      uaxis,
      vaxis,
      vertices: [v4, v3, v2, v1]
    });
  }

  return sides;
}

function addCapFaces(vmfGenerator, sides, segment, params, capMaterials, isFirst, isLast, isLoop) {
  const { start, end } = segment;

  const startMaterial = (isFirst && !isLoop) ? capMaterials.start : "TOOLS/TOOLSNODRAW";
  const endMaterial = (isLast && !isLoop) ? capMaterials.end : "TOOLS/TOOLSNODRAW";

  sides.push({
    plane: vmfGenerator.formatPlane(start[0], start[1], start[2]),
    material: startMaterial,
    ...vmfGenerator.calculateUVAxis(start[0], start[1], start[2], params.uvScale),
    vertices: [...start]
  });

  sides.push({
    plane: vmfGenerator.formatPlane(end[0], end[2], end[1]),
    material: endMaterial,
    ...vmfGenerator.calculateUVAxis(end[0], end[2], end[1], params.uvScale),
    vertices: [...end].reverse()
  });
}

function createBrush(vmfGenerator, sides) {
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

function generateClipBrushes(vmfGenerator, clipSolids, params) {
  for (const clipSolid of clipSolids) {
    const groupId = vmfGenerator.getNextGroupId();
    const numPoints = clipSolid.brushSegments[0].start.length;
    const textureOffsets = new Array(numPoints).fill(0);

    for (let segmentIdx = 0; segmentIdx < clipSolid.brushSegments.length; segmentIdx++) {
      const segment = clipSolid.brushSegments[segmentIdx];
      const isFirst = segmentIdx === 0;
      const isLast = segmentIdx === clipSolid.brushSegments.length - 1;

      const sides = generateClipSegmentSides(vmfGenerator, segment, params, textureOffsets);
      addClipCapFaces(vmfGenerator, sides, segment, params);

      const solid = createClipSolid(vmfGenerator, sides, groupId);
      vmfGenerator.world.solids.push(solid);
    }

    vmfGenerator.addGroup(groupId);
  }
}

function generateClipSegmentSides(vmfGenerator, segment, params, textureOffsets) {
  const sides = [];
  const { start, end } = segment;
  const numPoints = start.length;

  for (let vertexIdx = 0; vertexIdx < numPoints; vertexIdx++) {
    const nextIdx = (vertexIdx + 1) % numPoints;

    const v1 = start[vertexIdx];
    const v2 = start[nextIdx];
    const v3 = end[nextIdx];
    const v4 = end[vertexIdx];

    const { uaxis, vaxis, uLength } = calculateFaceUV(v1, v2, v3, v4, params.uvScale, textureOffsets[vertexIdx]);
    textureOffsets[vertexIdx] += uLength / params.uvScale;

    sides.push({
      plane: vmfGenerator.formatPlane(v2, v1, v4),
      material: "tools/toolsplayerclip",
      uaxis,
      vaxis,
      vertices: [v4, v3, v2, v1]
    });
  }

  return sides;
}

function addClipCapFaces(vmfGenerator, sides, segment, params) {
  const { start, end } = segment;

  sides.push({
    plane: vmfGenerator.formatPlane(start[0], start[1], start[2]),
    material: "tools/toolsplayerclip",
    ...vmfGenerator.calculateUVAxis(start[0], start[1], start[2], params.uvScale),
    vertices: [...start]
  });

  sides.push({
    plane: vmfGenerator.formatPlane(end[0], end[2], end[1]),
    material: "tools/toolsplayerclip",
    ...vmfGenerator.calculateUVAxis(end[0], end[2], end[1], params.uvScale),
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

export function getVisualizationData(generator) {
  const geometryData = generator.generateGeometry();
  const { solids, segments, angle } = geometryData;
  const faces = [];

  for (const solid of solids) {
    const solidVerts = solid.vertices;
    const numPoints = solidVerts[0].length;

    for (let i = 0; i < segments; i++) {
      const currentStep = solidVerts[i];
      const nextStep = solidVerts[i + 1];

      for (let j = 0; j < numPoints; j++) {
        const nextJ = (j + 1) % numPoints;
        faces.push([currentStep[j], currentStep[nextJ], nextStep[j]]);
        faces.push([currentStep[nextJ], nextStep[nextJ], nextStep[j]]);
      }
    }

    if (angle !== 360) {
      addCapFacesToVisualization(faces, solidVerts, numPoints, segments);
    }
  }

  return { faces, geometry: geometryData };
}

function addCapFacesToVisualization(faces, solidVerts, numPoints, segments) {
  const addCap = (stepIndex, flip) => {
    const step = solidVerts[stepIndex];
    for (let j = 1; j < numPoints - 1; j++) {
      if (flip) {
        faces.push([step[0], step[j + 1], step[j]]);
      } else {
        faces.push([step[0], step[j], step[j + 1]]);
      }
    }
  };

  addCap(0, true);
  addCap(segments, false);
}

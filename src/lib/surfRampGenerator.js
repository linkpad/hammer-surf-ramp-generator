import { VMFGenerator } from './vmfGenerator.js';

export class SurfRampGenerator {
  constructor(params = {}) {
    this.params = {
      rampName: params.rampName || 'ramp',
      materialName: params.materialName || 'default',
      styleEnum: params.styleEnum || 'Wedge',
      thickness: params.thickness !== undefined ? params.thickness : 32,
      surfEnum: params.surfEnum || 'Both',
      rampEnum: params.rampEnum || 'Right',
      width: params.width !== undefined ? params.width : 256,
      height: params.height !== undefined ? params.height : 320,
      smoothness: params.smoothness !== undefined ? params.smoothness : 16,
      angle: params.angle !== undefined ? params.angle : 90,
      size: params.size !== undefined ? params.size : 1024,
      uvScale: params.uvScale !== undefined ? params.uvScale : 0.25,
      ...params
    };
  }

  rotateAroundAxis(point, axis, center, angle) {
    const [px, py, pz] = point;
    const [cx, cy, cz] = center;
    const [ax, ay, az] = axis;
    
    const x = px - cx;
    const y = py - cy;
    const z = pz - cz;
    
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dot = x * ax + y * ay + z * az;
    const crossX = y * az - z * ay;
    const crossY = z * ax - x * az;
    const crossZ = x * ay - y * ax;
    
    const rx = x * cos + crossX * sin + ax * dot * (1 - cos);
    const ry = y * cos + crossY * sin + ay * dot * (1 - cos);
    const rz = z * cos + crossZ * sin + az * dot * (1 - cos);
    
    return [rx + cx, ry + cy, rz + cz];
  }

  getNormal2D(p1, p2) {
    const dy = p2[1] - p1[1];
    const dz = p2[2] - p1[2];
    const len = Math.sqrt(dy * dy + dz * dz);
    if (len === 0) return [0, 0];
    return [-dz / len, dy / len];
  }

  generateProfiles() {
    const { width, height, surfEnum, styleEnum, thickness } = this.params;
    
    let w = width;
    if (surfEnum === 'Both') {
      w = width * 2;
    }

    const topZ = height;
    const bottomZ = 0;
    const leftY = -w / 2;
    const rightY = w / 2;
    const centerY = 0;
    
    // For Left/Right surf, anchor at the base corner (right-angle corner)
    let yOffset = 0;
    if (surfEnum === 'Left') {
      yOffset = -leftY; // Shift so leftY becomes 0
    } else if (surfEnum === 'Right') {
      yOffset = -rightY; // Shift so rightY becomes 0
    }

    const profiles = [];

    if (styleEnum === 'Wedge') {
      if (surfEnum === 'Both') {
        profiles.push([
          [0, centerY, topZ],
          [0, rightY, bottomZ],
          [0, leftY, bottomZ]
        ]);
      } else if (surfEnum === 'Left') {
        profiles.push([
          [0, leftY + yOffset, topZ],
          [0, rightY + yOffset, bottomZ],
          [0, leftY + yOffset, bottomZ]
        ]);
      } else {
        profiles.push([
          [0, rightY + yOffset, topZ],
          [0, rightY + yOffset, bottomZ],
          [0, leftY + yOffset, bottomZ]
        ]);
      }
    } else {
      const generateThickenedSegment = (p1, p2) => {
        const [ny, nz] = this.getNormal2D(p1, p2);
        const ty = ny * thickness;
        const tz = nz * thickness;
        
        return [
          p1,
          p2,
          [p2[0], p2[1] - ty, p2[2] - tz],
          [p1[0], p1[1] - ty, p1[2] - tz]
        ];
      };

      if (surfEnum === 'Both') {
        const peak = [0, centerY, topZ];
        const leftBase = [0, leftY, bottomZ];
        const rightBase = [0, rightY, bottomZ];
        
        const halfW = w / 2;
        const L = Math.sqrt(halfW * halfW + height * height);
        const vOff = halfW > 0 ? (thickness * L) / halfW : thickness;
        
        const innerPeakZ = topZ - vOff;
        const innerPeak = [0, centerY, innerPeakZ];

        const [nly, nlz] = this.getNormal2D(leftBase, peak);
        const leftBaseInner = [
            0, 
            leftBase[1] - nly * thickness, 
            leftBase[2] - nlz * thickness
        ];
        
        const [nry, nrz] = this.getNormal2D(peak, rightBase);
        const rightBaseInner = [
            0, 
            rightBase[1] - nry * thickness, 
            rightBase[2] - nrz * thickness
        ];

        profiles.push([
           leftBase,
           peak,
           innerPeak,
           leftBaseInner
        ]);

        profiles.push([
           peak,
           rightBase,
           rightBaseInner,
           innerPeak
        ]);

      } else if (surfEnum === 'Left') {
        const p1 = [0, leftY + yOffset, topZ];
        const p2 = [0, rightY + yOffset, bottomZ];
        profiles.push(generateThickenedSegment(p1, p2));
      } else {
        const p1 = [0, leftY + yOffset, bottomZ];
        const p2 = [0, rightY + yOffset, topZ];
        profiles.push(generateThickenedSegment(p1, p2));
      }
    }
    
    return profiles;
  }

  generateGeometry() {
    const { smoothness, angle, size, rampEnum, styleEnum, thickness, surfEnum, width, height } = this.params;
    
    const baseProfiles = this.generateProfiles();
    const angleRad = (angle * Math.PI) / 180;
    const steps = angle === 0 ? 1 : smoothness;
    const solids = [];

    if (angle === 0) {
        for (const profile of baseProfiles) {
            const solidVertices = [];
            const brushSegments = [];

            const reversedProfile = [...profile].reverse();

            const pStart = reversedProfile.map(v => [...v]);
            const pEnd = reversedProfile.map(v => [v[0] + size, v[1], v[2]]);
            
            solidVertices.push(pStart);
            solidVertices.push(pEnd);
            
            brushSegments.push({
                start: pStart,
                end: pEnd
            });

            solids.push({ vertices: solidVertices, brushSegments });
        }
    } else {
        let spinAxis, spinCenter, spinAngle;
        
        if (rampEnum === 'Right') {
            spinAxis = [0.0, 0.0, 1.0];
            spinCenter = [0, size, 0];
            spinAngle = angleRad;
        } else if (rampEnum === 'Left') {
            spinAxis = [0.0, 0.0, 1.0];
            spinCenter = [0, -size, 0];
            spinAngle = -angleRad;
        } else if (rampEnum === 'Down' || rampEnum === 'Arc') {
            spinAxis = [0.0, -1.0, 0.0];
            spinCenter = [0, 0, -size];
            spinAngle = -angleRad;
        } else if (rampEnum === 'Up' || rampEnum === 'Dip') {
            spinAxis = [0.0, -1.0, 0.0];
            spinCenter = [0, 0, size + height];
            spinAngle = angleRad;
        } else {
            spinAxis = [0.0, 0.0, 1.0];
            spinCenter = [0, size, 0];
            spinAngle = angleRad;
        }
        
        for (const profile of baseProfiles) {
            const solidVertices = [];
            const brushSegments = [];
            
            const allSteps = [];
            for (let step = 0; step <= steps; step++) {
                const t = step / steps;
                const currentAngle = spinAngle * t;
                const stepVerts = [];
                for (const baseVert of profile) {
                    stepVerts.push(this.rotateAroundAxis(baseVert, spinAxis, spinCenter, currentAngle));
                }
                allSteps.push(stepVerts);
            }

            for (let i = 0; i <= steps; i++) {
                solidVertices.push(allSteps[i]);
            }

            for (let i = 0; i < steps; i++) {
                const start = allSteps[i];
                const end = allSteps[i+1];
                brushSegments.push({ start: start, end: end });
            }
            
            solids.push({ vertices: solidVertices, brushSegments });
        }

        const clipSolids = [];
        let clipProfiles = baseProfiles.map(profile => profile.map(v => [...v]));
        const offsetAmount = 1.0;
        
        const applyOffset = (p1, p2) => {
            const dy = p2[1] - p1[1];
            const dz = p2[2] - p1[2];
            const len = Math.sqrt(dy*dy + dz*dz);
            if (len === 0) return;
            
            const ny = -dz / len;
            const nz = dy / len;
            
            const offY = ny * offsetAmount;
            const offZ = nz * offsetAmount;
            
            p1[1] += offY;
            p1[2] += offZ;
            p2[1] += offY;
            p2[2] += offZ;
        };

        if (styleEnum === 'Wedge') {
            if (surfEnum === 'Both') {
                 const p = clipProfiles[0]; 
                 const Peak = [...p[0]];
                 const BR = [...p[1]];
                 const BL = [...p[2]];
                 const BC = [0, 0, 0]; 
                 
                 const PeakL = [...Peak];
                 const BCL = [...BC];
                 const BLL = [...BL];
                 applyOffset(BLL, PeakL);
                 const leftProfile = [PeakL, BCL, BLL];
                 
                 const PeakR = [...Peak];
                 const BRR = [...BR];
                 const BCR = [...BC];
                 applyOffset(PeakR, BRR);
                 const rightProfile = [PeakR, BRR, BCR];
                 
                 clipProfiles = [leftProfile, rightProfile];
                 
            } else if (surfEnum === 'Left') {
                 applyOffset(clipProfiles[0][0], clipProfiles[0][1]);
            } else {
                 applyOffset(clipProfiles[0][2], clipProfiles[0][0]);
            }
        } else {
            if (surfEnum === 'Both') {
                applyOffset(clipProfiles[0][0], clipProfiles[0][1]);
                applyOffset(clipProfiles[1][0], clipProfiles[1][1]);
            } else {
                applyOffset(clipProfiles[0][0], clipProfiles[0][1]);
            }
        }

        const targetOverlapUnits = 4.0;
        const safeRadius = size > 64 ? size : 64;
        const overlapAngleRad = targetOverlapUnits / safeRadius;

        if (styleEnum === 'Wedge' && surfEnum === 'Both' && clipProfiles.length === 2 && clipProfiles[0].length === 3) {
        } else if (styleEnum === 'Wedge' && surfEnum === 'Both') {
             const p = baseProfiles[0]; 
             const Peak = p[0];
             const BR = p[1];
             const BL = p[2];
             const BC = [0, 0, 0]; 
             
             const leftProfile = [Peak, BC, BL];
             const rightProfile = [Peak, BR, BC];
             
             clipProfiles = [leftProfile, rightProfile];
        }

        for (const profile of clipProfiles) {
            const clipSegments = [];
            const stepAngleSize = spinAngle / steps;
            const isLoop = (Math.abs(angle) >= 360);

            let overlapAngle;
            if (isLoop) {
                 overlapAngle = Math.abs(stepAngleSize) * 0.45;
            } else {
                 overlapAngle = Math.min(overlapAngleRad, Math.abs(stepAngleSize) * 0.45);
            }

            const isVertical = ['Up', 'Down', 'Dip', 'Arc'].includes(rampEnum);
            const isTurn = ['Left', 'Right'].includes(rampEnum);
            let isCurrentProfileInward = false;

            if (isVertical) {
                isCurrentProfileInward = true;
            } else if (isTurn) {
                const profileIndex = clipProfiles.indexOf(profile);
                
                if (surfEnum === 'Both') {
                    let avgY = 0;
                    let count = 0;
                    for (const v of profile) {
                        avgY += v[1];
                        count++;
                    }
                    avgY /= count;
                    
                    const isLeftSide = (avgY < 0);
                    
                    if (rampEnum === 'Right') {
                        isCurrentProfileInward = !isLeftSide;
                    } else {
                        isCurrentProfileInward = isLeftSide;
                    }
                } else {
                    isCurrentProfileInward = (rampEnum !== surfEnum);
                }
            }

            for (let i = 0; i < steps; i++) {
                let angleStart = (i * stepAngleSize);
                let angleEnd = ((i + 1) * stepAngleSize);

                const isFirst = (i === 0);
                const isLast = (i === steps - 1);

                if (isCurrentProfileInward) {
                    const overlapDirection = Math.sign(stepAngleSize || 1);
                    const signedOverlap = overlapAngle * overlapDirection;
                    
                    if (!isFirst || isLoop) angleStart -= signedOverlap;
                    if (!isLast || isLoop) angleEnd += signedOverlap;
                }

                const startVerts = profile.map(v => this.rotateAroundAxis(v, spinAxis, spinCenter, angleStart));
                const endVerts = profile.map(v => this.rotateAroundAxis(v, spinAxis, spinCenter, angleEnd));

                clipSegments.push({ start: startVerts, end: endVerts });
            }
            clipSolids.push({ brushSegments: clipSegments });
        }

        if ((rampEnum === 'Arc' || rampEnum === 'Dip') && angle !== 0) {
            const midStep = Math.floor(steps / 2);
            const midVertices = solids[0].vertices[midStep];
            
            let centerX = 0, centerY = 0, centerZ = 0;
            let count = 0;
            for (const v of midVertices) {
                centerX += v[0];
                centerY += v[1];
                centerZ += v[2];
                count++;
            }
            centerX /= count;
            centerY /= count;
            centerZ /= count;

            const translate = (v) => {
                v[0] -= centerX;
                v[1] -= centerY;
                v[2] -= centerZ;
            };
            const rotationAngle = rampEnum === 'Arc' ? angleRad / 2 : -angleRad / 2;
            const rotate = (v) => this.rotateAroundAxis(v, [0, 1, 0], [0, 0, 0], rotationAngle);

            for (const solid of clipSolids) {
                for (const seg of solid.brushSegments) {
                    for (const v of seg.start) {
                        translate(v);
                        const newV = rotate(v);
                        v[0] = newV[0]; v[1] = newV[1]; v[2] = newV[2];
                    }
                    for (const v of seg.end) {
                        translate(v);
                        const newV = rotate(v);
                        v[0] = newV[0]; v[1] = newV[1]; v[2] = newV[2];
                    }
                }
            }
        }

        return {
            solids,
            clipSolids,
            segments: steps,
            styleEnum,
            surfEnum,
            rampEnum,
            thickness,
            angle,
            isLoop: angle === 360
        };
    }

    return {
        solids,
        clipSolids: [],
        segments: 1,
        styleEnum,
        surfEnum,
        rampEnum,
        thickness,
        angle,
        isLoop: false
    };
  }

  getVisualizationData() {
    const geometryData = this.generateGeometry();
    const { solids, segments } = geometryData;
    const faces = [];
    
    for (const solid of solids) {
        const solidVerts = solid.vertices;
        const numPoints = solidVerts[0].length;
        
        for (let i = 0; i < segments; i++) {
            const step1 = solidVerts[i];
            const step2 = solidVerts[i + 1];
            
            for (let j = 0; j < numPoints; j++) {
                const nextJ = (j + 1) % numPoints;
                
                const v1 = step1[j];
                const v2 = step1[nextJ];
                const v3 = step2[nextJ];
                const v4 = step2[j];
                
                faces.push([v1, v2, v4]);
                faces.push([v2, v3, v4]);
            }
        }

        const addCap = (stepIndex, flip) => {
            const step = solidVerts[stepIndex];
            const center = step[0];
            for (let j = 1; j < numPoints - 1; j++) {
                const v1 = step[0];
                const v2 = step[j];
                const v3 = step[j+1];
                
                if (flip) {
                    faces.push([v1, v3, v2]);
                } else {
                    faces.push([v1, v2, v3]);
                }
            }
        };

        if (geometryData.angle !== 360) {
            addCap(0, true);
            addCap(segments, false);
        }
    }
    
    return {
      faces,
      geometry: geometryData
    };
  }

  generateVMF() {
    const generator = new VMFGenerator();
    const geometryData = this.generateGeometry();
    const { solids, clipSolids, segments, angle, rampEnum, surfEnum, isLoop } = geometryData;
    
    const shouldAddClip = clipSolids && clipSolids.length > 0;

    const generateBrushFromSegments = (segmentsList, materialFunc, capMaterial, solidVertsForStructure, internalCapMaterial = "TOOLS/TOOLSNODRAW") => {
        const numPoints = solidVertsForStructure ? solidVertsForStructure[0].length : segmentsList[0].start.length;
        const currentTextureOffset = new Array(numPoints).fill(0);

        for (let i = 0; i < segmentsList.length; i++) {
            const seg = segmentsList[i];
            const step1 = seg.start;
            const step2 = seg.end;
            
            const sides = [];
            
            for (let j = 0; j < numPoints; j++) {
                const nextJ = (j + 1) % numPoints;
                
                const v1 = step1[j];
                const v2 = step1[nextJ];
                const v3 = step2[nextJ];
                const v4 = step2[j];
                
                const material = materialFunc(j);

                const sideData = {
                    plane: generator.formatPlane(v2, v1, v4),
                    material: material,
                    vertices: [v4, v3, v2, v1]
                };

                const rv1 = v1;
                const rv2 = v2;
                const rv3 = v3;
                const rv4 = v4;

                const mx = (rv1[0] + rv2[0]) / 2;
                const my = (rv1[1] + rv2[1]) / 2;
                const mz = (rv1[2] + rv2[2]) / 2;
                const m2x = (rv4[0] + rv3[0]) / 2;
                const m2y = (rv4[1] + rv3[1]) / 2;
                const m2z = (rv4[2] + rv3[2]) / 2;
                
                const ux = m2x - mx;
                const uy = m2y - my;
                const uz = m2z - mz;
                const uLen = Math.sqrt(ux*ux + uy*uy + uz*uz);
                const uNorm = uLen > 0 ? [ux/uLen, uy/uLen, uz/uLen] : [1, 0, 0];

                const f1x = rv3[0] - rv4[0], f1y = rv3[1] - rv4[1], f1z = rv3[2] - rv4[2];
                const f2x = rv2[0] - rv4[0], f2y = rv2[1] - rv4[1], f2z = rv2[2] - rv4[2];
                const nx = f1y*f2z - f1z*f2y;
                const ny = f1z*f2x - f1x*f2z;
                const nz = f1x*f2y - f1y*f2x;
                const nLen = Math.sqrt(nx*nx + ny*ny + nz*nz);
                const normal = nLen > 0 ? [nx/nLen, ny/nLen, nz/nLen] : [0, 0, 1];

                let vx = normal[1]*uNorm[2] - normal[2]*uNorm[1];
                let vy = normal[2]*uNorm[0] - normal[0]*uNorm[2];
                let vz = normal[0]*uNorm[1] - normal[1]*uNorm[0];
                const vLen = Math.sqrt(vx*vx + vy*vy + vz*vz);
                const vNorm = vLen > 0 ? [vx/vLen, vy/vLen, vz/vLen] : [0, 1, 0];

                const px = (rv2[0]+rv3[0]) - (rv1[0]+rv4[0]);
                const py = (rv2[1]+rv3[1]) - (rv1[1]+rv4[1]);
                const pz = (rv2[2]+rv3[2]) - (rv1[2]+rv4[2]);
                const dotDir = px*vNorm[0] + py*vNorm[1] + pz*vNorm[2];
                if (dotDir < 0) {
                    vNorm[0] = -vNorm[0]; vNorm[1] = -vNorm[1]; vNorm[2] = -vNorm[2];
                }

                const scale = this.params.uvScale;
                const textureSize = 1024.0;
                const dotU = mx*uNorm[0] + my*uNorm[1] + mz*uNorm[2];
                let shiftU = currentTextureOffset[j] - (dotU / scale);
                const dotV = rv1[0]*vNorm[0] + rv1[1]*vNorm[1] + rv1[2]*vNorm[2];
                let shiftV = 0 - (dotV / scale);
                shiftU = ((shiftU % textureSize) + textureSize) % textureSize;
                shiftV = ((shiftV % textureSize) + textureSize) % textureSize;

                const f = (n) => Number(n).toFixed(4);
                sideData.uaxis = `[${f(uNorm[0])} ${f(uNorm[1])} ${f(uNorm[2])} ${f(shiftU)}] ${scale}`;
                sideData.vaxis = `[${f(vNorm[0])} ${f(vNorm[1])} ${f(vNorm[2])} ${f(shiftV)}] ${scale}`;
                
                currentTextureOffset[j] += (uLen / scale);

                sides.push(sideData);
            }
            
            const isFirstSegment = (i === 0);
            const isLastSegment = (i === segmentsList.length - 1);
            
            const startMat = (isFirstSegment && !isLoop) ? capMaterial : internalCapMaterial;
            const endMat = (isLastSegment && !isLoop) ? capMaterial : internalCapMaterial;

            {
                const step = step1;
                const p1 = step[0], p2 = step[1], p3 = step[2];
                sides.push({
                    plane: generator.formatPlane(p1, p2, p3),
                    material: startMat,
                    ...generator.calculateUVAxis(p1, p2, p3, this.params.uvScale),
                    vertices: [...step]
                });
            }
            {
                const step = step2;
                const p1 = step[0], p2 = step[2], p3 = step[1];
                const reversedStep = [...step].reverse();
                sides.push({
                    plane: generator.formatPlane(p1, p2, p3),
                    material: endMat,
                    ...generator.calculateUVAxis(p1, p2, p3, this.params.uvScale),
                    vertices: reversedStep
                });
            }
            
            generator.addSolid(sides);
        }
    };

    const visualBrushes = [];
    const tempAddSolidVisual = generator.addSolid.bind(generator);
    generator.addSolid = (sides) => {
         visualBrushes.push({
             id: generator.getNextSolidId(),
             sides: sides.map((side, index) => ({
                id: generator.getNextSideId(),
                plane: side.plane,
                material: side.material || "nodraw",
                uaxis: side.uaxis || `[1 0 0 0] 0.25`,
                vaxis: side.vaxis || `[0 -1 0 0] 0.25`,
                rotation: side.rotation || "0",
                lightmapscale: side.lightmapscale || "16",
                smoothing_groups: side.smoothing_groups || "0",
                vertices: side.vertices
              })),
              editor: { color: "220 220 220", visgroupshown: "1", visgroupautoshown: "1" }
         });
    };

    for (let sIdx = 0; sIdx < solids.length; sIdx++) {
        const solid = solids[sIdx];
        
        generateBrushFromSegments(solid.brushSegments, (j) => {
            return this.params.materialName;
        }, this.params.materialName, solid.vertices, "TOOLS/TOOLSNODRAW");
    }
    
    generator.addSolid = tempAddSolidVisual;
    
    if (visualBrushes.length > 0) {
         generator.entities.push({
             id: generator.getNextEntityId(),
             classname: "func_detail",
             solids: visualBrushes
         });
    }

    if (shouldAddClip) {
        for (let sIdx = 0; sIdx < clipSolids.length; sIdx++) {
            const clipSolid = clipSolids[sIdx];
            
            const groupId = generator.getNextGroupId(); 
            const tempAddSolid = generator.addSolid.bind(generator);
            generator.addSolid = (sides) => {
                 const solid = {
                      id: generator.getNextSolidId(),
                      sides: sides.map((side, index) => ({
                        id: generator.getNextSideId(),
                        plane: side.plane,
                        material: side.material || "nodraw",
                        uaxis: side.uaxis || `[1 0 0 0] 0.25`,
                        vaxis: side.vaxis || `[0 -1 0 0] 0.25`,
                        rotation: side.rotation || "0",
                        lightmapscale: side.lightmapscale || "16",
                        smoothing_groups: side.smoothing_groups || "0",
                        vertices: side.vertices
                      })),
                      editor: {
                          color: "220 30 220",
                          visgroupshown: "1",
                          visgroupautoshown: "1",
                          groupid: String(groupId)
                      }
                 };
                 generator.world.solids.push(solid);
            };
            
            generateBrushFromSegments(clipSolid.brushSegments, () => "tools/toolsplayerclip", "tools/toolsplayerclip", null, "tools/toolsplayerclip");
            generator.addSolid = tempAddSolid;
            generator.addGroup(groupId);
        }
    }
    
    return generator;
  }
}

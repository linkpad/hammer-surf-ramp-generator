import { generateGeometry } from './geometryGenerator.js';
import { generateProfiles } from './profileGenerator.js';
import { generateVMF, getVisualizationData } from './vmfSingleGenerator.js';
import { getConnectionFrame } from './connectionUtils.js';
import { generateConnectedRamps, generateConnectedVMF } from './connectedRampsGenerator.js';
import * as mathUtils from './mathUtils.js';

const DEFAULT_PARAMS = {
  rampName: 'ramp',
  materialName: 'default',
  styleEnum: 'Wedge',
  thickness: 32,
  surfEnum: 'Both',
  rampEnum: 'Right',
  width: 256,
  height: 320,
  smoothness: 16,
  angle: 90,
  size: 1024,
  uvScale: 0.25,
  visualEntity: 'func_brush'
};

export class SurfRampGenerator {
  constructor(params = {}) {
    this.params = { ...DEFAULT_PARAMS, ...params };
  }

  generateProfiles() {
    return generateProfiles(this.params);
  }

  generateGeometry() {
    return generateGeometry(this.params);
  }

  getVisualizationData() {
    return getVisualizationData(this);
  }

  generateVMF(options = {}) {
    return generateVMF(this, options);
  }

  getConnectionFrame(isStart) {
    return getConnectionFrame(this, isStart);
  }

  rotateAroundAxis(point, axis, center, angle) {
    return mathUtils.rotateAroundAxis(point, axis, center, angle);
  }

  static generateConnectedRamps(sharedParams, rampConfigs, connectionMode = 'end') {
    return generateConnectedRamps(SurfRampGenerator, sharedParams, rampConfigs, connectionMode);
  }

  static generateConnectedVMF(connectedRampsData) {
    return generateConnectedVMF(connectedRampsData);
  }

  static createIdentityMatrix = mathUtils.createIdentityMatrix;
  static transformVertex = mathUtils.transformVertex;
  static multiplyMatrices = mathUtils.multiplyMatrices;
  static normalize = mathUtils.normalize;
  static cross = mathUtils.cross;
  static transformVector = mathUtils.transformVector;
  static createBasisMatrix = mathUtils.createBasisMatrix;
  static invertTransformMatrix = mathUtils.invertTransformMatrix;
  static calculateFaceNormal = mathUtils.calculateFaceNormal;
}

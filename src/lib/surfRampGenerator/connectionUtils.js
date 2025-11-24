import { normalize, transformVertex, transformVector, createBasisMatrix, invertTransformMatrix, multiplyMatrices, rotateAroundAxis } from './mathUtils.js';

export function getConnectionFrame(generator, isStartFrame) {
  if (isStartFrame) {
    return {
      position: [0, 0, 0],
      forward: [1, 0, 0],
      up: [0, 0, 1]
    };
  }

  const { angle, size, rampEnum, height } = generator.params;

  if (angle === 0) {
    return {
      position: [size, 0, 0],
      forward: [1, 0, 0],
      up: [0, 0, 1]
    };
  }

  const angleRad = (angle * Math.PI) / 180;
  const spinConfig = getSpinConfig(rampEnum, angleRad, size, height);

  const endPosition = rotateAroundAxis([0, 0, 0], spinConfig.axis, spinConfig.center, spinConfig.angle);
  const endForward = rotateAroundAxis([1, 0, 0], spinConfig.axis, [0, 0, 0], spinConfig.angle);
  const endUp = rotateAroundAxis([0, 0, 1], spinConfig.axis, [0, 0, 0], spinConfig.angle);

  return {
    position: endPosition,
    forward: normalize(endForward),
    up: normalize(endUp)
  };
}

function getSpinConfig(rampEnum, angleRad, size, height) {
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

export function calculateConnectionTransform(prevGenerator, currentGenerator, prevTransform, connectionMode) {
  const connectToStartOfPrev = connectionMode === 'start';

  const targetLocalFrame = getConnectionFrame(prevGenerator, connectToStartOfPrev);
  const targetPosition = transformVertex(targetLocalFrame.position, prevTransform);
  const targetForward = transformVector(targetLocalFrame.forward, prevTransform);
  const targetUp = transformVector(targetLocalFrame.up, prevTransform);

  const useCurrentStartFrame = !connectToStartOfPrev;
  const sourceLocalFrame = getConnectionFrame(currentGenerator, useCurrentStartFrame);

  const targetMatrix = createBasisMatrix(targetPosition, targetForward, targetUp);
  const sourceMatrix = createBasisMatrix(sourceLocalFrame.position, sourceLocalFrame.forward, sourceLocalFrame.up);
  const sourceMatrixInverse = invertTransformMatrix(sourceMatrix);

  return multiplyMatrices(targetMatrix, sourceMatrixInverse);
}

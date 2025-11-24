import { SurfRampGenerator } from './src/lib/surfRampGenerator.js';
import fs from 'fs';
import path from 'path';

const testDir = './test-vmf-files';

console.log('🔍 Validating Test VMF Files Against Ground Truth...\n');

// Define all test configurations (must match generateTestVMFs.js)
const testConfigs = [
  // Single Ramps - Wedge Style
  {
    filename: '01_single_right_both_wedge.vmf',
    type: 'single',
    params: {
      rampName: 'single_right_both',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Wedge',
      surfEnum: 'Both',
      rampEnum: 'Right',
      width: 256,
      height: 320,
      smoothness: 16,
      angle: 90,
      size: 1024,
      uvScale: 0.25
    }
  },
  {
    filename: '02_single_left_both_wedge.vmf',
    type: 'single',
    params: {
      rampName: 'single_left_both',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Wedge',
      surfEnum: 'Both',
      rampEnum: 'Left',
      width: 256,
      height: 320,
      smoothness: 16,
      angle: 90,
      size: 1024,
      uvScale: 0.25
    }
  },
  {
    filename: '03_single_right_right_surf_wedge.vmf',
    type: 'single',
    params: {
      rampName: 'single_right_right_surf',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Wedge',
      surfEnum: 'Right',
      rampEnum: 'Right',
      width: 256,
      height: 320,
      smoothness: 16,
      angle: 90,
      size: 1024,
      uvScale: 0.25
    }
  },
  {
    filename: '04_single_right_left_surf_wedge.vmf',
    type: 'single',
    params: {
      rampName: 'single_right_left_surf',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Wedge',
      surfEnum: 'Left',
      rampEnum: 'Right',
      width: 256,
      height: 320,
      smoothness: 16,
      angle: 90,
      size: 1024,
      uvScale: 0.25
    }
  },
  {
    filename: '05_single_up_wedge.vmf',
    type: 'single',
    params: {
      rampName: 'single_up',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Wedge',
      surfEnum: 'Both',
      rampEnum: 'Up',
      width: 256,
      height: 320,
      smoothness: 16,
      angle: 90,
      size: 1024,
      uvScale: 0.25
    }
  },
  {
    filename: '06_single_down_wedge.vmf',
    type: 'single',
    params: {
      rampName: 'single_down',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Wedge',
      surfEnum: 'Both',
      rampEnum: 'Down',
      width: 256,
      height: 320,
      smoothness: 16,
      angle: 90,
      size: 1024,
      uvScale: 0.25
    }
  },
  {
    filename: '07_single_dip_wedge.vmf',
    type: 'single',
    params: {
      rampName: 'single_dip',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Wedge',
      surfEnum: 'Both',
      rampEnum: 'Dip',
      width: 256,
      height: 320,
      smoothness: 16,
      angle: 90,
      size: 1024,
      uvScale: 0.25
    }
  },
  {
    filename: '08_single_arc_wedge.vmf',
    type: 'single',
    params: {
      rampName: 'single_arc',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Wedge',
      surfEnum: 'Both',
      rampEnum: 'Arc',
      width: 256,
      height: 320,
      smoothness: 16,
      angle: 90,
      size: 1024,
      uvScale: 0.25
    }
  },
  // Single Ramps - Thin Style
  {
    filename: '09_single_right_thin.vmf',
    type: 'single',
    params: {
      rampName: 'single_right_thin',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Thin',
      thickness: 32,
      surfEnum: 'Both',
      rampEnum: 'Right',
      width: 256,
      height: 320,
      smoothness: 16,
      angle: 90,
      size: 1024,
      uvScale: 0.25
    }
  },
  {
    filename: '10_single_right_thin_thick.vmf',
    type: 'single',
    params: {
      rampName: 'single_right_thin_thick',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Thin',
      thickness: 64,
      surfEnum: 'Both',
      rampEnum: 'Right',
      width: 256,
      height: 320,
      smoothness: 16,
      angle: 90,
      size: 1024,
      uvScale: 0.25
    }
  },
  {
    filename: '11_single_right_thin_right_surf.vmf',
    type: 'single',
    params: {
      rampName: 'single_right_thin_right_surf',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Thin',
      thickness: 32,
      surfEnum: 'Right',
      rampEnum: 'Right',
      width: 256,
      height: 320,
      smoothness: 16,
      angle: 90,
      size: 1024,
      uvScale: 0.25
    }
  },
  // Smoothness Variations
  {
    filename: '12_smoothness_low_3.vmf',
    type: 'single',
    params: {
      rampName: 'smoothness_low',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Wedge',
      surfEnum: 'Both',
      rampEnum: 'Right',
      width: 256,
      height: 320,
      smoothness: 3,
      angle: 90,
      size: 1024,
      uvScale: 0.25
    }
  },
  {
    filename: '13_smoothness_medium_8.vmf',
    type: 'single',
    params: {
      rampName: 'smoothness_medium',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Wedge',
      surfEnum: 'Both',
      rampEnum: 'Right',
      width: 256,
      height: 320,
      smoothness: 8,
      angle: 90,
      size: 1024,
      uvScale: 0.25
    }
  },
  {
    filename: '14_smoothness_high_32.vmf',
    type: 'single',
    params: {
      rampName: 'smoothness_high',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Wedge',
      surfEnum: 'Both',
      rampEnum: 'Right',
      width: 256,
      height: 320,
      smoothness: 32,
      angle: 90,
      size: 1024,
      uvScale: 0.25
    }
  },
  {
    filename: '15_smoothness_very_high_64.vmf',
    type: 'single',
    params: {
      rampName: 'smoothness_very_high',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Wedge',
      surfEnum: 'Both',
      rampEnum: 'Right',
      width: 256,
      height: 320,
      smoothness: 64,
      angle: 90,
      size: 1024,
      uvScale: 0.25
    }
  },
  // Angle Variations
  {
    filename: '16_angle_45_degrees.vmf',
    type: 'single',
    params: {
      rampName: 'angle_45',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Wedge',
      surfEnum: 'Both',
      rampEnum: 'Right',
      width: 256,
      height: 320,
      smoothness: 16,
      angle: 45,
      size: 1024,
      uvScale: 0.25
    }
  },
  {
    filename: '17_angle_180_degrees.vmf',
    type: 'single',
    params: {
      rampName: 'angle_180',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Wedge',
      surfEnum: 'Both',
      rampEnum: 'Right',
      width: 256,
      height: 320,
      smoothness: 24,
      angle: 180,
      size: 1024,
      uvScale: 0.25
    }
  },
  {
    filename: '18_angle_270_degrees.vmf',
    type: 'single',
    params: {
      rampName: 'angle_270',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Wedge',
      surfEnum: 'Both',
      rampEnum: 'Right',
      width: 256,
      height: 320,
      smoothness: 32,
      angle: 270,
      size: 1024,
      uvScale: 0.25
    }
  },
  {
    filename: '19_angle_360_loop.vmf',
    type: 'single',
    params: {
      rampName: 'angle_360_loop',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Wedge',
      surfEnum: 'Both',
      rampEnum: 'Right',
      width: 256,
      height: 320,
      smoothness: 48,
      angle: 360,
      size: 1024,
      uvScale: 0.25
    }
  },
  {
    filename: '20_angle_0_straight.vmf',
    type: 'single',
    params: {
      rampName: 'angle_0_straight',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Wedge',
      surfEnum: 'Both',
      rampEnum: 'Right',
      width: 256,
      height: 320,
      smoothness: 16,
      angle: 0,
      size: 1024,
      uvScale: 0.25
    }
  },
  // Size Variations
  {
    filename: '21_size_512_small.vmf',
    type: 'single',
    params: {
      rampName: 'size_small',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Wedge',
      surfEnum: 'Both',
      rampEnum: 'Right',
      width: 256,
      height: 320,
      smoothness: 16,
      angle: 90,
      size: 512,
      uvScale: 0.25
    }
  },
  {
    filename: '22_size_2048_large.vmf',
    type: 'single',
    params: {
      rampName: 'size_large',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Wedge',
      surfEnum: 'Both',
      rampEnum: 'Right',
      width: 256,
      height: 320,
      smoothness: 16,
      angle: 90,
      size: 2048,
      uvScale: 0.25
    }
  },
  // Width/Height Variations
  {
    filename: '23_wide_short.vmf',
    type: 'single',
    params: {
      rampName: 'wide_short',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Wedge',
      surfEnum: 'Both',
      rampEnum: 'Right',
      width: 512,
      height: 128,
      smoothness: 16,
      angle: 90,
      size: 1024,
      uvScale: 0.25
    }
  },
  {
    filename: '24_narrow_tall.vmf',
    type: 'single',
    params: {
      rampName: 'narrow_tall',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Wedge',
      surfEnum: 'Both',
      rampEnum: 'Right',
      width: 128,
      height: 512,
      smoothness: 16,
      angle: 90,
      size: 1024,
      uvScale: 0.25
    }
  },
  // Multiple Connected Ramps
  {
    filename: '25_two_right_turns.vmf',
    type: 'multiple',
    sharedParams: {
      rampName: 'two_right_turns',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Wedge',
      surfEnum: 'Both',
      width: 256,
      height: 320,
      smoothness: 16,
      uvScale: 0.25
    },
    rampConfigs: [
      { rampEnum: 'Right', angle: 90, size: 1024 },
      { rampEnum: 'Right', angle: 90, size: 1024 }
    ],
    connectionMode: 'end'
  },
  {
    filename: '26_three_turns.vmf',
    type: 'multiple',
    sharedParams: {
      rampName: 'three_turns',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Wedge',
      surfEnum: 'Both',
      width: 256,
      height: 320,
      smoothness: 16,
      uvScale: 0.25
    },
    rampConfigs: [
      { rampEnum: 'Right', angle: 90, size: 1024 },
      { rampEnum: 'Right', angle: 90, size: 1024 },
      { rampEnum: 'Right', angle: 90, size: 1024 }
    ],
    connectionMode: 'end'
  },
  {
    filename: '27_zigzag_right_left.vmf',
    type: 'multiple',
    sharedParams: {
      rampName: 'zigzag',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Wedge',
      surfEnum: 'Both',
      width: 256,
      height: 320,
      smoothness: 16,
      uvScale: 0.25
    },
    rampConfigs: [
      { rampEnum: 'Right', angle: 45, size: 1024 },
      { rampEnum: 'Left', angle: 45, size: 1024 }
    ],
    connectionMode: 'end'
  },
  {
    filename: '28_mixed_directions.vmf',
    type: 'multiple',
    sharedParams: {
      rampName: 'mixed_directions',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Wedge',
      surfEnum: 'Both',
      width: 256,
      height: 320,
      smoothness: 16,
      uvScale: 0.25
    },
    rampConfigs: [
      { rampEnum: 'Right', angle: 90, size: 1024 },
      { rampEnum: 'Up', angle: 45, size: 1024 },
      { rampEnum: 'Right', angle: 90, size: 1024 }
    ],
    connectionMode: 'end'
  },
  {
    filename: '29_spiral_four_turns.vmf',
    type: 'multiple',
    sharedParams: {
      rampName: 'spiral',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Wedge',
      surfEnum: 'Both',
      width: 256,
      height: 320,
      smoothness: 12,
      uvScale: 0.25
    },
    rampConfigs: [
      { rampEnum: 'Right', angle: 90, size: 1024 },
      { rampEnum: 'Right', angle: 90, size: 1024 },
      { rampEnum: 'Right', angle: 90, size: 1024 },
      { rampEnum: 'Right', angle: 90, size: 1024 }
    ],
    connectionMode: 'end'
  },
  {
    filename: '30_complex_path_varying_smoothness.vmf',
    type: 'multiple',
    sharedParams: {
      rampName: 'complex_path',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Wedge',
      surfEnum: 'Both',
      width: 256,
      height: 320,
      smoothness: 16,
      uvScale: 0.25
    },
    rampConfigs: [
      { rampEnum: 'Right', angle: 90, size: 1024, smoothness: 8 },
      { rampEnum: 'Down', angle: 45, size: 1024, smoothness: 16 },
      { rampEnum: 'Left', angle: 90, size: 1024, smoothness: 12 },
      { rampEnum: 'Up', angle: 45, size: 1024, smoothness: 20 }
    ],
    connectionMode: 'end'
  },
  {
    filename: '31_thin_multiple_ramps.vmf',
    type: 'multiple',
    sharedParams: {
      rampName: 'thin_multiple',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Thin',
      thickness: 32,
      surfEnum: 'Both',
      width: 256,
      height: 320,
      smoothness: 16,
      uvScale: 0.25
    },
    rampConfigs: [
      { rampEnum: 'Right', angle: 90, size: 1024 },
      { rampEnum: 'Right', angle: 90, size: 1024 }
    ],
    connectionMode: 'end'
  },
  {
    filename: '32_single_surf_multiple_ramps.vmf',
    type: 'multiple',
    sharedParams: {
      rampName: 'single_surf_multiple',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Wedge',
      surfEnum: 'Right',
      width: 256,
      height: 320,
      smoothness: 16,
      uvScale: 0.25
    },
    rampConfigs: [
      { rampEnum: 'Right', angle: 90, size: 1024 },
      { rampEnum: 'Right', angle: 90, size: 1024 }
    ],
    connectionMode: 'end'
  },
  {
    filename: '33_arc_dip_combo.vmf',
    type: 'multiple',
    sharedParams: {
      rampName: 'arc_dip_combo',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Wedge',
      surfEnum: 'Both',
      width: 256,
      height: 320,
      smoothness: 16,
      uvScale: 0.25
    },
    rampConfigs: [
      { rampEnum: 'Arc', angle: 90, size: 1024 },
      { rampEnum: 'Dip', angle: 90, size: 1024 }
    ],
    connectionMode: 'end'
  },
  // Special Cases
  {
    filename: '34_very_long_straight.vmf',
    type: 'single',
    params: {
      rampName: 'very_long_straight',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Wedge',
      surfEnum: 'Both',
      rampEnum: 'Right',
      width: 256,
      height: 320,
      smoothness: 16,
      angle: 0,
      size: 4096,
      uvScale: 0.25
    }
  },
  {
    filename: '35_tight_radius_turn.vmf',
    type: 'single',
    params: {
      rampName: 'tight_radius',
      materialName: 'dev/dev_measuregeneric01',
      styleEnum: 'Wedge',
      surfEnum: 'Both',
      rampEnum: 'Right',
      width: 256,
      height: 320,
      smoothness: 24,
      angle: 90,
      size: 256,
      uvScale: 0.25
    }
  }
];

let passCount = 0;
let failCount = 0;
const failures = [];

console.log(`Testing ${testConfigs.length} VMF files...\n`);

for (const config of testConfigs) {
  const groundTruthPath = path.join(testDir, config.filename);
  
  // Check if ground truth file exists
  if (!fs.existsSync(groundTruthPath)) {
    console.log(`❌ ${config.filename} - Ground truth file not found`);
    failCount++;
    failures.push({ file: config.filename, reason: 'Ground truth file missing' });
    continue;
  }
  
  // Generate VMF from current code
  let generatedVMF;
  try {
    if (config.type === 'single') {
      const generator = new SurfRampGenerator(config.params);
      const vmfGenerator = generator.generateVMF();
      generatedVMF = vmfGenerator.generate();
    } else if (config.type === 'multiple') {
      const connectedRamps = SurfRampGenerator.generateConnectedRamps(
        config.sharedParams,
        config.rampConfigs,
        config.connectionMode
      );
      const vmfGenerator = SurfRampGenerator.generateConnectedVMF(connectedRamps);
      generatedVMF = vmfGenerator.generate();
    }
  } catch (error) {
    console.log(`❌ ${config.filename} - Generation error: ${error.message}`);
    failCount++;
    failures.push({ file: config.filename, reason: `Generation error: ${error.message}` });
    continue;
  }
  
  // Load ground truth
  const groundTruth = fs.readFileSync(groundTruthPath, 'utf8');
  
  // Compare
  if (generatedVMF === groundTruth) {
    console.log(`✅ ${config.filename}`);
    passCount++;
  } else {
    console.log(`❌ ${config.filename} - Content mismatch`);
    failCount++;
    
    // Calculate diff details
    const genLines = generatedVMF.split('\n');
    const truthLines = groundTruth.split('\n');
    const sizeDiff = generatedVMF.length - groundTruth.length;
    const lineDiff = genLines.length - truthLines.length;
    
    failures.push({
      file: config.filename,
      reason: 'Content mismatch',
      details: {
        generatedSize: generatedVMF.length,
        groundTruthSize: groundTruth.length,
        sizeDiff: sizeDiff,
        generatedLines: genLines.length,
        groundTruthLines: truthLines.length,
        lineDiff: lineDiff
      }
    });
  }
}

console.log('\n' + '='.repeat(60));
console.log('📊 Validation Summary');
console.log('='.repeat(60));
console.log(`Total Files:   ${testConfigs.length}`);
console.log(`✅ Passed:     ${passCount}`);
console.log(`❌ Failed:     ${failCount}`);
console.log(`Success Rate:  ${((passCount / testConfigs.length) * 100).toFixed(1)}%`);

if (failCount > 0) {
  console.log('\n' + '='.repeat(60));
  console.log('❌ Failed Files Details');
  console.log('='.repeat(60));
  
  for (const failure of failures) {
    console.log(`\n${failure.file}:`);
    console.log(`  Reason: ${failure.reason}`);
    if (failure.details) {
      console.log(`  Generated:    ${failure.details.generatedLines.toLocaleString()} lines, ${failure.details.generatedSize.toLocaleString()} bytes`);
      console.log(`  Ground Truth: ${failure.details.groundTruthLines.toLocaleString()} lines, ${failure.details.groundTruthSize.toLocaleString()} bytes`);
      console.log(`  Difference:   ${failure.details.lineDiff > 0 ? '+' : ''}${failure.details.lineDiff} lines, ${failure.details.sizeDiff > 0 ? '+' : ''}${failure.details.sizeDiff} bytes`);
    }
  }
  
  console.log('\n⚠️  Some tests failed. The current code produces different output than ground truth.');
  console.log('This could indicate:');
  console.log('  - A regression in the generator code');
  console.log('  - Intentional changes that require updating ground truth files');
  console.log('  - Floating point precision differences');
  process.exit(1);
} else {
  console.log('\n✅ All tests passed! Current code matches ground truth perfectly.');
  process.exit(0);
}

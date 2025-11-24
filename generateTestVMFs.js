import { SurfRampGenerator } from './src/lib/surfRampGenerator.js';
import fs from 'fs';
import path from 'path';

// Create output directory
const outputDir = './test-vmf-files';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Helper function to save VMF file
function saveVMF(filename, vmfGenerator) {
  const vmfContent = vmfGenerator.generate();
  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(filePath, vmfContent, 'utf8');
  console.log(`✓ Generated: ${filename}`);
}

// Test configurations
console.log('🚀 Generating test VMF files...\n');

// ====================
// SINGLE RAMPS - BASIC WEDGE STYLE
// ====================
console.log('📦 Single Ramps - Wedge Style:');

// 1. Single Right Ramp - Both Surf
{
  const generator = new SurfRampGenerator({
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
  });
  
  const vmf = generator.generateVMF();
  saveVMF('01_single_right_both_wedge.vmf', vmf);
}

// 2. Single Left Ramp - Both Surf
{
  const generator = new SurfRampGenerator({
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
  });
  
  const vmf = generator.generateVMF();
  saveVMF('02_single_left_both_wedge.vmf', vmf);
}

// 3. Single Right Ramp - Right Surf Only
{
  const generator = new SurfRampGenerator({
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
  });
  
  const vmf = generator.generateVMF();
  saveVMF('03_single_right_right_surf_wedge.vmf', vmf);
}

// 4. Single Right Ramp - Left Surf Only
{
  const generator = new SurfRampGenerator({
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
  });
  
  const vmf = generator.generateVMF();
  saveVMF('04_single_right_left_surf_wedge.vmf', vmf);
}

// 5. Single Up Ramp
{
  const generator = new SurfRampGenerator({
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
  });
  
  const vmf = generator.generateVMF();
  saveVMF('05_single_up_wedge.vmf', vmf);
}

// 6. Single Down Ramp
{
  const generator = new SurfRampGenerator({
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
  });
  
  const vmf = generator.generateVMF();
  saveVMF('06_single_down_wedge.vmf', vmf);
}

// 7. Single Dip Ramp
{
  const generator = new SurfRampGenerator({
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
  });
  
  const vmf = generator.generateVMF();
  saveVMF('07_single_dip_wedge.vmf', vmf);
}

// 8. Single Arc Ramp
{
  const generator = new SurfRampGenerator({
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
  });
  
  const vmf = generator.generateVMF();
  saveVMF('08_single_arc_wedge.vmf', vmf);
}

// ====================
// SINGLE RAMPS - THIN STYLE
// ====================
console.log('\n📦 Single Ramps - Thin Style:');

// 9. Single Right Ramp - Thin Style
{
  const generator = new SurfRampGenerator({
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
  });
  
  const vmf = generator.generateVMF();
  saveVMF('09_single_right_thin.vmf', vmf);
}

// 10. Single Right Ramp - Thin Style - Thick Variant
{
  const generator = new SurfRampGenerator({
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
  });
  
  const vmf = generator.generateVMF();
  saveVMF('10_single_right_thin_thick.vmf', vmf);
}

// 11. Single Right Ramp - Thin Style - Single Surf (Right)
{
  const generator = new SurfRampGenerator({
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
  });
  
  const vmf = generator.generateVMF();
  saveVMF('11_single_right_thin_right_surf.vmf', vmf);
}

// ====================
// SMOOTHNESS VARIATIONS
// ====================
console.log('\n📦 Smoothness Variations:');

// 12. Low Smoothness (3 segments)
{
  const generator = new SurfRampGenerator({
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
  });
  
  const vmf = generator.generateVMF();
  saveVMF('12_smoothness_low_3.vmf', vmf);
}

// 13. Medium Smoothness (8 segments)
{
  const generator = new SurfRampGenerator({
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
  });
  
  const vmf = generator.generateVMF();
  saveVMF('13_smoothness_medium_8.vmf', vmf);
}

// 14. High Smoothness (32 segments)
{
  const generator = new SurfRampGenerator({
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
  });
  
  const vmf = generator.generateVMF();
  saveVMF('14_smoothness_high_32.vmf', vmf);
}

// 15. Very High Smoothness (64 segments)
{
  const generator = new SurfRampGenerator({
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
  });
  
  const vmf = generator.generateVMF();
  saveVMF('15_smoothness_very_high_64.vmf', vmf);
}

// ====================
// ANGLE VARIATIONS
// ====================
console.log('\n📦 Angle Variations:');

// 16. 45 Degree Turn
{
  const generator = new SurfRampGenerator({
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
  });
  
  const vmf = generator.generateVMF();
  saveVMF('16_angle_45_degrees.vmf', vmf);
}

// 17. 180 Degree Turn
{
  const generator = new SurfRampGenerator({
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
  });
  
  const vmf = generator.generateVMF();
  saveVMF('17_angle_180_degrees.vmf', vmf);
}

// 18. 270 Degree Turn
{
  const generator = new SurfRampGenerator({
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
  });
  
  const vmf = generator.generateVMF();
  saveVMF('18_angle_270_degrees.vmf', vmf);
}

// 19. 360 Degree Loop
{
  const generator = new SurfRampGenerator({
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
  });
  
  const vmf = generator.generateVMF();
  saveVMF('19_angle_360_loop.vmf', vmf);
}

// 20. Straight (0 degree)
{
  const generator = new SurfRampGenerator({
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
  });
  
  const vmf = generator.generateVMF();
  saveVMF('20_angle_0_straight.vmf', vmf);
}

// ====================
// SIZE VARIATIONS
// ====================
console.log('\n📦 Size Variations:');

// 21. Small Size
{
  const generator = new SurfRampGenerator({
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
  });
  
  const vmf = generator.generateVMF();
  saveVMF('21_size_512_small.vmf', vmf);
}

// 22. Large Size
{
  const generator = new SurfRampGenerator({
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
  });
  
  const vmf = generator.generateVMF();
  saveVMF('22_size_2048_large.vmf', vmf);
}

// ====================
// WIDTH/HEIGHT VARIATIONS
// ====================
console.log('\n📦 Width/Height Variations:');

// 23. Wide & Short
{
  const generator = new SurfRampGenerator({
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
  });
  
  const vmf = generator.generateVMF();
  saveVMF('23_wide_short.vmf', vmf);
}

// 24. Narrow & Tall
{
  const generator = new SurfRampGenerator({
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
  });
  
  const vmf = generator.generateVMF();
  saveVMF('24_narrow_tall.vmf', vmf);
}

// ====================
// MULTIPLE CONNECTED RAMPS
// ====================
console.log('\n📦 Multiple Connected Ramps:');

// 25. Two Right Turns (S-Curve)
{
  const sharedParams = {
    rampName: 'two_right_turns',
    materialName: 'dev/dev_measuregeneric01',
    styleEnum: 'Wedge',
    surfEnum: 'Both',
    width: 256,
    height: 320,
    smoothness: 16,
    uvScale: 0.25
  };
  
  const rampConfigs = [
    { rampEnum: 'Right', angle: 90, size: 1024 },
    { rampEnum: 'Right', angle: 90, size: 1024 }
  ];
  
  const connectedRamps = SurfRampGenerator.generateConnectedRamps(sharedParams, rampConfigs, 'end');
  const vmf = SurfRampGenerator.generateConnectedVMF(connectedRamps);
  saveVMF('25_two_right_turns.vmf', vmf);
}

// 26. Three Connected Turns
{
  const sharedParams = {
    rampName: 'three_turns',
    materialName: 'dev/dev_measuregeneric01',
    styleEnum: 'Wedge',
    surfEnum: 'Both',
    width: 256,
    height: 320,
    smoothness: 16,
    uvScale: 0.25
  };
  
  const rampConfigs = [
    { rampEnum: 'Right', angle: 90, size: 1024 },
    { rampEnum: 'Right', angle: 90, size: 1024 },
    { rampEnum: 'Right', angle: 90, size: 1024 }
  ];
  
  const connectedRamps = SurfRampGenerator.generateConnectedRamps(sharedParams, rampConfigs, 'end');
  const vmf = SurfRampGenerator.generateConnectedVMF(connectedRamps);
  saveVMF('26_three_turns.vmf', vmf);
}

// 27. Right then Left (Zigzag)
{
  const sharedParams = {
    rampName: 'zigzag',
    materialName: 'dev/dev_measuregeneric01',
    styleEnum: 'Wedge',
    surfEnum: 'Both',
    width: 256,
    height: 320,
    smoothness: 16,
    uvScale: 0.25
  };
  
  const rampConfigs = [
    { rampEnum: 'Right', angle: 45, size: 1024 },
    { rampEnum: 'Left', angle: 45, size: 1024 }
  ];
  
  const connectedRamps = SurfRampGenerator.generateConnectedRamps(sharedParams, rampConfigs, 'end');
  const vmf = SurfRampGenerator.generateConnectedVMF(connectedRamps);
  saveVMF('27_zigzag_right_left.vmf', vmf);
}

// 28. Mixed Directions (Right, Up, Right)
{
  const sharedParams = {
    rampName: 'mixed_directions',
    materialName: 'dev/dev_measuregeneric01',
    styleEnum: 'Wedge',
    surfEnum: 'Both',
    width: 256,
    height: 320,
    smoothness: 16,
    uvScale: 0.25
  };
  
  const rampConfigs = [
    { rampEnum: 'Right', angle: 90, size: 1024 },
    { rampEnum: 'Up', angle: 45, size: 1024 },
    { rampEnum: 'Right', angle: 90, size: 1024 }
  ];
  
  const connectedRamps = SurfRampGenerator.generateConnectedRamps(sharedParams, rampConfigs, 'end');
  const vmf = SurfRampGenerator.generateConnectedVMF(connectedRamps);
  saveVMF('28_mixed_directions.vmf', vmf);
}

// 29. Spiral (Multiple connected turns)
{
  const sharedParams = {
    rampName: 'spiral',
    materialName: 'dev/dev_measuregeneric01',
    styleEnum: 'Wedge',
    surfEnum: 'Both',
    width: 256,
    height: 320,
    smoothness: 12,
    uvScale: 0.25
  };
  
  const rampConfigs = [
    { rampEnum: 'Right', angle: 90, size: 1024 },
    { rampEnum: 'Right', angle: 90, size: 1024 },
    { rampEnum: 'Right', angle: 90, size: 1024 },
    { rampEnum: 'Right', angle: 90, size: 1024 }
  ];
  
  const connectedRamps = SurfRampGenerator.generateConnectedRamps(sharedParams, rampConfigs, 'end');
  const vmf = SurfRampGenerator.generateConnectedVMF(connectedRamps);
  saveVMF('29_spiral_four_turns.vmf', vmf);
}

// 30. Complex Path with varying smoothness
{
  const sharedParams = {
    rampName: 'complex_path',
    materialName: 'dev/dev_measuregeneric01',
    styleEnum: 'Wedge',
    surfEnum: 'Both',
    width: 256,
    height: 320,
    smoothness: 16,
    uvScale: 0.25
  };
  
  const rampConfigs = [
    { rampEnum: 'Right', angle: 90, size: 1024, smoothness: 8 },
    { rampEnum: 'Down', angle: 45, size: 1024, smoothness: 16 },
    { rampEnum: 'Left', angle: 90, size: 1024, smoothness: 12 },
    { rampEnum: 'Up', angle: 45, size: 1024, smoothness: 20 }
  ];
  
  const connectedRamps = SurfRampGenerator.generateConnectedRamps(sharedParams, rampConfigs, 'end');
  const vmf = SurfRampGenerator.generateConnectedVMF(connectedRamps);
  saveVMF('30_complex_path_varying_smoothness.vmf', vmf);
}

// 31. Thin Style - Multiple Ramps
{
  const sharedParams = {
    rampName: 'thin_multiple',
    materialName: 'dev/dev_measuregeneric01',
    styleEnum: 'Thin',
    thickness: 32,
    surfEnum: 'Both',
    width: 256,
    height: 320,
    smoothness: 16,
    uvScale: 0.25
  };
  
  const rampConfigs = [
    { rampEnum: 'Right', angle: 90, size: 1024 },
    { rampEnum: 'Right', angle: 90, size: 1024 }
  ];
  
  const connectedRamps = SurfRampGenerator.generateConnectedRamps(sharedParams, rampConfigs, 'end');
  const vmf = SurfRampGenerator.generateConnectedVMF(connectedRamps);
  saveVMF('31_thin_multiple_ramps.vmf', vmf);
}

// 32. Single Surf Direction - Multiple Ramps
{
  const sharedParams = {
    rampName: 'single_surf_multiple',
    materialName: 'dev/dev_measuregeneric01',
    styleEnum: 'Wedge',
    surfEnum: 'Right',
    width: 256,
    height: 320,
    smoothness: 16,
    uvScale: 0.25
  };
  
  const rampConfigs = [
    { rampEnum: 'Right', angle: 90, size: 1024 },
    { rampEnum: 'Right', angle: 90, size: 1024 }
  ];
  
  const connectedRamps = SurfRampGenerator.generateConnectedRamps(sharedParams, rampConfigs, 'end');
  const vmf = SurfRampGenerator.generateConnectedVMF(connectedRamps);
  saveVMF('32_single_surf_multiple_ramps.vmf', vmf);
}

// 33. Arc and Dip Combined
{
  const sharedParams = {
    rampName: 'arc_dip_combo',
    materialName: 'dev/dev_measuregeneric01',
    styleEnum: 'Wedge',
    surfEnum: 'Both',
    width: 256,
    height: 320,
    smoothness: 16,
    uvScale: 0.25
  };
  
  const rampConfigs = [
    { rampEnum: 'Arc', angle: 90, size: 1024 },
    { rampEnum: 'Dip', angle: 90, size: 1024 }
  ];
  
  const connectedRamps = SurfRampGenerator.generateConnectedRamps(sharedParams, rampConfigs, 'end');
  const vmf = SurfRampGenerator.generateConnectedVMF(connectedRamps);
  saveVMF('33_arc_dip_combo.vmf', vmf);
}

// 34. Very Long Straight Ramp
{
  const generator = new SurfRampGenerator({
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
  });
  
  const vmf = generator.generateVMF();
  saveVMF('34_very_long_straight.vmf', vmf);
}

// 35. Tight Radius Turn
{
  const generator = new SurfRampGenerator({
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
  });
  
  const vmf = generator.generateVMF();
  saveVMF('35_tight_radius_turn.vmf', vmf);
}

console.log('\n✅ All test VMF files generated successfully!');
console.log(`📁 Files saved to: ${path.resolve(outputDir)}`);
console.log(`📊 Total files: 35`);


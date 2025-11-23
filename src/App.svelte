<script>
  import { onMount, onDestroy } from 'svelte';
  import { SurfRampGenerator } from './lib/surfRampGenerator.js';
  import { ThreeViewer } from './lib/threeViewer.js';
  import { TwoDViewer } from './lib/twoDViewer.js';

  let params = {
    rampName: 'ramp',
    materialName: 'dev/dev_measuregeneric01',
    styleEnum: 'Wedge',
    thickness: 32,
    surfEnum: 'Both',
    rampEnum: 'Right',
    width: 256,
    height: 320,
    smoothness: 16,
    angle: 90,
    size: 1024,
    uvScale: 0.25
  };

  $: slopeAngle = calculateSlopeAngle(params.width, params.height);
  let updatingFromSlope = false;

  function calculateSlopeAngle(width, height) {
    const halfWidth = width / 2;
    const angleRad = Math.atan2(height, halfWidth);
    const angleDeg = (angleRad * 180) / Math.PI;
    return Math.round(angleDeg * 100) / 100;
  }

  function updateDimensionsFromSlope(newSlopeAngle) {
    if (updatingFromSlope) return;
    updatingFromSlope = true;
    
    const angleRad = (newSlopeAngle * Math.PI) / 180;
    const halfWidth = params.width / 2;
    const newHeight = Math.round(Math.tan(angleRad) * halfWidth);
    
    params.height = Math.max(64, Math.min(1024, newHeight));
    
    generateRamp();
    updatingFromSlope = false;
  }

  function onWidthHeightChange() {
    if (!updatingFromSlope) {
      generateRamp();
    }
  }

  let threeContainer;
  let topViewCanvas;
  let frontViewCanvas;
  let sideViewCanvas;
  
  let threeViewer;
  let topViewer;
  let frontViewer;
  let sideViewer;
  let rampGenerator;

  onMount(() => {
    threeViewer = new ThreeViewer(threeContainer);
    topViewer = new TwoDViewer(topViewCanvas, 'top');
    frontViewer = new TwoDViewer(frontViewCanvas, 'front');
    sideViewer = new TwoDViewer(sideViewCanvas, 'side');
    
    generateRamp();
    
    window.addEventListener('resize', handleResize);
    handleResize();
  });

  onDestroy(() => {
    window.removeEventListener('resize', handleResize);
    if (threeViewer) {
      threeViewer.dispose();
    }
  });

  function handleResize() {
    if (threeViewer && threeContainer) {
      threeViewer.resize(threeContainer.clientWidth, threeContainer.clientHeight);
    }
    if (topViewer) topViewer.resize();
    if (frontViewer) frontViewer.resize();
    if (sideViewer) sideViewer.resize();
  }

  function generateRamp() {
    rampGenerator = new SurfRampGenerator(params);
    const geometryData = rampGenerator.getVisualizationData();
    
    threeViewer.updateRamp(geometryData);
    topViewer.updateGeometry(geometryData);
    frontViewer.updateGeometry(geometryData);
    sideViewer.updateGeometry(geometryData);
  }

  function downloadVMF() {
    if (!rampGenerator) {
      generateRamp();
    }
    
    const vmfGenerator = rampGenerator.generateVMF();
    const vmfContent = vmfGenerator.generate();
    
    const blob = new Blob([vmfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${params.rampName}.vmf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function setView(view) {
    if (threeViewer) {
      threeViewer.setCameraView(view);
    }
  }
</script>

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .app {
    display: flex;
    height: 100vh;
    width: 100vw;
  }

  .sidebar {
    width: 320px;
    background: #252525;
    border-right: 1px solid #333;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .sidebar h1 {
    font-size: 20px;
    margin-bottom: 10px;
    color: #4a9eff;
  }

  .section {
    border-top: 1px solid #333;
    padding-top: 15px;
  }

  .section-title {
    font-size: 12px;
    color: #4a9eff;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 12px;
    font-weight: 600;
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
  }

  .control-group label {
    font-size: 12px;
    color: #aaa;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .control-group input[type="range"] {
    width: 100%;
  }

  .control-group input[type="number"] {
    width: 100%;
    padding: 6px;
    background: #333;
    border: 1px solid #444;
    color: #e0e0e0;
    border-radius: 4px;
    font-size: 12px;
  }

  .control-group input[type="text"] {
    width: 100%;
    padding: 6px;
    background: #333;
    border: 1px solid #444;
    color: #e0e0e0;
    border-radius: 4px;
    font-size: 12px;
  }

  .control-group select {
    width: 100%;
    padding: 6px;
    background: #333;
    border: 1px solid #444;
    color: #e0e0e0;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
  }

  .control-group select option {
    background: #333;
    color: #e0e0e0;
  }

  .info-display {
    background: #1a1a1a;
    padding: 8px;
    border-radius: 4px;
    font-size: 11px;
    color: #4a9eff;
    margin-top: 4px;
  }

  .control-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  button {
    padding: 10px 20px;
    background: #4a9eff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background 0.2s;
  }

  button:hover {
    background: #3a8eef;
  }

  button:active {
    background: #2a7edf;
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .view-controls {
    padding: 10px;
    background: #252525;
    border-bottom: 1px solid #333;
    display: flex;
    gap: 10px;
  }

  .view-controls button {
    padding: 6px 12px;
    font-size: 12px;
    background: #333;
  }

  .view-controls button:hover {
    background: #444;
  }

  .view-controls button.active {
    background: #4a9eff;
  }

  .views-container {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 1px;
    background: #333;
  }

  .three-d-view {
    background: #1a1a1a;
    position: relative;
    overflow: hidden;
  }

  .three-d-view canvas {
    display: block;
    width: 100%;
    height: 100%;
  }

  .two-d-view {
    background: #1a1a1a;
    position: relative;
    overflow: hidden;
  }

  .two-d-view canvas {
    width: 100%;
    height: 100%;
    display: block;
  }

  .view-label {
    position: absolute;
    top: 8px;
    left: 8px;
    background: rgba(0, 0, 0, 0.7);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    color: #aaa;
    pointer-events: none;
  }
</style>

<div class="app">
  <div class="sidebar">
    <div>
      <h1>Surf Ramp Generator</h1>
      <small>made with ❤️ by Linkpad</small>
    </div>
    
    <div class="section">
      <div class="section-title">Names</div>
      <div class="control-group">
        <label>Ramp Name</label>
        <input type="text" bind:value={params.rampName} on:input={generateRamp} />
      </div>
      <div class="control-group">
        <label>Material Name</label>
        <input type="text" bind:value={params.materialName} on:input={generateRamp} />
      </div>
    </div>

    <div class="section">
      <div class="section-title">Slope Dimensions</div>
      <div class="control-row">
        <div class="control-group">
          <label>Width</label>
          <input type="range" min="64" max="1024" step="8" bind:value={params.width} on:input={onWidthHeightChange} />
          <input type="number" min="64" max="1024" step="8" bind:value={params.width} on:input={onWidthHeightChange} />
        </div>
        <div class="control-group">
          <label>Height</label>
          <input type="range" min="64" max="1024" step="8" bind:value={params.height} on:input={onWidthHeightChange} />
          <input type="number" min="64" max="1024" step="8" bind:value={params.height} on:input={onWidthHeightChange} />
        </div>
      </div>
      <div class="control-group">
        <label>Slope Angle: {slopeAngle}°</label>
        <input type="range" min="5" max="85" step="0.5" value={slopeAngle} on:input={(e) => updateDimensionsFromSlope(parseFloat(e.target.value))} />
        <input type="number" min="5" max="85" step="0.5" value={slopeAngle} on:input={(e) => updateDimensionsFromSlope(parseFloat(e.target.value))} />
      </div>
    </div>

    <div class="section">
      <div class="section-title">Ramp Properties</div>
      
      <div class="control-group">
        <label>Ramp Style</label>
        <select bind:value={params.styleEnum} on:change={generateRamp}>
          <option value="Wedge">Wedge</option>
          <option value="Thin">Thin</option>
        </select>
      </div>

      {#if params.styleEnum === 'Thin'}
        <div class="control-group">
          <label>Thickness</label>
          <input type="range" min="1" max="128" step="1" bind:value={params.thickness} on:input={generateRamp} />
          <input type="number" min="1" max="128" step="1" bind:value={params.thickness} on:input={generateRamp} />
        </div>
      {/if}

      <div class="control-group">
        <label>Surf Direction</label>
        <select bind:value={params.surfEnum} on:change={generateRamp}>
          <option value="Left">Left</option>
          <option value="Right">Right</option>
          <option value="Both">Both</option>
        </select>
      </div>

      <div class="control-group">
        <label>Ramp Direction</label>
        <select bind:value={params.rampEnum} on:change={generateRamp}>
          <option value="Left">Left</option>
          <option value="Right">Right</option>
          <option value="Up">Up</option>
          <option value="Down">Down</option>
          <option value="Dip">Dip</option>
          <option value="Arc">Arc</option>
        </select>
      </div>

      <div class="control-group">
        <label>Smoothness</label>
        <input type="range" min="3" max="128" step="1" bind:value={params.smoothness} on:input={generateRamp} />
        <input type="number" min="3" max="128" step="1" bind:value={params.smoothness} on:input={generateRamp} />
      </div>

      <div class="control-group">
        <label>Angle (degrees)</label>
        <input type="range" min="0" max="360" step="1" bind:value={params.angle} on:input={generateRamp} />
        <input type="number" min="0" max="360" step="1" bind:value={params.angle} on:input={generateRamp} />
      </div>

      <div class="control-group">
        <label>Size</label>
        <input type="range" min="0" max="2048" step="16" bind:value={params.size} on:input={generateRamp} />
        <input type="number" min="0" max="2048" step="16" bind:value={params.size} on:input={generateRamp} />
      </div>

      <div class="control-group">
        <label>UV Scale</label>
        <input type="range" min="0.05" max="10" step="0.05" bind:value={params.uvScale} on:input={generateRamp} />
        <input type="number" min="0.05" max="10" step="0.05" bind:value={params.uvScale} on:input={generateRamp} />
      </div>
    </div>

    <button on:click={downloadVMF}>Download VMF</button>
  </div>

  <div class="main-content">
    <div class="view-controls">
      <button on:click={() => setView('iso')}>Isometric</button>
      <button on:click={() => setView('top')}>Top</button>
      <button on:click={() => setView('front')}>Front</button>
      <button on:click={() => setView('side')}>Side</button>
    </div>

    <div class="views-container">
      <div class="three-d-view" bind:this={threeContainer}>
        <div class="view-label">3D View</div>
      </div>

      <div class="two-d-view">
        <canvas bind:this={topViewCanvas}></canvas>
        <div class="view-label">Top</div>
      </div>

      <div class="two-d-view">
        <canvas bind:this={frontViewCanvas}></canvas>
        <div class="view-label">Front</div>
      </div>

      <div class="two-d-view">
        <canvas bind:this={sideViewCanvas}></canvas>
        <div class="view-label">Side</div>
      </div>
    </div>
  </div>
</div>

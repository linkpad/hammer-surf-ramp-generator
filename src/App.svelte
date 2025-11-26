<script>
  import { onMount, onDestroy } from 'svelte';
  import { SurfRampGenerator } from './lib/surfRampGenerator.js';
  import { ThreeViewer } from './lib/threeViewer.js';
  import { TwoDViewer } from './lib/twoDViewer.js';

  // Shared parameters across all ramps
  let sharedParams = {
    rampName: 'ramp',
    materialName: 'dev/dev_measuregeneric01',
    styleEnum: 'Wedge',
    thickness: 32,
    surfEnum: 'Both',
    width: 256,
    height: 320,
    smoothness: 16,
    uvScale: 0.25,
    visualEntity: 'func_brush',
    baseHeight: 0,
    useVerticalBase: false
  };

  // Individual ramp configurations
  let ramps = [
    {
      id: 1,
      rampEnum: 'Right',
      angle: 90,
      size: 1024,
      smoothness: 16
    }
  ];

  let nextRampId = 2;
  let selectedRampIndex = 0;
  let connectionMode = 'end'; // 'start' or 'end'

  $: slopeAngle = calculateSlopeAngle(sharedParams.width, sharedParams.height);
  let updatingFromSlope = false;

  function calculateSlopeAngle(width, height) {
    const angleRad = Math.atan2(height, width);
    const angleDeg = (angleRad * 180) / Math.PI;
    return Math.round(angleDeg * 100) / 100;
  }

  function updateDimensionsFromSlope(newSlopeAngle) {
    if (updatingFromSlope) return;
    updatingFromSlope = true;
    
    const angleRad = (newSlopeAngle * Math.PI) / 180;
    const newHeight = Math.round(Math.tan(angleRad) * sharedParams.width);
    
    sharedParams.height = Math.max(64, Math.min(1024, newHeight));
    
    if (sharedParams.baseHeight >= sharedParams.height) {
      sharedParams.baseHeight = Math.max(0, sharedParams.height - 8);
    }
    
    generateAllRamps();
    updatingFromSlope = false;
  }

  function onWidthHeightChange() {
    if (!updatingFromSlope) {
      if (sharedParams.baseHeight >= sharedParams.height) {
        sharedParams.baseHeight = Math.max(0, sharedParams.height - 8);
      }
      generateAllRamps();
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
  let generatedRamps = null;

  onMount(() => {
    threeViewer = new ThreeViewer(threeContainer);
    topViewer = new TwoDViewer(topViewCanvas, 'top');
    frontViewer = new TwoDViewer(frontViewCanvas, 'front');
    sideViewer = new TwoDViewer(sideViewCanvas, 'side');
    
    generateAllRamps();
    
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

  function addRamp() {
    ramps = [...ramps, {
      id: nextRampId++,
      rampEnum: 'Right',
      angle: 90,
      size: 1024,
      smoothness: sharedParams.smoothness
    }];
    selectedRampIndex = ramps.length - 1;
    generateAllRamps();
  }

  function removeRamp(index) {
    if (ramps.length > 1) {
      ramps = ramps.filter((_, i) => i !== index);
      if (selectedRampIndex >= ramps.length) {
        selectedRampIndex = ramps.length - 1;
      }
      generateAllRamps();
    }
  }

  function selectRamp(index) {
    selectedRampIndex = index;
  }

  function generateAllRamps() {
    ramps = ramps.map(ramp => ({
      ...ramp,
      smoothness: ramp.smoothness !== undefined ? ramp.smoothness : sharedParams.smoothness
    }));
    
    generatedRamps = SurfRampGenerator.generateConnectedRamps(sharedParams, ramps, connectionMode);
    
    const combinedGeometry = {
      faces: generatedRamps.faces,
      geometry: generatedRamps.combinedGeometry
    };
    
    threeViewer.updateRamp(combinedGeometry);
    topViewer.updateGeometry(combinedGeometry);
    frontViewer.updateGeometry(combinedGeometry);
    sideViewer.updateGeometry(combinedGeometry);
  }

  function downloadVMF() {
    if (!generatedRamps || generatedRamps.ramps.length === 0) {
      generateAllRamps();
    }
    
    if (!generatedRamps || generatedRamps.ramps.length === 0) {
      return;
    }
    
    const vmfGenerator = SurfRampGenerator.generateConnectedVMF(generatedRamps);
    
    if (!vmfGenerator) {
      return;
    }
    
    const vmfContent = vmfGenerator.generate();
    
    const blob = new Blob([vmfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sharedParams.rampName}.vmf`;
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

  .add-ramp-btn {
    padding: 4px 8px;
    font-size: 11px;
    float: right;
    margin-top: -2px;
  }

  .ramps-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 12px;
    max-height: 400px;
    overflow-y: auto;
  }

  .ramp-item {
    background: #1a1a1a;
    border: 2px solid #333;
    border-radius: 4px;
    padding: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .ramp-item:hover {
    border-color: #4a9eff;
  }

  .ramp-item.selected {
    border-color: #4a9eff;
    background: #222;
  }

  .ramp-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .ramp-item-title {
    font-size: 12px;
    font-weight: 600;
    color: #4a9eff;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .delete-btn {
    padding: 2px 8px;
    font-size: 16px;
    background: #d32f2f;
    min-width: auto;
    line-height: 1;
  }

  .delete-btn:hover {
    background: #b71c1c;
  }

  .ramp-item-controls {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .ramp-item-summary {
    font-size: 11px;
    color: #888;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .checkbox-label input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
</style>

<div class="app">
  <div class="sidebar">
    <div>
      <h1>Surf Ramp Generator</h1>
      <small>made with ❤️ by Linkpad</small>
    </div>
    
    <div class="section">
      <div class="section-title">Shared Properties</div>
      <div class="control-group">
        <label>Base Name</label>
        <input type="text" bind:value={sharedParams.rampName} on:input={generateAllRamps} />
      </div>
      <div class="control-group">
        <label>Material Name</label>
        <input type="text" bind:value={sharedParams.materialName} on:input={generateAllRamps} />
      </div>
      <div class="control-group">
        <label>Visual Entity Type</label>
        <select bind:value={sharedParams.visualEntity} on:change={generateAllRamps}>
          <option value="func_brush">func_brush (never solid)</option>
          <option value="func_detail_illusionary">func_detail_illusionary</option>
        </select>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Slope Dimensions (Shared)</div>
      <div class="control-row">
        <div class="control-group">
          <label>Width</label>
          <input type="range" min="64" max="1024" step="8" bind:value={sharedParams.width} on:input={onWidthHeightChange} />
          <input type="number" min="64" max="1024" step="8" bind:value={sharedParams.width} on:input={onWidthHeightChange} />
        </div>
        <div class="control-group">
          <label>Height</label>
          <input type="range" min="64" max="1024" step="8" bind:value={sharedParams.height} on:input={onWidthHeightChange} />
          <input type="number" min="64" max="1024" step="8" bind:value={sharedParams.height} on:input={onWidthHeightChange} />
        </div>
      </div>
      <div class="control-group">
        <label>Slope Angle: {slopeAngle}°</label>
        <input type="range" min="5" max="85" step="0.5" value={slopeAngle} on:input={(e) => updateDimensionsFromSlope(parseFloat(e.target.value))} />
        <input type="number" min="5" max="85" step="0.5" value={slopeAngle} on:input={(e) => updateDimensionsFromSlope(parseFloat(e.target.value))} />
      </div>
      {#if sharedParams.styleEnum === 'Wedge'}
      <div class="control-group">
        <label>Base Height (0 = no base)</label>
        <input type="range" min="0" max={sharedParams.height - 1} step="8" bind:value={sharedParams.baseHeight} on:input={generateAllRamps} />
        <input type="number" min="0" max={sharedParams.height - 1} step="8" bind:value={sharedParams.baseHeight} on:input={generateAllRamps} />
      </div>
      {:else if sharedParams.styleEnum === 'Thin'}
      <div class="control-group">
        <label class="checkbox-label">
          <input type="checkbox" bind:checked={sharedParams.useVerticalBase} on:change={generateAllRamps} />
          Use Vertical Base
        </label>
      </div>
      {/if}
    </div>

    <div class="section">
      <div class="section-title">Ramp Style (Shared)</div>
      
      <div class="control-group">
        <label>Ramp Style</label>
        <select bind:value={sharedParams.styleEnum} on:change={generateAllRamps}>
          <option value="Wedge">Wedge</option>
          <option value="Thin">Thin</option>
        </select>
      </div>

      {#if sharedParams.styleEnum === 'Thin'}
        <div class="control-group">
          <label>Thickness</label>
          <input type="range" min="1" max="128" step="1" bind:value={sharedParams.thickness} on:input={generateAllRamps} />
          <input type="number" min="1" max="128" step="1" bind:value={sharedParams.thickness} on:input={generateAllRamps} />
        </div>
      {/if}

      <div class="control-group">
        <label>Surf Direction</label>
        <select bind:value={sharedParams.surfEnum} on:change={generateAllRamps}>
          <option value="Left">Left</option>
          <option value="Right">Right</option>
          <option value="Both">Both</option>
        </select>
      </div>

      <div class="control-group">
        <label>Default Smoothness (for new ramps)</label>
        <input type="range" min="3" max="128" step="1" bind:value={sharedParams.smoothness} />
        <input type="number" min="3" max="128" step="1" bind:value={sharedParams.smoothness} />
      </div>

      <div class="control-group">
        <label>UV Scale</label>
        <input type="range" min="0.05" max="10" step="0.05" bind:value={sharedParams.uvScale} on:input={generateAllRamps} />
        <input type="number" min="0.05" max="10" step="0.05" bind:value={sharedParams.uvScale} on:input={generateAllRamps} />
      </div>
    </div>

    <div class="section">
      <div class="section-title">
        Ramps List
        <button class="add-ramp-btn" on:click={addRamp}>+ Add Ramp</button>
      </div>
      
      <div class="control-group">
        <label>Connection Mode</label>
        <select bind:value={connectionMode} on:change={generateAllRamps}>
          <option value="end">Connect at End</option>
          <option value="start">Connect at Start</option>
        </select>
      </div>

      <div class="ramps-list">
        {#each ramps as ramp, index (ramp.id)}
          <div class="ramp-item" class:selected={selectedRampIndex === index} on:click={() => selectRamp(index)} on:keydown={(e) => e.key === 'Enter' && selectRamp(index)} role="button" tabindex="0">
            <div class="ramp-item-header">
              <span class="ramp-item-title">Ramp {index + 1}</span>
              {#if ramps.length > 1}
                <button class="delete-btn" on:click|stopPropagation={() => removeRamp(index)}>×</button>
              {/if}
            </div>
            
            {#if selectedRampIndex === index}
              <div class="ramp-item-controls">
                <div class="control-group">
                  <label>Ramp Direction</label>
                  <select bind:value={ramp.rampEnum} on:change={generateAllRamps}>
                    <option value="Straight">Straight</option>
                    <option value="Left">Left</option>
                    <option value="Right">Right</option>
                    <option value="Up">Up</option>
                    <option value="Down">Down</option>
                  </select>
                </div>

                {#if ramp.rampEnum !== 'Straight'}
                <div class="control-group">
                  <label>Angle (degrees)</label>
                  <input type="range" min="0" max="360" step="1" bind:value={ramp.angle} on:input={generateAllRamps} />
                  <input type="number" min="0" max="360" step="1" bind:value={ramp.angle} on:input={generateAllRamps} />
                </div>
                {/if}

                <div class="control-group">
                  <label>Size</label>
                  <input type="range" min="0" max="4096" step="16" bind:value={ramp.size} on:input={generateAllRamps} />
                  <input type="number" min="0" max="4096" step="16" bind:value={ramp.size} on:input={generateAllRamps} />
                </div>

                {#if ramp.rampEnum !== 'Straight'}
                <div class="control-group">
                  <label>Smoothness</label>
                  <input type="range" min="3" max="128" step="1" bind:value={ramp.smoothness} on:input={generateAllRamps} />
                  <input type="number" min="3" max="128" step="1" bind:value={ramp.smoothness} on:input={generateAllRamps} />
                </div>
                {/if}
              </div>
            {:else}
              <div class="ramp-item-summary">
                <div>{ramp.rampEnum}{ramp.rampEnum !== 'Straight' ? ` • ${ramp.angle}° • ${ramp.smoothness} segs` : ''} • {ramp.size}u</div>
              </div>
            {/if}
          </div>
        {/each}
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

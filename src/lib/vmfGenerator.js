export class VMFGenerator {
  constructor() {
    this.versionInfo = {
      editorversion: "400",
      editorbuild: "8400",
      mapversion: "1",
      formatversion: "100",
      prefab: "0"
    };
    this.world = {
      id: "1",
      classname: "worldspawn",
      solids: [],
      groups: []
    };
    this.entities = [];
    this._globalId = 2;
  }

  getNextId() {
      const id = this._globalId;
      this._globalId++;
      return String(id);
  }

  getNextGroupId() {
      return this.getNextId();
  }
  
  getNextSolidId() {
      return this.getNextId();
  }
  
  getNextEntityId() {
      return this.getNextId();
  }
  
  getNextSideId() {
      return this.getNextId();
  }
  
  addGroup(id) {
      if (!this.world.groups.find(g => g.id === String(id))) {
          this.world.groups.push({
              id: String(id),
              editor: {}
          });
      }
  }

  addSolid(sides) {
    const solid = {
      id: this.getNextSolidId(),
      sides: sides.map((side, index) => ({
        id: this.getNextSideId(),
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
          color: "220 220 220",
          visgroupshown: "1",
          visgroupautoshown: "1"
      }
    };
    this.world.solids.push(solid);
  }

  generate() {
    let vmf = `versioninfo\n{\n`;
    for (const [key, value] of Object.entries(this.versionInfo)) {
      vmf += `\t"${key}" "${value}"\n`;
    }
    vmf += `}\n\n`;

    vmf += `visgroups\n{\n}\n\n`;

    vmf += `viewsettings\n{\n`;
    vmf += `\t"bSnapToGrid" "1"\n`;
    vmf += `\t"bShowGrid" "1"\n`;
    vmf += `\t"bShowLogicalGrid" "0"\n`;
    vmf += `\t"nGridSpacing" "64"\n`;
    vmf += `\t"bShow3DGrid" "0"\n`;
    vmf += `}\n\n`;

    vmf += `world\n{\n`;
    vmf += `\t"id" "${this.world.id}"\n`;
    vmf += `\t"mapversion" "1"\n`;
    vmf += `\t"classname" "${this.world.classname}"\n`;
    vmf += `\t"skyname" "sky_day01_01"\n`;
    vmf += `\t"maxpropscreenwidth" "-1"\n`;
    vmf += `\t"detailvbsp" "detail.vbsp"\n`;
    vmf += `\t"detailmaterial" "detail/detailsprites"\n`;
    
    for (const solid of this.world.solids) {
      vmf += `\tsolid\n\t{\n`;
      vmf += `\t\t"id" "${solid.id}"\n`;
      for (const side of solid.sides) {
        vmf += `\t\tside\n\t\t{\n`;
        vmf += `\t\t\t"id" "${side.id}"\n`;
        vmf += `\t\t\t"plane" "${side.plane}"\n`;
        
        if (side.vertices && side.vertices.length > 0) {
            vmf += `\t\t\tvertices_plus\n\t\t\t{\n`;
            for (const v of side.vertices) {
                vmf += `\t\t\t\t"v" "${v[0]} ${v[1]} ${v[2]}"\n`;
            }
            vmf += `\t\t\t}\n`;
        }

        vmf += `\t\t\t"material" "${side.material}"\n`;
        vmf += `\t\t\t"uaxis" "${side.uaxis}"\n`;
        vmf += `\t\t\t"vaxis" "${side.vaxis}"\n`;
        vmf += `\t\t\t"rotation" "${side.rotation}"\n`;
        vmf += `\t\t\t"lightmapscale" "${side.lightmapscale}"\n`;
        vmf += `\t\t\t"smoothing_groups" "${side.smoothing_groups}"\n`;
        vmf += `\t\t}\n`;
      }
      
      // Add editor block for solid
      if (solid.editor) {
          vmf += `\t\teditor\n\t\t{\n`;
          vmf += `\t\t\t"color" "${solid.editor.color}"\n`;
          vmf += `\t\t\t"visgroupshown" "${solid.editor.visgroupshown}"\n`;
          vmf += `\t\t\t"visgroupautoshown" "${solid.editor.visgroupautoshown}"\n`;
          if (solid.editor.groupid) {
              vmf += `\t\t\t"groupid" "${solid.editor.groupid}"\n`;
          }
          vmf += `\t\t}\n`;
      }

      vmf += `\t}\n`;
    }
    
    if (this.world.groups && this.world.groups.length > 0) {
        for (const group of this.world.groups) {
            vmf += `\tgroup\n\t{\n`;
            vmf += `\t\t"id" "${group.id}"\n`;
            vmf += `\t\teditor\n\t\t{\n`;
            vmf += `\t\t\t"color" "192 192 0"\n`;
            vmf += `\t\t\t"visgroupshown" "1"\n`;
            vmf += `\t\t\t"visgroupautoshown" "1"\n`;
            vmf += `\t\t}\n`;
            vmf += `\t}\n`;
        }
    }
    
    vmf += `}\n\n`;

    for (const entity of this.entities) {
      vmf += `entity\n{\n`;
      for (const [key, value] of Object.entries(entity)) {
        if (key === 'solids') {
             for (const solid of value) {
                vmf += `\tsolid\n\t{\n`;
                vmf += `\t\t"id" "${solid.id}"\n`;
                for (const side of solid.sides) {
                    vmf += `\t\tside\n\t\t{\n`;
                    vmf += `\t\t\t"id" "${side.id}"\n`;
                    vmf += `\t\t\t"plane" "${side.plane}"\n`;
                    if (side.vertices && side.vertices.length > 0) {
                        vmf += `\t\t\tvertices_plus\n\t\t\t{\n`;
                        for (const v of side.vertices) {
                            vmf += `\t\t\t\t"v" "${v[0]} ${v[1]} ${v[2]}"\n`;
                        }
                        vmf += `\t\t\t}\n`;
                    }
                    vmf += `\t\t\t"material" "${side.material}"\n`;
                    vmf += `\t\t\t"uaxis" "${side.uaxis}"\n`;
                    vmf += `\t\t\t"vaxis" "${side.vaxis}"\n`;
                    vmf += `\t\t\t"rotation" "${side.rotation}"\n`;
                    vmf += `\t\t\t"lightmapscale" "${side.lightmapscale}"\n`;
                    vmf += `\t\t\t"smoothing_groups" "${side.smoothing_groups}"\n`;
                    vmf += `\t\t}\n`;
                }
                if (solid.editor) {
                    vmf += `\t\teditor\n\t\t{\n`;
                    vmf += `\t\t\t"color" "${solid.editor.color}"\n`;
                    vmf += `\t\t\t"visgroupshown" "${solid.editor.visgroupshown}"\n`;
                    vmf += `\t\t\t"visgroupautoshown" "${solid.editor.visgroupautoshown}"\n`;
                    vmf += `\t\t}\n`;
                }
                vmf += `\t}\n`;
             }
        } else if (key !== 'id') {
          vmf += `\t"${key}" "${value}"\n`;
        } else {
          vmf += `\t"id" "${value}"\n`;
        }
      }
      vmf += `}\n`;
    }

    vmf += `cameras\n{\n`;
    vmf += `\t"activecamera" "-1"\n`;
    vmf += `}\n`;

    vmf += `cordons\n{\n`;
    vmf += `\t"mins" "(-10240 -10240 -10240)"\n`;
    vmf += `\t"maxs" "(10240 10240 10240)"\n`;
    vmf += `\t"active" "0"\n`;
    vmf += `}\n`;

    return vmf;
  }

  formatPlane(p1, p2, p3) {
    const f = (v) => {
        return v; 
    };
    return `(${f(p1[0])} ${f(p1[1])} ${f(p1[2])}) (${f(p2[0])} ${f(p2[1])} ${f(p2[2])}) (${f(p3[0])} ${f(p3[1])} ${f(p3[2])})`;
  }

  calculateUVAxis(p1, p2, p3, scale = 0.25) {
    const v1 = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
    const v2 = [p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]];
    
    const nx = v1[1] * v2[2] - v1[2] * v2[1];
    const ny = v1[2] * v2[0] - v1[0] * v2[2];
    const nz = v1[0] * v2[1] - v1[1] * v2[0];
    
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
    const anx = Math.abs(nx / len);
    const any = Math.abs(ny / len);
    const anz = Math.abs(nz / len);
    
    let uaxis, vaxis;
    
    if (anz >= anx && anz >= any) {
      uaxis = `[1 0 0 0] ${scale}`;
      vaxis = `[0 -1 0 0] ${scale}`;
    } else if (anx >= any && anx >= anz) {
      uaxis = `[0 1 0 0] ${scale}`;
      vaxis = `[0 0 -1 0] ${scale}`;
    } else {
      uaxis = `[1 0 0 0] ${scale}`;
      vaxis = `[0 0 -1 0] ${scale}`;
    }
    
    return { uaxis, vaxis };
  }
}


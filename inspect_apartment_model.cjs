const fs = require('fs');
const path = require('path');
const THREE = require('three');
const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js');
const { MeshoptDecoder } = require('three/examples/jsm/libs/meshopt_decoder.module.js');

async function inspect(modelPath) {
  console.log(`\n========================================`);
  console.log(`Inspecting: ${modelPath}`);
  console.log(`========================================`);

  const buffer = fs.readFileSync(modelPath);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);

  return new Promise((resolve, reject) => {
    loader.parse(
      arrayBuffer,
      '',
      gltf => {
        const scene = gltf.scene;
        console.log(`Loaded successfully! Scene children: ${scene.children.length}`);

        // Full bounding box of model as-is
        const fullBox = new THREE.Box3().setFromObject(scene);
        const fullSize = new THREE.Vector3();
        fullBox.getSize(fullSize);
        console.log(`Full Model Bounding Box: min=(${fullBox.min.x.toFixed(3)}, ${fullBox.min.y.toFixed(3)}, ${fullBox.min.z.toFixed(3)}) max=(${fullBox.max.x.toFixed(3)}, ${fullBox.max.y.toFixed(3)}, ${fullBox.max.z.toFixed(3)})`);
        console.log(`Full Model Dimensions: Width(X)=${fullSize.x.toFixed(3)}m, Height(Y)=${fullSize.y.toFixed(3)}m, Depth(Z)=${fullSize.z.toFixed(3)}m`);

        const meshes = [];
        scene.traverse(node => {
          if (node.isMesh) {
            const b = new THREE.Box3().setFromObject(node);
            const s = new THREE.Vector3();
            b.getSize(s);
            meshes.push({
              name: node.name,
              parentName: node.parent ? node.parent.name : null,
              materialName: node.material ? (Array.isArray(node.material) ? node.material.map(m=>m.name).join(',') : node.material.name) : 'none',
              min: b.min,
              max: b.max,
              size: s,
              vertexCount: node.geometry ? node.geometry.attributes.position.count : 0,
            });
          }
        });

        console.log(`Total Meshes found: ${meshes.length}`);
        
        // Find meshes with large dimensions (potential walls, ceilings, slabs)
        console.log(`\n--- Large Meshes (> 5m in any dimension) ---`);
        meshes.filter(m => m.size.x > 5 || m.size.z > 5 || m.size.y > 2.5).forEach(m => {
          console.log(`- Mesh: "${m.name}", Parent: "${m.parentName}", Mat: "${m.materialName}", Size: (${m.size.x.toFixed(2)}, ${m.size.y.toFixed(2)}, ${m.size.z.toFixed(2)}), Y-Range: [${m.min.y.toFixed(2)} to ${m.max.y.toFixed(2)}], Z-Range: [${m.min.z.toFixed(2)} to ${m.max.z.toFixed(2)}]`);
        });

        // Find dining table / chairs meshes
        console.log(`\n--- Dining Table & Chairs Candidates ---`);
        meshes.filter(m => /table|chair|dining/i.test(m.name) || /table|chair|dining/i.test(m.parentName || '') || /table|chair|dining/i.test(m.materialName)).forEach(m => {
          console.log(`- Table/Chair: "${m.name}", Parent: "${m.parentName}", Mat: "${m.materialName}", Size: (${m.size.x.toFixed(2)}, ${m.size.y.toFixed(2)}, ${m.size.z.toFixed(2)}), Center: (${((m.min.x+m.max.x)/2).toFixed(2)}, ${((m.min.y+m.max.y)/2).toFixed(2)}, ${((m.min.z+m.max.z)/2).toFixed(2)})`);
        });

        // Find bedroom / bed / duvet / pillows meshes
        console.log(`\n--- Bed & Bedding Candidates ---`);
        meshes.filter(m => /bed|duvet|pillow|blanket|mattress|sheet/i.test(m.name) || /bed|duvet|pillow|blanket|mattress|sheet/i.test(m.parentName || '') || /bed|duvet|pillow|blanket|mattress|sheet/i.test(m.materialName)).forEach(m => {
          console.log(`- Bedding: "${m.name}", Parent: "${m.parentName}", Mat: "${m.materialName}", Size: (${m.size.x.toFixed(2)}, ${m.size.y.toFixed(2)}, ${m.size.z.toFixed(2)}), Center: (${((m.min.x+m.max.x)/2).toFixed(2)}, ${((m.min.y+m.max.y)/2).toFixed(2)}, ${((m.min.z+m.max.z)/2).toFixed(2)})`);
        });

        resolve({ scene, meshes, fullBox, fullSize });
      },
      err => reject(err)
    );
  });
}

async function main() {
  await inspect(path.resolve(__dirname, 'public/models/modern_apartment_optimized.glb'));
}

main().catch(console.error);

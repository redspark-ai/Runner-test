import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { VRMAnimationLoaderPlugin, createVRMAnimationClip, VRMLookAtQuaternionProxy } from '@pixiv/three-vrm-animation';
const W = 960, H = 540, TOTAL = 15;
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H); document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x1b1f2a);
const camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 20);
camera.position.set(0, 1.0, 3.8); camera.lookAt(0, 0.85, 0);
const light = new THREE.DirectionalLight(0xffffff, Math.PI); light.position.set(1, 1, 1); scene.add(light);
const floor = new THREE.Mesh(new THREE.CircleGeometry(1.2, 48), new THREE.MeshBasicMaterial({ color: 0x2c3345 }));
floor.rotation.x = -Math.PI / 2; scene.add(floor);
const loader = new GLTFLoader();
loader.register(p => new VRMLoaderPlugin(p)); loader.register(p => new VRMAnimationLoaderPlugin(p));
let vrm, mixer; const acts = [];
window.setup = async (names) => {
  const g = await loader.loadAsync('model.vrm'); vrm = g.userData.vrm;
  VRMUtils.rotateVRM0(vrm); scene.add(vrm.scene);
  if (vrm.lookAt) { const p = new VRMLookAtQuaternionProxy(vrm.lookAt); p.name = 'VRMLookAtQuaternionProxy'; vrm.scene.add(p); }
  mixer = new THREE.AnimationMixer(vrm.scene);
  for (const n of names) {
    const ag = await loader.loadAsync('anim/' + n);
    const a = mixer.clipAction(createVRMAnimationClip(ag.userData.vrmAnimations[0], vrm));
    a.play(); acts.push(a);
  }
};
window.renderAt = (t) => {
  const slotLen = TOTAL / acts.length, slot = Math.min(acts.length - 1, Math.floor(t / slotLen));
  const local = t - slot * slotLen;
  acts.forEach((a, i) => { a.enabled = i === slot; a.weight = 1; if (i === slot) a.time = local % a.getClip().duration; });
  mixer.update(0); vrm.update(0);
  renderer.render(scene, camera);
  return renderer.domElement.toDataURL('image/jpeg', 0.95);
};

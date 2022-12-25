import '../css/style.css'
import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { gsap, Circ } from "gsap";
import vertexSource from "./shader/vertexShader.glsl?raw";
import fragmentSource from "./shader/fragmentShader.glsl?raw";

import img01 from '../images/photo01.jpg';
import img02 from '../images/photo02.jpg';
import img03 from '../images/photo03.jpg';
import imgDisp from '../images/displacement.jpg';

let renderer, scene, camera, geometry, mesh;

const canvas = document.querySelector("#canvas");

let size = {
  width: window.innerWidth,
  height: window.innerHeight
};

async function init(){

  // レンダラー
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(size.width, size.height);

  //シーン
  scene = new THREE.Scene();

  //カメラ
  //ウインドウとWebGL座標を一致させる
  const fov = 45;
  const fovRadian = (fov / 2) * (Math.PI / 180); //視野角をラジアンに変換
  const distance = (size.height / 2) / Math.tan(fovRadian); //ウインドウぴったりのカメラ距離
  camera = new THREE.PerspectiveCamera(fov, size.width / size.height, 1, distance * 2);
  camera.position.z = distance;
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(camera);

  //コントローラー
  // const controls = new OrbitControls(camera, canvas);
  // controls.enableDamping = true;

  //ジオメトリ
  geometry = new THREE.PlaneGeometry(size.width, size.height, 40, 40);
  // geometry = new THREE.PlaneBufferGeometry(2, 2);

  //テクスチャ
  const loader = new THREE.TextureLoader();
  const texture01 = await loader.loadAsync(img01);
  const texture02 = await loader.loadAsync(img02);
  const texture03 = await loader.loadAsync(img03);
  const textureDisp = await loader.loadAsync(imgDisp);

  //GLSL用データ
  let uniforms = {
    uTime: {
      value: 0.0
    },
    uTexCurrent: {
      value: texture01
    },
    uTexNext: {
      value: texture02
    },
    uTexDisp: {
      value: textureDisp
    },
    uResolution: {
      value: new THREE.Vector2(size.width, size.height)
    },
    uTexResolution: {
      value: new THREE.Vector2(2048, 1024)
    },
    uProgress: {
      value: 0.0
    },
  };

  //マテリアル
  const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexSource,
    fragmentShader: fragmentSource,
    side: THREE.DoubleSide
  });

  //メッシュ
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  //Progress
  const tl = gsap.timeline({ repeat: -1 });
  tl.to(uniforms.uProgress, {
    value: 1.0,
    duration: 1.2,
    delay: 4,
    ease: Circ.easeInOut,
    onComplete: ()=>{
      uniforms.uTexCurrent.value = texture02;
      uniforms.uTexNext.value = texture03;
      uniforms.uProgress.value = 0.0;
    },
  })
  .to(uniforms.uProgress, {
    value: 1.0,
    duration: 1.2,
    delay: 4,
    ease: Circ.easeInOut,
    onComplete: ()=>{
      uniforms.uTexCurrent.value = texture03;
      uniforms.uTexNext.value = texture01;
      uniforms.uProgress.value = 0.0;
    },
  })
  .to(uniforms.uProgress, {
    value: 1.0,
    duration: 1.2,
    delay: 4,
    ease: Circ.easeInOut,
    onComplete: ()=>{
      uniforms.uTexCurrent.value = texture01;
      uniforms.uTexNext.value = texture02;
      uniforms.uProgress.value = 0.0;
    },
  });


  function animate(){
    //アニメーション処理

    uniforms.uTime.value += 0.03;
    
    //レンダリング
    renderer.render(scene, camera);
    // controls.update();
    requestAnimationFrame(animate);
  }
  animate();
  
}

init();

// ラジアンに変換
// function radian(val) {
//   return (val * Math.PI) / 180;
// }

// ランダムな数
// function random(min, max) {
//   return Math.random() * (max - min) + min;
// }

//リサイズ
function onWindowResize() {
  // レンダラーのサイズを修正
  renderer.setSize(window.innerWidth, window.innerHeight);
  // カメラのアスペクト比を修正
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  size.width = window.innerWidth;
  size.height = window.innerHeight;
  // mesh.material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onWindowResize);

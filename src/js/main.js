import '../css/style.css'
import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { gsap, Circ } from "gsap";
import vertexSource from "./shader/vertexShader.glsl?raw";
import fragmentSource from "./shader/fragmentShader.glsl?raw";

import img01 from '../images/photo01.jpg';
import img02 from '../images/photo02.jpg';
import img03 from '../images/photo03.jpg';
import imgDisp1 from '../images/1.jpg';
import imgDisp2 from '../images/2.jpg';
import imgDisp3 from '../images/3.jpg';
import imgDisp4 from '../images/4.jpg';
import imgDisp5 from '../images/5.jpg';
import imgDisp6 from '../images/6.jpg';

let renderer, scene, camera, fovRadian, distance, geometry, mesh;

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
  fovRadian = (fov / 2) * (Math.PI / 180); //視野角をラジアンに変換
  distance = (size.height / 2) / Math.tan(fovRadian); //ウインドウぴったりのカメラ距離
  camera = new THREE.PerspectiveCamera(fov, size.width / size.height, 1, distance * 2);
  camera.position.z = distance;
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(camera);

  //コントローラー
  // const controls = new OrbitControls(camera, canvas);
  // controls.enableDamping = true;

  //ジオメトリ
  geometry = new THREE.PlaneGeometry(size.width, size.height, 40, 40);

  //テクスチャ
  const loader = new THREE.TextureLoader();
  const texture01 = await loader.loadAsync(img01);
  const texture02 = await loader.loadAsync(img02);
  const texture03 = await loader.loadAsync(img03);

  const textureDispArry = [
    await loader.loadAsync(imgDisp1),
    await loader.loadAsync(imgDisp2),
    await loader.loadAsync(imgDisp3),
    await loader.loadAsync(imgDisp4),
    await loader.loadAsync(imgDisp5),
    await loader.loadAsync(imgDisp6)
  ];

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
      value: textureDispArry[0]
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
    duration: 0.8,
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
    duration: 0.8,
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
    duration: 0.8,
    delay: 4,
    ease: Circ.easeInOut,
    onComplete: ()=>{
      uniforms.uTexCurrent.value = texture01;
      uniforms.uTexNext.value = texture02;
      uniforms.uProgress.value = 0.0;
    },
  });

  //change displacement
  function changeDisp(num){
    uniforms.uTexDisp.value = textureDispArry[num];
    navBtns.forEach((navBtn)=>{
      navBtn.classList.remove('is-active');
    });
  }
  const navBtns = document.querySelectorAll('button');
  navBtns.forEach((navBtn)=>{
    navBtn.addEventListener('click', (e)=>{
      let num = Number(navBtn.dataset.effect);
      changeDisp(num);
      e.target.classList.add('is-active');
    });
  })


  function animate(){
    //アニメーション処理

    uniforms.uTime.value += 0.03;

    // mesh.geometry.verticesNeedUpdate = true;
    
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
  size.width = window.innerWidth;
  size.height = window.innerHeight;
  // レンダラーのサイズを修正
  renderer.setSize(size.width, size.height);
  // カメラのアスペクト比を修正
  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
  distance = (size.height / 2) / Math.tan(fovRadian);
  camera.position.z = distance;

  mesh.material.uniforms.uResolution.value.set(size.width, size.height);
  // const scaleX = size.width / mesh.geometry.parameters.width + 0.01;
  // const scaleY = size.height / mesh.geometry.parameters.height + 0.01;
  const scaleX = Math.round(size.width / mesh.geometry.parameters.width * 100) / 100 + 0.01;
  const scaleY = Math.round(size.height / mesh.geometry.parameters.height * 100) / 100 + 0.01;

  mesh.scale.set(scaleX, scaleY, 1);

}
window.addEventListener("resize", onWindowResize);

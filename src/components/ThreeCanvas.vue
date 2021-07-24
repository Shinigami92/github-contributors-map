<template lang="pug">
#canvas
</template>

<script lang="ts">
import {
  AmbientLight,
  Mesh,
  MeshPhongMaterial,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  SpotLight,
  WebGLRenderer
} from 'three';
import { defineComponent, onMounted } from 'vue';

export default defineComponent({
  name: 'ThreeCanvas',
  setup() {
    const width: number = 480;
    const height: number = 360;

    const scene: Scene = new Scene();
    const camera: PerspectiveCamera = new PerspectiveCamera(75, width / height, 0.1, 1000);

    const renderer: WebGLRenderer = new WebGLRenderer();
    renderer.setSize(width, height);

    const geometry: SphereGeometry = new SphereGeometry(2, 32, 32);
    const material: MeshPhongMaterial = new MeshPhongMaterial({ color: 0x4080ff, dithering: true });
    const cube: Mesh<SphereGeometry, MeshPhongMaterial> = new Mesh(geometry, material);
    scene.add(cube);

    const ambient: AmbientLight = new AmbientLight(0xffffff, 0.1);
    scene.add(ambient);

    const spotLight: SpotLight = new SpotLight(0xffffff, 1);
    spotLight.position.set(40, 15, 40);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.1;
    spotLight.decay = 2;
    spotLight.distance = 200;

    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 512;
    spotLight.shadow.mapSize.height = 512;
    spotLight.shadow.camera.near = 10;
    spotLight.shadow.camera.far = 200;
    spotLight.shadow.focus = 1;
    scene.add(spotLight);

    camera.position.z = 5;

    function animate(): void {
      requestAnimationFrame(animate);

      cube.rotation.y -= 0.001;

      renderer.render(scene, camera);
    }
    animate();

    onMounted(() => {
      document.getElementById('canvas')!.appendChild(renderer.domElement);
    });

    return {};
  }
});
</script>

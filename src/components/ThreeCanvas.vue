<template lang="pug">
label(for="rotation-speed") Rotation speed:
input#rotation-speed(
  v-model.number="rotationSpeed",
  name="rotation-speed",
  type="number",
  placeholder="0.001",
  step="0.0001"
)
#canvas
</template>

<script lang="ts">
import type { User } from '@/shared/User';
import {
  AmbientLight,
  CircleGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  Object3D,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  SpotLight,
  TextureLoader,
  Vector3,
  WebGLRenderer
} from 'three';
import type { PropType, Ref } from 'vue';
import { defineComponent, onMounted, ref, watch } from 'vue';

function calcPosFromLatLonRad(radius: number, lat: number, lng: number): Vector3 {
  const phi: number = (90 - lat) * (Math.PI / 180);
  const theta: number = (lng + 180) * (Math.PI / 180);

  const vector: Vector3 = new Vector3();

  vector.x = -(radius * Math.sin(phi) * Math.cos(theta));
  vector.z = radius * Math.sin(phi) * Math.sin(theta);
  vector.y = radius * Math.cos(phi);

  return vector;
}

export default defineComponent({
  name: 'ThreeCanvas',
  props: {
    users: { type: Array as PropType<User[]>, required: true }
  },
  setup(props) {
    const width: number = 960;
    const height: number = 540;

    const scene: Scene = new Scene();
    const camera: PerspectiveCamera = new PerspectiveCamera(75, width / height, 0.1, 1000);

    const renderer: WebGLRenderer = new WebGLRenderer();
    renderer.setSize(width, height);

    const parentObj: Object3D = new Object3D();
    scene.add(parentObj);
    let globe: Mesh<SphereGeometry, MeshPhongMaterial> | undefined;
    const loader: TextureLoader = new TextureLoader();
    loader.load('textures/world-map.jpg', (texture) => {
      const geometry: SphereGeometry = new SphereGeometry(2.5, 32, 32);
      const material: MeshPhongMaterial = new MeshPhongMaterial({ map: texture, dithering: true });
      globe = new Mesh(geometry, material);
      parentObj.add(globe);
    });

    watch(
      () => props.users,
      (users) => {
        users
          .filter((user) => Boolean(user.geolocation))
          .forEach((user) => {
            const { lat, lng } = user.geolocation!;
            const pos: Vector3 = calcPosFromLatLonRad(2.6, lat, lng);

            loader.load(user.avatarUrl, (texture) => {
              const geometry: CircleGeometry = new CircleGeometry(0.2, 32);
              const material: MeshBasicMaterial = new MeshBasicMaterial({ map: texture });
              const circle: Mesh<CircleGeometry, MeshBasicMaterial> = new Mesh(geometry, material);
              circle.position.set(pos.x, pos.y, pos.z);
              parentObj.add(circle);
            });
          });
      }
    );

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

    const rotationSpeed: Ref<number> = ref(0.001);
    function animate(): void {
      requestAnimationFrame(animate);

      if (globe) {
        parentObj.rotation.y -= rotationSpeed.value;
        for (const child of parentObj.children) {
          if (child instanceof Mesh && child.geometry.type === 'CircleGeometry') {
            child.rotation.y += rotationSpeed.value;
          }
        }
      }

      renderer.render(scene, camera);
    }
    animate();

    onMounted(() => {
      document.getElementById('canvas')!.appendChild(renderer.domElement);
    });

    return { rotationSpeed };
  }
});
</script>

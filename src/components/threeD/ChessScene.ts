import {
  ACESFilmicToneMapping,
  EquirectangularReflectionMapping,
  Light,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  TextureLoader,
  WebGLRenderer,
} from "three";
import {
  GLTFLoader,
  OrbitControls,
} from "three/examples/jsm/Addons.js";
import botwChessSrc from "../../assets/botw-chess-002.glb?url";
import environmentMapSrc from "../../assets/bg-draft-stadium-001.jpg?url";

export class ChessScene {
  scene;
  camera;
  renderer;
  controls;

  constructor({ canvas }: { canvas: HTMLCanvasElement }) {
    this.render = this.render.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);

    this.camera = new PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.25,
      200
    );
    this.camera.position.set(7, 1, 12);
    this.scene = new Scene();

    this.renderer = new WebGLRenderer({ antialias: true, canvas });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;

    new TextureLoader().load(environmentMapSrc, (texture) => {
      texture.mapping = EquirectangularReflectionMapping;
      texture.colorSpace = SRGBColorSpace

      this.scene.background = texture;
      this.scene.environment = texture;
      this.scene.environmentIntensity = 0.2;

      this.render();

      // model
    });

    const loader = new GLTFLoader();
    loader.load(botwChessSrc, async (gltf) => {
      const model = gltf.scene;

      for (const child of gltf.scene.children) {
        if ((child as Light).isLight) {
          (child as Light).intensity = 100;
          child.parent?.remove(child);
        }
      }

      // wait until the model can be added to the scene without blocking due to shader compilation
      await this.renderer.compileAsync(model, this.camera, this.scene);

      this.scene.add(model);

      this.render();
    });

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.addEventListener("change", this.render); // use if there is no animation loop
    this.controls.minDistance = 2;
    this.controls.maxDistance = 100;
    this.controls.target.set(0, 0, -0.2);
    this.controls.update();

    window.addEventListener("resize", this.onWindowResize);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.render();
  }
}

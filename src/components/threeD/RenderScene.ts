import {
  ACESFilmicToneMapping,
  Clock,
  PerspectiveCamera,
  Scene,
  Vector2,
  WebGLRenderer,
} from "three";
import {
  BokehPass,
  EffectComposer,
  FilmPass,
  GammaCorrectionShader,
  OrbitControls,
  RenderPass,
  ShaderPass,
  SMAAPass,
  SSRPass,
  UnrealBloomPass,
  VignetteShader,
} from "three/examples/jsm/Addons.js";
import { Tween } from "three/examples/jsm/libs/tween.module.js";
import GameStats from "gamestats.js";
import { START_CAMERA } from "../../conf";

const stats = new GameStats({
  // targetFPS: 60
});
document.body.appendChild(stats.dom);

export class RenderScene {
  scene;
  camera;
  renderer;
  controls;
  clock;
  composer;
  tweens: Tween<any>[] = [];
  disposeList: (() => void)[] = [];
  bokehPass: BokehPass;
  onReady;

  hq;

  constructor({
    canvas,
    hq,
    onReady,
  }: {
    canvas: HTMLCanvasElement;
    hq: boolean;
    onReady: () => void;
  }) {
    this.render = this.render.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.tick = this.tick.bind(this);

    this.onReady = onReady;
    this.hq = hq;
    this.clock = new Clock();

    this.camera = new PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.25,
      200
    );
    this.camera.position.set(
      START_CAMERA.cameraPosition.x,
      START_CAMERA.cameraPosition.y,
      START_CAMERA.cameraPosition.z
    );
    this.scene = new Scene();

    this.renderer = new WebGLRenderer({
      antialias: false,
      canvas,
      powerPreference: hq ? "default" : "high-performance",
    });
    this.renderer.setPixelRatio(
      hq ? window.devicePixelRatio : Math.min(window.devicePixelRatio, 2)
    );
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.disposeList.push(() => this.renderer.dispose());

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.minDistance = 2;
    this.controls.maxDistance = 100;
    this.controls.target.set(
      START_CAMERA.targetPosition.x,
      START_CAMERA.targetPosition.y,
      START_CAMERA.targetPosition.z
    );
    this.controls.update();
    this.disposeList.push(() => this.controls.dispose());

    const { composer, bokehPass } = this.initPostProcess();
    this.composer = composer;
    this.bokehPass = bokehPass;
    this.focus = START_CAMERA.focus;
    this.aperture = START_CAMERA.aperture;
    this.maxblur = START_CAMERA.maxblur;

    window.addEventListener("resize", this.onWindowResize);

    this.disposeList.push(() => {
      this.tweens = [];
    });
  }

  start() {
    this.tick();
    this.onReady();
    this.renderer.setAnimationLoop(this.tick);
  }

  initPostProcess() {
    const shaderVignette = VignetteShader;

    const effectVignette = new ShaderPass(shaderVignette);
    effectVignette.uniforms["offset"].value = 0;
    effectVignette.uniforms["darkness"].value = 0.95;
    this.disposeList.push(() => effectVignette.dispose());

    const gammaCorrection = new ShaderPass(GammaCorrectionShader);
    this.disposeList.push(() => gammaCorrection.dispose());

    const bloomPass = new UnrealBloomPass(
      new Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    bloomPass.threshold = 1;
    bloomPass.strength = 1;
    bloomPass.radius = 0;
    this.disposeList.push(() => bloomPass.dispose());

    // const bokehPass = new BokehPass2({ scene: this.scene, camera: this.camera });
    const bokehPass = new BokehPass(this.scene, this.camera, {
      focus: 5.0,
      aperture: 0.005,
      maxblur: 0.01,
    });
    this.disposeList.push(() => bokehPass.dispose());

    console.log(bokehPass);

    const effectFilm = new FilmPass(0.05);
    this.disposeList.push(() => effectFilm.dispose());

    // const effectFilmBW = new FilmPass(0.35, true);
    // const effectDotScreen = new DotScreenPass(new Vector2(0, 0), 0.5, 0.8);

    const composer = new EffectComposer(
      this.renderer
      // new WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      //   stencilBuffer: true,
      //   // samples: this.renderer.getPixelRatio() === 1 ? 8 : 0
      // })
    );
    this.disposeList.push(() => composer.dispose());

    if (this.hq) {
      const ssrPass = new SSRPass({
        renderer: this.renderer,
        scene: this.scene,
        camera: this.camera,
        width: innerWidth,
        height: innerHeight,
        groundReflector: null,
        selects: null,
      });
      ssrPass.distanceAttenuation = true;
      ssrPass.maxDistance = 5; // 2
      this.disposeList.push(() => ssrPass.dispose());
      composer.addPass(ssrPass);
    } else {
      const renderScene = new RenderPass(this.scene, this.camera);
      this.disposeList.push(() => renderScene.dispose());
      composer.addPass(renderScene);
    }

    if (this.renderer.getPixelRatio() <= 1 && this.hq) {
      const smaaPass = new SMAAPass();
      this.disposeList.push(() => smaaPass.dispose());
      composer.addPass(smaaPass);
    }

    composer.addPass(bokehPass);
    composer.addPass(bloomPass);
    composer.addPass(effectFilm);
    composer.addPass(effectVignette);

    // Hardware MSAA
    // if (window.devicePixelRatio < 2) {
    //   composer.renderTarget1.samples = 8;
    //   composer.renderTarget2.samples = 8;
    // }

    return { composer, bokehPass };
  }

  get focus() {
    return (this.bokehPass.uniforms as any).focus.value;
  }

  set focus(value: number) {
    (this.bokehPass.uniforms as any).focus.value = value;
  }

  get aperture() {
    return (this.bokehPass.uniforms as any).aperture.value;
  }

  set aperture(value: number) {
    (this.bokehPass.uniforms as any).aperture.value = value;
  }

  get maxblur() {
    return (this.bokehPass.uniforms as any).maxblur.value;
  }

  set maxblur(value: number) {
    (this.bokehPass.uniforms as any).maxblur.value = value;
  }

  addTween(tween: Tween<any>, onComplete?: () => void) {
    this.tweens.push(tween);
    tween.onComplete(() => {
      const i = this.tweens.indexOf(tween);
      this.tweens.splice(i, 0);

      if (onComplete) {
        onComplete();
      }
    });
    return tween.start();
  }

  tick() {
    stats.begin();
    for (let i = this.tweens.length - 1; i >= 0; i--) {
      this.tweens[i].update();
    }

    this.render();

    stats.end();
  }

  render() {
    // this.renderer.render(this.scene, this.camera);
    this.composer.render();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.composer.setSize(window.innerWidth, window.innerHeight);

    this.render();
  }

  dispose() {
    this.disposeList.forEach((callback) => callback());
  }
}

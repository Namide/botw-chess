import { Clock, PerspectiveCamera, Scene, Vector2, WebGLRenderer } from "three";
import {
  BokehPass,
  EffectComposer,
  FilmPass,
  GammaCorrectionShader,
  OrbitControls,
  RenderPass,
  SAOPass,
  ShaderPass,
  SMAAPass,
  SSRPass,
  UnrealBloomPass,
  VignetteShader,
} from "three/examples/jsm/Addons.js";
import { Tween } from "three/examples/jsm/libs/tween.module.js";
import GameStats from "gamestats.js";
import { DEBUG, START_CAMERA } from "../../conf";
import { Shadows } from "./Shadows";
// import { BokehPass as BokehPass2 } from "./BokehPass";

let stats: GameStats;

if (DEBUG) {
  stats = new GameStats({});
  document.body.appendChild(stats.dom);
}

/**
 * Generate 3D empty scene width post process
 */
export class RenderScene {
  scene;
  camera;
  renderer;
  controls;
  clock;
  composer;
  tweens: { type: "camera" | "piece" | "other"; tween: Tween<any> }[] = [];
  disposeList: (() => void)[] = [];
  bokehPass: BokehPass;
  onReady;
  shadows;
  ssrPass;
  smaaPass;

  constructor({
    canvas,
    onReady,
  }: {
    canvas: HTMLCanvasElement;
    onReady: () => void;
  }) {
    this.render = this.render.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.tick = this.tick.bind(this);

    this.onReady = onReady;
    this.clock = new Clock();

    const { aspect, fov } = this.getAspectFov();
    this.camera = new PerspectiveCamera(fov, aspect, 0.25, 200);
    this.camera.position.set(
      START_CAMERA.cameraPosition.x,
      START_CAMERA.cameraPosition.y,
      START_CAMERA.cameraPosition.z
    );
    this.scene = new Scene();

    this.renderer = new WebGLRenderer({
      antialias: false,
      canvas,
      powerPreference: "default",
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // this.renderer.outputColorSpace = SRGBColorSpace;
    // this.renderer.toneMapping = ACESFilmicToneMapping;
    // this.renderer.toneMappingExposure = 1;
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
    this.disposeList.push(() => this.controls?.dispose());

    if (!DEBUG) {
      this.controls.enabled = false;
    }

    const { composer, bokehPass, ssrPass, smaaPass } = this.initPostProcess();
    this.composer = composer;
    this.bokehPass = bokehPass;
    this.ssrPass = ssrPass;
    this.smaaPass = smaaPass;
    this.focus = START_CAMERA.focus;
    this.aperture = START_CAMERA.aperture;
    this.maxblur = START_CAMERA.maxblur;

    this.shadows = new Shadows({
      blur: 1,
      darkness: 20,
      opacity: 0.5,
      cameraHeight: 20,
      width: 22.8,
      height: 22.8,
    });
    this.scene.add(this.shadows);

    window.addEventListener("resize", this.onWindowResize);

    this.disposeList.push(() => {
      this.tweens = [];
    });
  }

  async start() {
    this.renderer.compile(this.scene, this.camera);

    // Drop frames to stabilize GPU (to fix Chrome)
    for (let i = 0; i < 5; i++) {
      this.tick();
      await new Promise((resolve) => requestAnimationFrame(() => resolve(1)));
    }

    const times: { calcul: number; wait: number; fps: number }[] = [];
    let beforeTime: number, elapsedTime: number, waitTime: number;

    // Calculate times
    for (let i = 0; i < 5; i++) {
      beforeTime = performance.now();
      this.tick();
      elapsedTime = performance.now();
      await new Promise((resolve) => requestAnimationFrame(() => resolve(1)));
      waitTime = performance.now();
      times.push({
        calcul: elapsedTime - beforeTime,
        wait: waitTime - elapsedTime,
        fps: 1000 / (waitTime - beforeTime),
      });
    }

    const worstTime = times.sort(((a, b) => a.fps - b.fps))[0]

    if (worstTime.fps < 30) {
      console.log('🐌 slow GPU, remove SSR and SMAA')
      this.increasePerformances()
    } else {
      console.log('🐇 fast GPU detected, keep SSR and SMAA')
    }

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
      0.5
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

    if (DEBUG) {
      console.log(bokehPass);
    }

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

    const renderPass = new RenderPass(this.scene, this.camera);
    composer.addPass(renderPass);

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
    ssrPass.blur = false; // 2
    this.disposeList.push(() => ssrPass.dispose());
    composer.addPass(ssrPass);

    const saoPass = new SAOPass(this.scene, this.camera);
    saoPass.params.saoKernelRadius = 25;
    saoPass.params.saoIntensity = 0.005;

    composer.addPass(saoPass);
    composer.addPass(bokehPass);
    // composer.addPass(gammaCorrection);

    let smaaPass: SMAAPass | undefined;
    if (this.renderer.getPixelRatio() <= 1) {
      smaaPass = new SMAAPass();
      this.disposeList.push(() => smaaPass?.dispose());
      composer.addPass(smaaPass);
    }

    // composer.addPass(bloomPass);
    composer.addPass(effectFilm);
    composer.addPass(effectVignette);

    // Hardware MSAA
    // if (window.devicePixelRatio < 2) {
    //   composer.renderTarget1.samples = 8;
    //   composer.renderTarget2.samples = 8;
    // }

    return { composer, bokehPass, ssrPass, smaaPass };
  }

  increasePerformances() {
    this.ssrPass.dispose();
    this.composer.removePass(this.ssrPass);

    if (this.smaaPass) {
      this.composer.removePass(this.smaaPass);
    }
    this.smaaPass?.dispose();
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

  removeTween(tween: Tween<any>) {
    const i = this.tweens.findIndex((data) => data.tween === tween);
    this.tweens.splice(i, 0);
  }

  clearTweens(type: "camera" | "piece" | "other") {
    for (const { tween } of this.tweens.filter((data) => data.type === type)) {
      tween.onUpdate(() => 0);
      tween.onComplete(() => 0);
      this.removeTween(tween);
    }
  }

  addTween(
    tween: Tween<any>,
    type: "camera" | "piece" | "other",
    onComplete?: () => void
  ) {
    this.tweens.push({ type, tween });
    tween.onComplete(() => {
      this.removeTween(tween);
      if (onComplete) {
        onComplete();
      }
    });
    return tween.start();
  }

  tick() {
    stats?.begin();

    for (let i = this.tweens.length - 1; i >= 0; i--) {
      this.tweens[i].tween.update();
    }

    this.shadows.tick({
      scene: this.scene,
      renderer: this.renderer,
    });

    this.render();

    stats?.end();
  }

  render() {
    // this.renderer.render(this.scene, this.camera);
    this.composer.render(1000 / 60);
  }

  getAspectFov() {
    const FOV = 45;
    const aspect = window.innerWidth / window.innerHeight;

    let fov;
    if (aspect < 1) {
      const fovHorizontalRad = (FOV * Math.PI) / 180;
      const fovVerticalRad =
        2 * Math.atan(Math.tan(fovHorizontalRad / 2) / aspect);
      fov = (fovVerticalRad * 180) / Math.PI;
    } else {
      fov = FOV;
    }

    return {
      aspect,
      fov,
    };
  }

  onWindowResize() {
    const { aspect, fov } = this.getAspectFov();

    this.camera.aspect = aspect;
    this.camera.fov = fov;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);

    this.render();
  }

  dispose() {
    this.disposeList.forEach((callback) => callback());
  }
}

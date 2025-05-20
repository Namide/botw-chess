import {
  ACESFilmicToneMapping,
  Clock,
  PerspectiveCamera,
  Scene,
  Vector2,
  WebGLRenderer,
} from "three";
import {
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
import { BokehPass } from "./BokehPass";


export class RenderScene {
  scene;
  camera;
  renderer;
  controls;
  clock;
  composer;
  tweens: Tween<any>[] = [];
  disposeList: (() => void)[] = [];

  constructor({ canvas }: { canvas: HTMLCanvasElement }) {
    this.render = this.render.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.tick = this.tick.bind(this);

    this.clock = new Clock();

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
    this.disposeList.push(() => this.renderer.dispose());

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.minDistance = 2;
    this.controls.maxDistance = 100;
    this.controls.target.set(0, 1, 0);
    this.controls.update();
    this.disposeList.push(() => this.controls.dispose());

    const { composer } = this.initPostProcess();
    this.composer = composer;

    window.addEventListener("resize", this.onWindowResize);

    this.renderer.setAnimationLoop(this.tick);

    this.disposeList.push(() => {
      this.tweens = [];
    });
  }

  // initBokeh() {
  //   const rtTextureDepth = new WebGLRenderTarget(
  //     window.innerWidth,
  //     window.innerHeight,
  //     { type: HalfFloatType }
  //   );
  //   const rtTextureColor = new WebGLRenderTarget(
  //     window.innerWidth,
  //     window.innerHeight,
  //     { type: HalfFloatType }
  //   );

  //   const shader = BokehShader;
  //   const uniforms = UniformsUtils.clone(shader.uniforms as any);
  //   uniforms["tColor"].value = rtTextureColor.texture;
  //   uniforms["tDepth"].value = rtTextureDepth.texture;
  //   uniforms["textureWidth"].value = window.innerWidth;
  //   uniforms["textureHeight"].value = window.innerHeight;

  //   const materialBokeh = new ShaderMaterial({
  //     uniforms: uniforms,
  //     vertexShader: shader.vertexShader,
  //     fragmentShader: shader.fragmentShader,
  //     defines: {
  //       RINGS: 1,
  //       SAMPLES: 4,
  //     },
  //   });

  //   const quad = new Mesh(
  //     new PlaneGeometry(window.innerWidth, window.innerHeight),
  //     materialBokeh
  //   );
  //   quad.position.z = -500;
  //   this.scene.add(quad);

  //   return {
  //     rtTextureDepth,
  //     rtTextureColor,
  //   };
  // }

  initPostProcess() {
    const renderScene = new RenderPass(this.scene, this.camera);
    this.disposeList.push(() => renderScene.dispose());
    // composerScene.addPass(renderBackground);
    // composerScene.addPass(renderScene);
    // composerScene.addPass(renderMaskInverse);
    // composerScene.addPass(effectHBlur);
    // composerScene.addPass(effectVBlur);
    // composerScene.addPass(clearMask);

    // const renderScene = new TexturePass(composerScene.renderTarget2.texture);

    // const shaderBleach = BleachBypassShader;
    // const shaderSepia = SepiaShader;
    const shaderVignette = VignetteShader;

    // const effectBleach = new ShaderPass(shaderBleach);
    // const effectSepia = new ShaderPass(shaderSepia);

    const effectVignette = new ShaderPass(shaderVignette);
    effectVignette.uniforms["offset"].value = 1.2;
    effectVignette.uniforms["darkness"].value = 0.95;
    this.disposeList.push(() => effectVignette.dispose());

    const gammaCorrection = new ShaderPass(GammaCorrectionShader);
    this.disposeList.push(() => gammaCorrection.dispose());

    // effectBleach.uniforms["opacity"].value = 0.95;

    // effectSepia.uniforms["amount"].value = 0.9;

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

    const bokehPass = new BokehPass({ scene: this.scene, camera: this.camera })
    this.disposeList.push(() => bokehPass.dispose());

    const effectFilm = new FilmPass(0.35);
    this.disposeList.push(() => effectFilm.dispose());

    // const effectFilmBW = new FilmPass(0.35, true);
    // const effectDotScreen = new DotScreenPass(new Vector2(0, 0), 0.5, 0.8);

    const smaaPass = new SMAAPass();
    this.disposeList.push(() => smaaPass.dispose());

    // const bokehPass = new BokehPass(this.scene, this.camera, {
    //   focus: 10,
    //   aperture: 0.001,
    //   maxblur: 0.02,
    // });
    // this.disposeList.push(() => bokehPass.dispose());

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
    ssrPass.maxDistance = 2;
    this.disposeList.push(() => ssrPass.dispose());

    const composer = new EffectComposer(
      this.renderer,
      // new WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      //   stencilBuffer: true,
      //   // samples: this.renderer.getPixelRatio() === 1 ? 8 : 0
      // })
    );
    this.disposeList.push(() => composer.dispose());

    // composer.addPass(renderScene);
    composer.addPass(ssrPass);
    composer.addPass(smaaPass);
    composer.addPass(bokehPass);
    composer.addPass(bloomPass);
    composer.addPass(effectFilm);
    // composer.addPass(clearMask);
    composer.addPass(effectVignette);

    // Hardware MSAA
    // if (window.devicePixelRatio < 2) {
    //   composer.renderTarget1.samples = 8;
    //   composer.renderTarget2.samples = 8;
    // }

    return { composer };
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
    for (let i = this.tweens.length - 1; i >= 0; i--) {
      this.tweens[i].update();
    }
    this.render();
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

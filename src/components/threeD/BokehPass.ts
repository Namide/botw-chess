import {
  HalfFloatType,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  UniformsUtils,
  WebGLRenderTarget,
  type WebGLRenderer,
} from "three";
import { FullScreenQuad, Pass } from "three/examples/jsm/Addons.js";
import {
  BokehShader,
  BokehDepthShader,
  type BokehShaderUniforms,
} from "three/examples/jsm/shaders/BokehShader2.js";
import { DEBUG } from "../../conf";

// Example: https://threejs.org/examples/?q=dof#webgl_postprocessing_dof2
// Example : https://github.com/mrdoob/three.js/blob/ed4a0fe55438c633817d1e07d5ee698cae156ed4/examples/jsm/postprocessing/FilmPass.js#L19
export class BokehPass extends Pass {
  focalDepth = 10;
  fstop = 10

  scene;
  camera;

  uniforms;
  material;
  materialDepth;
  fsQuad;

  rtTextureDepth;
  rtTextureColor;

  constructor({ scene, camera }: { scene: Scene; camera: PerspectiveCamera }) {
    super();

    this.scene = scene;
    this.camera = camera;

    this.rtTextureDepth = new WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      { type: HalfFloatType }
    );
    this.rtTextureColor = new WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      { type: HalfFloatType }
    );

    const shader = BokehShader;

    this.uniforms = UniformsUtils.clone(
      shader.uniforms as any
    ) as BokehShaderUniforms;
    this.uniforms["tDepth"].value = this.rtTextureDepth.texture;
    this.uniforms["textureWidth"].value = window.innerWidth;
    this.uniforms["textureHeight"].value = window.innerHeight;
    // this.uniforms['depthblur'].value = false

    // Vignette
    this.uniforms["vignetting"].value = true;
    this.uniforms["fstop"].value = this.fstop; // Blur gradiant

    // Enable focalDepth
    this.uniforms["shaderFocus"].value = false;
    this.uniforms["manualdof"].value = false; // Disable for better blur gradiant

    // Debug
    this.uniforms["showFocus"].value = DEBUG;

    // Blur
    this.uniforms["maxblur"].value = 3;
    this.uniforms["focalDepth"].value = this.focalDepth;

    this.uniforms["gain"].value = 1; // Light power (better bloom)

    this.uniforms["fringe"].value = 3.5; // RGB displace

    this.uniforms["noise"].value = true;

    this.material = new ShaderMaterial({
      uniforms: this.uniforms as any,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      defines: {
        RINGS: 2,
        SAMPLES: 4,
      },
    });

    const depthShader = BokehDepthShader;
    this.materialDepth = new ShaderMaterial({
      uniforms: depthShader.uniforms,
      vertexShader: depthShader.vertexShader,
      fragmentShader: depthShader.fragmentShader,
    });

    // ---

    this.fsQuad = new FullScreenQuad(this.material);
  }

  setSize(width: number, height: number) {
    this.rtTextureDepth.setSize(width, height);
    this.rtTextureColor.setSize(width, height);

    this.uniforms["textureWidth"].value = width;
    this.uniforms["textureHeight"].value = height;
  }

  // https://github.com/pmndrs/postprocessing/wiki/Custom-Passes
  render(
    renderer: WebGLRenderer,
    writeBuffer: WebGLRenderTarget,
    readBuffer: WebGLRenderTarget
    // deltaTime: number,
    // maskActive: boolean
  ) {
    // render depth into texture

    this.materialDepth.uniforms["mNear"].value = this.camera.near;
    this.materialDepth.uniforms["mFar"].value = this.camera.far;
    const saveSceneOverrideMaterial = this.scene.overrideMaterial;
    this.scene.overrideMaterial = this.materialDepth;
    renderer.setRenderTarget(this.rtTextureDepth);
    renderer.clear();
    renderer.render(this.scene, this.camera);
    this.scene.overrideMaterial = saveSceneOverrideMaterial;

    // render bokeh composite

    // this.uniforms["focalDepth"].value = Math.sin(Math.random() * Math.PI * 2) * 1000 + 1000;
    this.uniforms["focalDepth"].value = this.focalDepth;
    this.uniforms["fstop"].value = this.fstop;
    this.uniforms["tColor"].value = readBuffer.texture;

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      this.fsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear) renderer.clear();
      this.fsQuad.render(renderer);
    }
  }

  dispose() {
    super.dispose();
    this.material.dispose();
    this.materialDepth.dispose();
    this.fsQuad.dispose();
    this.rtTextureColor.dispose();
    this.rtTextureDepth.dispose();
  }
}

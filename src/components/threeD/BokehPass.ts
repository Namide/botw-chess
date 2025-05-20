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

// Example: https://threejs.org/examples/?q=dof#webgl_postprocessing_dof2
// Example : https://github.com/mrdoob/three.js/blob/ed4a0fe55438c633817d1e07d5ee698cae156ed4/examples/jsm/postprocessing/FilmPass.js#L19
export class BokehPass extends Pass {
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

    this.uniforms = UniformsUtils.clone(shader.uniforms as any) as BokehShaderUniforms;
    // this.uniforms["tColor"].value = this.rtTextureColor.texture;
    this.uniforms["tDepth"].value = this.rtTextureDepth.texture;
    this.uniforms["textureWidth"].value = window.innerWidth;
    this.uniforms["textureHeight"].value = window.innerHeight;
    // this.uniforms['depthblur'].value = true
    this.uniforms['vignetting'].value = true
    
    this.uniforms['maxblur'].value = 5
    this.uniforms['focalDepth'].value = 50
    this.uniforms['gain'].value = 2
    this.uniforms['fringe'].value = 5

    this.material = new ShaderMaterial({
      uniforms: this.uniforms as any,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      defines: {
        RINGS: 1,
        SAMPLES: 4,
      },
    });

    const depthShader = BokehDepthShader;
    this.materialDepth = new ShaderMaterial({
      uniforms: depthShader.uniforms,
      vertexShader: depthShader.vertexShader,
      fragmentShader: depthShader.fragmentShader,
    });
    this.materialDepth.uniforms["mNear"].value = camera.near;
    this.materialDepth.uniforms["mFar"].value = camera.far;

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
    readBuffer: WebGLRenderTarget,
    // deltaTime: number,
    // maskActive: boolean
  ) {

    // render depth into texture

    this.scene.overrideMaterial = this.materialDepth;
    renderer.setRenderTarget(this.rtTextureDepth);
    renderer.clear();
    renderer.render(this.scene, this.camera);
    this.scene.overrideMaterial = null;

    // render bokeh composite

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
    this.fsQuad.dispose()
    this.rtTextureColor.dispose();
    this.rtTextureDepth.dispose();
  }
}

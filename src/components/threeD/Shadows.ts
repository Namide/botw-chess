import {
  CameraHelper,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshDepthMaterial,
  MultiplyBlending,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import {
  HorizontalBlurShader,
  VerticalBlurShader,
} from "three/examples/jsm/Addons.js";
import { DEBUG } from "../../conf";

export class Shadows extends Group {
  blur;
  darkness;
  opacity;

  renderTarget;
  renderTargetBlur;

  blurPlane;
  horizontalBlurMaterial;
  verticalBlurMaterial;
  shadowCamera;
  plane;
  cameraHelper;
  depthMaterial;

  constructor({
    blur,
    darkness,
    opacity,
    width,
    height,
    cameraHeight,
  }: {
    blur: number;
    darkness: number;
    opacity: number;
    width: number;
    height: number;
    cameraHeight: number;
  }) {
    super();

    this.blur = blur;
    this.darkness = darkness;
    this.opacity = opacity;

    // the container, if you need to move the plane just move this
    // const shadowGroup = new Group();
    this.position.y = 0.03;

    // the render target that will show the shadows in the plane texture
    this.renderTarget = new WebGLRenderTarget(512, 512);
    this.renderTarget.texture.generateMipmaps = false;

    // the render target that we will use to blur the first render target
    this.renderTargetBlur = new WebGLRenderTarget(512, 512);
    this.renderTargetBlur.texture.generateMipmaps = false;

    // make a plane and make it face up
    const planeGeometry = new PlaneGeometry(width, height).rotateX(Math.PI / 2);
    const planeMaterial = new MeshBasicMaterial({
      map: this.renderTarget.texture,
      opacity,
      transparent: true,
      depthWrite: false,
    });
    this.plane = new Mesh(planeGeometry, planeMaterial);
    // make sure it's rendered after the fillPlane
    this.plane.renderOrder = 1;
    this.add(this.plane);

    // the y from the texture is flipped!
    this.plane.scale.y = -1;

    // the plane onto which to blur the texture
    this.blurPlane = new Mesh<PlaneGeometry, ShaderMaterial>(planeGeometry);
    this.blurPlane.visible = false;
    this.add(this.blurPlane);

    // the plane with the color of the ground
    const fillPlaneMaterial = new MeshBasicMaterial({
      color: "#ffffff",
      opacity,
      transparent: true,
      depthWrite: false,
      blending: MultiplyBlending
    });

    const fillPlane = new Mesh(planeGeometry, fillPlaneMaterial);
    fillPlane.rotateX(Math.PI);
    this.add(fillPlane);

    // the camera to render the depth material from
    this.shadowCamera = new OrthographicCamera(
      -width / 2,
      width / 2,
      height / 2,
      -height / 2,
      0,
      cameraHeight
    );
    this.shadowCamera.rotation.x = Math.PI / 2; // get the camera to look up
    this.add(this.shadowCamera);

    if (DEBUG) {
      this.cameraHelper = new CameraHelper(this.shadowCamera);
      this.add(this.cameraHelper)
    }

    // like MeshDepthMaterial, but goes from black to transparent
    this.depthMaterial = new MeshDepthMaterial();
    this.depthMaterial.userData.darkness = { value: darkness };
    this.depthMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.darkness = (this.depthMaterial as any).userData.darkness;
      shader.fragmentShader = /* glsl */ `
        uniform float darkness;
        ${shader.fragmentShader.replace(
          "gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );",
          "gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - fragCoordZ ) * darkness );"
        )}
      `;
    };

    this.depthMaterial.depthTest = false;
    this.depthMaterial.depthWrite = false;

    this.horizontalBlurMaterial = new ShaderMaterial(HorizontalBlurShader);
    this.horizontalBlurMaterial.depthTest = false;

    this.verticalBlurMaterial = new ShaderMaterial(VerticalBlurShader);
    this.verticalBlurMaterial.depthTest = false;
  }

  tick({ scene, renderer }: { scene: Scene; renderer: WebGLRenderer }) {

    this.depthMaterial.userData.darkness.value = this.darkness

    // remove the background
    const initialBackground = scene.background;
    scene.background = null;

    // force the depthMaterial to everything
    if (this.cameraHelper) {
      this.cameraHelper.visible = false;
    }
    scene.overrideMaterial = this.depthMaterial;

    // set renderer clear alpha
    const initialClearAlpha = renderer.getClearAlpha();
    renderer.setClearAlpha(0);

    // render to the render target to get the depths
    renderer.setRenderTarget(this.renderTarget);
    renderer.render(scene, this.shadowCamera);

    // and reset the override material
    scene.overrideMaterial = null;
    if (this.cameraHelper) {
      this.cameraHelper.visible = true;
    }

    this.blurShadow({ amount: this.blur, renderer });

    // a second pass to reduce the artifacts
    // (0.4 is the minimum blur amount so that the artifacts are gone)
    this.blurShadow({ amount: this.blur * 0.4, renderer });

    // reset and render the normal scene
    renderer.setRenderTarget(null);
    renderer.setClearAlpha(initialClearAlpha);
    scene.background = initialBackground;
  }

  blurShadow({
    amount,
    renderer,
  }: {
    amount: number;
    renderer: WebGLRenderer;
  }) {
    this.blurPlane.visible = true;

    // blur horizontally and draw in the renderTargetBlur
    this.blurPlane.material = this.horizontalBlurMaterial;
    this.blurPlane.material.uniforms.tDiffuse.value = this.renderTarget.texture;
    this.horizontalBlurMaterial.uniforms.h.value = (amount * 1) / 256;

    renderer.setRenderTarget(this.renderTargetBlur);
    renderer.render(this.blurPlane, this.shadowCamera);

    // blur vertically and draw in the main renderTarget
    this.blurPlane.material = this.verticalBlurMaterial;
    this.blurPlane.material.uniforms.tDiffuse.value =
      this.renderTargetBlur.texture;
    this.verticalBlurMaterial.uniforms.v.value = (amount * 1) / 256;

    renderer.setRenderTarget(this.renderTarget);
    renderer.render(this.blurPlane, this.shadowCamera);

    this.blurPlane.visible = false;
  }
}

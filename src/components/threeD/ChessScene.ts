import {
  EquirectangularReflectionMapping,
  Light,
  Material,
  Mesh,
  NoColorSpace,
  TextureLoader,
} from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import botwChessSrc from "../../assets/botw-chess-002.glb?url";
import environmentMapSrc from "../../assets/bg-draft-stadium-001.jpg?url";
import { shuffle } from "../../pure/shuffle";
import { Easing, Tween } from "three/examples/jsm/libs/tween.module.js";
import { RenderScene } from "./RenderScene";

const piecesNames = [
  "whiteKing",
  "whiteKnight1",
  "whiteBishop1",
  "whitePawn1",
  "whiteRook1",
  "whiteQueen",
  "whitePawn2",
  "whitePawn3",
  "whitePawn4",
  "whitePawn5",
  "whitePawn6",
  "whitePawn7",
  "whitePawn8",
  "whiteBishop2",
  "whiteKnight2",
  "whiteRook2",
  "blackKing",
  "blackKnight1",
  "blackBishop1",
  "blackPawn1",
  "blackRook1",
  "blackQueen",
  "blackBishop2",
  "blackKnight2",
  "blackRook2",
  "blackPawn2",
  "blackPawn3",
  "blackPawn4",
  "blackPawn5",
  "blackPawn6",
  "blackPawn7",
  "blackPawn8",
] as const;

export class ChessScene extends RenderScene {
  meshes?: {
    board: Mesh;
    whiteKing: Mesh;
    whiteKnight1: Mesh;
    whiteBishop1: Mesh;
    whitePawn1: Mesh;
    whiteRook1: Mesh;
    whiteQueen: Mesh;
    whitePawn2: Mesh;
    whitePawn3: Mesh;
    whitePawn4: Mesh;
    whitePawn5: Mesh;
    whitePawn6: Mesh;
    whitePawn7: Mesh;
    whitePawn8: Mesh;
    whiteBishop2: Mesh;
    whiteKnight2: Mesh;
    whiteRook2: Mesh;
    blackKing: Mesh;
    blackKnight1: Mesh;
    blackBishop1: Mesh;
    blackPawn1: Mesh;
    blackRook1: Mesh;
    blackQueen: Mesh;
    blackBishop2: Mesh;
    blackKnight2: Mesh;
    blackRook2: Mesh;
    blackPawn2: Mesh;
    blackPawn3: Mesh;
    blackPawn4: Mesh;
    blackPawn5: Mesh;
    blackPawn6: Mesh;
    blackPawn7: Mesh;
    blackPawn8: Mesh;
  };
  meshesPositions: { x: number; y: number; z: number }[][] = [];

  constructor({ canvas }: { canvas: HTMLCanvasElement }) {
    super({ canvas });

    new TextureLoader().load(environmentMapSrc, (texture) => {
      texture.mapping = EquirectangularReflectionMapping;
      texture.colorSpace = NoColorSpace;
      this.disposeList.push(() => texture.dispose());

      this.scene.background = texture;
      this.scene.environment = texture;
      this.scene.environmentIntensity = 0.8;

      this.render();

      // model
    });

    const loader = new GLTFLoader();
    loader.load(botwChessSrc, async (gltf) => {
      const model = gltf.scene;

      const meshes = {};

      for (const child of gltf.scene.children) {
        if ((child as Light).isLight) {
          (child as Light).intensity = 100;
          child.parent?.remove(child);
        } else {
          (meshes as any)[child.name] = child;
        }
      }

      this.meshes = meshes as typeof this.meshes;

      const { whiteRook1, blackRook2 } = this.meshes!;
      for (let i = 0; i < 8; i++) {
        this.meshesPositions[i] = [];
        for (let j = 0; j < 8; j++) {
          this.meshesPositions[i][j] = {
            x:
              (blackRook2.position.x - whiteRook1.position.x) * (j / 7) +
              whiteRook1.position.x,
            y: (blackRook2.position.y + whiteRook1.position.y) / 2,
            z:
              (blackRook2.position.z - whiteRook1.position.z) * (i / 7) +
              whiteRook1.position.z,
          };
        }
      }

      // wait until the model can be added to the scene without blocking due to shader compilation
      await this.renderer.compileAsync(model, this.camera, this.scene);

      this.scene.add(model);

      this.disposeList.push(() =>
        model.children.forEach((child) => {
          if ((child as Mesh).isMesh) {
            (child as Mesh).geometry.dispose();
            ((child as Mesh).material as Material).dispose();
          }
        })
      );

      this.render();
    });
  }

  change(_id: number) {
    if (!this.meshes) {
      return;
    }

    const DURATION = 2000;

    {
      this.controls.enabled = false;
      const startRads = Math.atan2(
        this.camera.position.z,
        this.camera.position.x
      );

      const startDist = Math.sqrt(
        this.camera.position.z ** 2 + this.camera.position.x ** 2
      );

      const CENTER_VIEW_DIST = 5;
      this.addTween(
        new Tween(
          [
            startRads,
            startDist,
            this.camera.position.y,
            ...this.controls.target.toArray(),
          ],
          false
        )
          .duration(DURATION)
          .easing(Easing.Exponential.InOut)
          .to(
            (() => {
              const dist = Math.random() * 6 + 3;
              const rads = startRads + Math.random() * Math.PI * 2 - Math.PI;
              return [
                rads,
                dist,
                Math.random() + 0.5,
                Math.random() * CENTER_VIEW_DIST - CENTER_VIEW_DIST / 2,
                1,
                Math.random() * CENTER_VIEW_DIST - CENTER_VIEW_DIST / 2,
              ];
            })()
          )
          .onUpdate(([rads, dist, elevation, targetX, targetY, targetZ]) => {
            this.camera.position.set(
              Math.cos(rads) * dist,
              elevation,
              Math.sin(rads) * dist
            );
            this.controls.target.set(targetX, targetY, targetZ);
            this.controls.update();
          }),
        () => (this.controls.enabled = true)
      );
    }

    const positions = this.meshesPositions.flat(2);
    shuffle(positions);
    for (const name of piecesNames) {
      const piece = this.meshes[name];
      if (!piece.userData.rot) {
        piece.userData.rot = [
          piece.rotation.x,
          piece.rotation.y,
          piece.rotation.z,
        ] as const;
      }
      this.addTween(
        new Tween([...piece.position.toArray(), ...piece.userData.rot], false)
          .to(
            [
              piece.position.x,
              piece.position.y + 10,
              piece.position.z,
              piece.userData.rot[0] + Math.PI * Math.random() - Math.PI / 2,
              piece.userData.rot[1] + Math.PI * Math.random() - Math.PI / 2,
              piece.userData.rot[2] + Math.PI * Math.random() - Math.PI / 2,
            ],
            DURATION / 4
          )
          .delay((Math.random() * DURATION) / 4)
          .easing(Easing.Exponential.In)
          .onUpdate(([x, y, z, rx, ry, rz]: number[]) => {
            piece.position.set(x, y, z);
            piece.rotation.set(rx, ry, rz);
          }),
        () => {
          if (Math.random() < 0.25) {
            const { x, y, z } = positions.shift()!;
            piece.position.x = x;
            piece.position.z = z;
            this.addTween(
              new Tween(
                [
                  ...piece.position.toArray(),
                  piece.rotation.x,
                  piece.rotation.y,
                  piece.rotation.z,
                ],
                false
              )
                .to([x, y, z, ...piece.userData.rot], DURATION / 4)
                .easing(Easing.Quadratic.Out)
                .onUpdate(([x, y, z, rx, ry, rz]: number[]) => {
                  piece.position.set(x, y, z);
                  piece.rotation.set(rx, ry, rz);
                })
            );
          } else {
            piece.rotation.set(
              ...(piece.userData.rot as [number, number, number])
            );
          }
        }
      );
    }
  }
}

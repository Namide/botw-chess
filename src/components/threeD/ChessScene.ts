import {
  BufferGeometry,
  EquirectangularReflectionMapping,
  Light,
  Material,
  Mesh,
  NoColorSpace,
  TextureLoader,
} from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import botwChessSrc from "../../assets/botw-chess-008.glb?url";
import environmentMapSrc from "../../assets/bg-3d.jpg?url";
import { shuffle } from "../../pure/shuffle";
import { Easing, Tween } from "three/examples/jsm/libs/tween.module.js";
import { RenderScene } from "./RenderScene";
import { lerp } from "three/src/math/MathUtils.js";
import { DEBUG, START_CAMERA, START_POSITIONS } from "../../conf";

const CLEAR_BOARD_DURATION = 2000;

const piecesNames = [
  "k",
  "n1",
  "b1",
  "p1",
  "r1",
  "q",
  "p2",
  "p3",
  "p4",
  "p5",
  "p6",
  "p7",
  "p8",
  "b2",
  "n2",
  "r2",
  "K",
  "N1",
  "B1",
  "P1",
  "R1",
  "Q",
  "B2",
  "N2",
  "R2",
  "P2",
  "P3",
  "P4",
  "P5",
  "P6",
  "P7",
  "P8",
] as const;
type PieceName = (typeof piecesNames)[number];

export class ChessScene extends RenderScene {
  meshes?: Record<
    "table" | "board" | PieceName,
    Mesh<BufferGeometry, Material>
  >;
  meshesPositions: { x: number; y: number; z: number }[][] = [];

  static instance: ChessScene;

  constructor({
    canvas,
    hq,
    onReady,
  }: {
    canvas: HTMLCanvasElement;
    hq: boolean;
    onReady: () => void;
  }) {
    super({ canvas, hq, onReady });

    ChessScene.instance = this;

    // DEBUG
    if (DEBUG) {
      let to: number;
      this.controls.addEventListener("change", () => {
        clearTimeout(to);
        to = setTimeout(() => {
          console.log(
            JSON.stringify(
              {
                cameraPosition: {
                  x: this.camera.position.x,
                  y: this.camera.position.y,
                  z: this.camera.position.z,
                },
                targetPosition: {
                  x: this.controls.target.x,
                  y: this.controls.target.y,
                  z: this.controls.target.z,
                },
                focus: this.focus,
                aperture: this.aperture,
                maxblur: this.maxblur,
              },
              undefined,
              2
            )
          );
        }, 500);
      });
    }

    Promise.all([this.loadBackground(), this.loadModel()]).then(() => {
      this.start();
    });

    // Model
  }

  async loadModel() {
    const loader = new GLTFLoader();

    return new Promise((resolve) => {
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
        for (let i = 0; i < 8; i++) {
          this.meshesPositions[i] = [];
          for (let j = 0; j < 8; j++) {
            this.meshesPositions[i][j] = {
              x:
                (this.meshes!.R2.position.x - this.meshes!.r2.position.x) *
                  (i / 7) +
                this.meshes!.r2.position.x,
              y: (this.meshes!.R2.position.y + this.meshes!.r2.position.y) / 2,
              z:
                (this.meshes!.R2.position.z - this.meshes!.r2.position.z) *
                  (j / 7) +
                this.meshes!.r2.position.z,
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

        this.moveCamera(START_CAMERA, 0);
        this.reset(START_POSITIONS, 0);

        // const meshTemp = new Mesh(
        //   new PlaneGeometry(3, 5),
        //   new MeshPhysicalMaterial( {
        // 	color: 0xEEEEEE,
        // 	metalness: 0,
        // 	roughness: 0.4,
        // 	ior: 1.5,
        // 	// alphaMap: texture,
        // 	// envMap: hdrEquirect,
        // 	// envMapIntensity: params.envMapIntensity,
        // 	transmission: 1, // use material.transmission for glass materials
        // 	specularIntensity: 1,
        // 	specularColor: 0xffffff,
        // 	opacity: 1,
        // 	side: DoubleSide,
        // 	transparent: true
        // } )
        // )
        // this.scene.add(meshTemp)

        // this.render();
        resolve(true);
      });
    });
  }

  async loadBackground() {
    return new Promise((resolve) => {
      new TextureLoader().load(environmentMapSrc, (texture) => {
        texture.mapping = EquirectangularReflectionMapping;
        texture.colorSpace = NoColorSpace;
        this.disposeList.push(() => texture.dispose());

        this.scene.environment = texture;
        this.scene.environmentIntensity = 1.5;

        // const skybox = new GroundedSkybox(texture, 22, 150);
        // skybox.position.y = 0;
        // this.scene.add(skybox);

        this.scene.background = texture;

        resolve(true);
        // this.render();
      });
    });
  }

  moveCamera(
    {
      cameraPosition = {
        x: lerp(
          this.meshes!.R2.position.x,
          this.meshes!.r1.position.x,
          Math.random()
        ),
        y: lerp(0.5, 1.5, Math.random()),
        z: lerp(
          this.meshes!.R2.position.z,
          this.meshes!.r1.position.z,
          Math.random()
        ),
      },
      targetPosition = {
        x: lerp(
          this.meshes!.R2.position.x,
          this.meshes!.r1.position.x,
          Math.random()
        ),
        y: 1,
        z: lerp(
          this.meshes!.R2.position.z,
          this.meshes!.r1.position.z,
          Math.random()
        ),
      },
      focus = 50,
      aperture = 0.005,
      maxblur = 0.01,
    }: {
      cameraPosition?: { x: number; y: number; z: number };
      targetPosition?: { x: number; y: number; z: number };
      focus?: number;
      aperture?: number;
      maxblur?: number;
    } = {},
    duration = CLEAR_BOARD_DURATION
  ) {
    const enabled = this.controls.enabled;
    this.controls.enabled = false;

    const startRads = Math.atan2(
      this.camera.position.z - this.controls.target.z,
      this.camera.position.x - this.controls.target.x
    );
    const startDist = Math.sqrt(
      (this.camera.position.z - this.controls.target.z) ** 2 +
        (this.camera.position.x - this.controls.target.x) ** 2
    );

    this.addTween(
      new Tween(
        [
          startRads,
          startDist,
          this.camera.position.y,
          ...this.controls.target.toArray(),
          this.focus,
          this.aperture,
          this.maxblur,
        ],
        false
      )
        .to(
          (() => {
            const rads = Math.atan2(
              cameraPosition.z - targetPosition.z,
              cameraPosition.x - targetPosition.x
            );

            const dist = Math.sqrt(
              (cameraPosition.z - targetPosition.z) ** 2 +
                (cameraPosition.x - targetPosition.x) ** 2
            );

            return [
              rads,
              dist,
              cameraPosition.y,
              targetPosition.x,
              targetPosition.y,
              targetPosition.z,
              focus,

              aperture,
              maxblur,
            ];
          })(),
          duration
        )
        .easing(Easing.Exponential.InOut)
        .onUpdate(
          ([
            rads,
            dist,
            elevation,
            targetX,
            targetY,
            targetZ,
            focus,
            aperture,
            maxblur,
          ]) => {
            this.camera.position.set(
              Math.cos(rads) * dist + this.controls.target.x,
              elevation,
              Math.sin(rads) * dist + this.controls.target.z
            );
            this.controls.target.set(targetX, targetY, targetZ);
            this.camera.lookAt(this.controls.target);
            // this.controls.update();
            this.focus = focus;
            this.aperture = aperture;
            this.maxblur = maxblur;
          }
        ),
      () => (this.controls.enabled = enabled)
    );
  }

  reset(positions: string, duration = CLEAR_BOARD_DURATION) {
    const positionnedPieces: {
      position: { x: number; y: number; z: number };
      mesh: Mesh;
    }[] = [];

    const rows = positions.split(" ")[0].split("/");
    for (let rowIndex = 0; rowIndex < 8; rowIndex++) {
      const row = rows[rowIndex];
      let columnIndex = 0;
      for (const pieceSymbol of row.split("")) {
        // @ts-ignore
        if (Number(pieceSymbol) == pieceSymbol) {
          columnIndex += Number(pieceSymbol);
        } else {
          const pieceName = piecesNames.find(
            (pieceName) =>
              pieceName.indexOf(pieceSymbol) === 0 &&
              !positionnedPieces.find(({ mesh }) => mesh.name === pieceName)
          ) as PieceName;
          const mesh = this.meshes![pieceName];
          positionnedPieces.push({
            position: this.meshesPositions[rowIndex][columnIndex],
            mesh,
          });
          columnIndex++;
        }
      }
    }

    piecesNames.forEach((pieceName) => {
      const mesh = this.meshes![pieceName];
      this.movePiece(
        mesh,
        positionnedPieces.find((pp) => pp.mesh.name === pieceName)?.position,
        duration
      );
    });
  }

  movePiece(
    piece: Mesh<BufferGeometry, Material>,
    position?: { x: number; y: number; z: number },
    duration = CLEAR_BOARD_DURATION
  ) {
    const GAP = 0.1;

    // Save initial rotation
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
          duration / 4
        )
        .delay((Math.random() * duration) / 4)
        .easing(Easing.Exponential.In)
        .onUpdate(([x, y, z, rx, ry, rz]: number[]) => {
          piece.position.set(x, y, z);
          piece.rotation.set(rx, ry, rz);
        }),
      () => {
        if (position) {
          piece.visible = true;
          const { x, y, z } = position;
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
              .to(
                [
                  x + GAP * Math.random() - GAP / 2,
                  y,
                  z + GAP * Math.random() - GAP / 2,
                  ...piece.userData.rot,
                ],
                duration / 3
              )
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
          piece.visible = false;
        }
      }
    );
  }

  dragPiece(piece: Mesh<BufferGeometry, Material>, duration = 500) {
    const GAP = 0.1;

    // Save initial rotation
    if (!piece.userData.rot) {
      piece.userData.rot = [
        piece.rotation.x,
        piece.rotation.y,
        piece.rotation.z,
      ] as const;
    }

    const ROT = Math.random() / 4;
    const ELEVATION = 4;

    this.addTween(
      new Tween([...piece.position.toArray(), ...piece.userData.rot], false)
        .to(
          [
            piece.position.x,
            piece.position.y + ELEVATION,
            piece.position.z,
            piece.userData.rot[0] + ROT * Math.random() - ROT / 2,
            piece.userData.rot[1] + ROT * Math.random() - ROT / 2,
            piece.userData.rot[2] + ROT * Math.random() - ROT / 2,
          ],
          duration
        )
        .easing(Easing.Exponential.Out)
        .onUpdate(([x, y, z, rx, ry, rz]: number[]) => {
          piece.position.set(x, y, z);
          piece.rotation.set(rx, ry, rz);
        })
    );
  }

  threeDPositionToChessPosition(position: { x: number; z: number }) {
    const boardPositions = this.meshesPositions
      .map((line, i) =>
        line.map((pos, j) => ({
          ...pos,
          i,
          j,
          distance: Math.sqrt(
            (position.x - pos.x) ** 2 + (position.z - pos.z) ** 2
          ),
        }))
      )
      .flat(2);
    boardPositions.sort((a, b) => a.distance - b.distance);
    return this.ijToChessPosition(boardPositions[0].i, boardPositions[0].j);
  }

  ijToChessPosition(i: number, j: number) {
    return "abcdefgh".charAt(7 - j) + (8 - i);
  }

  chessPositionToXYZ(position: string) {
    const j = "hgfedcba".indexOf(position[0]);
    const i = 8 - Number(position[1]);
    return this.meshesPositions[i][j];
  }

  // chessPositionToPiece(position: string) {
  //   const xyz = this.chessPositionToXYZ(position);
  //   const pieces = piecesNames
  //     .map((name) => this.meshes![name])
  //     .map((piece) => ({
  //       piece,
  //       distance: Math.sqrt(
  //         (xyz.x - piece.position.x) ** 2 + (xyz.z - piece.position.z) ** 2
  //       ),
  //     }));
  //   pieces.sort((a, b) => a.distance - b.distance);
  //   return pieces[0].piece;
  // }

  eatPiece(piece: Mesh, duration = 210) {
    const ROT = Math.PI * 10;
    const DIST = 20;

    this.addTween(
      new Tween([...piece.position.toArray(), ...piece.userData.rot], false)
        .to(
          [
            piece.position.x + Math.random() * DIST - DIST / 2,
            piece.position.y + 10,
            piece.position.z + Math.random() * DIST - DIST / 2,
            piece.userData.rot[0] + ROT * Math.random() - ROT / 2,
            piece.userData.rot[1] + ROT * Math.random() - ROT / 2,
            piece.userData.rot[2] + ROT * Math.random() - ROT / 2,
          ],
          duration
        )
        .easing(Easing.Exponential.Out)
        .onUpdate(([x, y, z, rx, ry, rz]: number[]) => {
          piece.position.set(x, y, z);
          piece.rotation.set(rx, ry, rz);
        }),
      () => {
        piece.visible = false;
      }
    );
  }

  playPieceByPosition(from: string, to: string, duration = 450) {
    const allPieces = piecesNames
      .map((name) => this.meshes![name])
      .filter((piece) => piece.visible)
      .map((piece) => ({
        piece,
        position: this.threeDPositionToChessPosition(piece.position),
      }));

    const piece = allPieces.find((piece) => piece.position === from)!.piece;
    const toXYZ = this.chessPositionToXYZ(to);

    const eat = allPieces.find((piece) => piece.position === to);
    if (eat) {
      this.eatPiece(eat.piece);
    }

    console.log("🎮", from, to, piece.name, toXYZ);

    const ROT = Math.PI / 4;
    const GAP = 0;

    this.addTween(
      new Tween([...piece.position.toArray(), ...piece.userData.rot], false)
        .to(
          [
            piece.position.x,
            piece.position.y + 4,
            piece.position.z,
            piece.userData.rot[0] + ROT * Math.random() - ROT / 2,
            piece.userData.rot[1] + ROT * Math.random() - ROT / 2,
            piece.userData.rot[2] + ROT * Math.random() - ROT / 2,
          ],
          duration / 2
        )
        .easing(Easing.Exponential.In)
        .onUpdate(([x, y, z, rx, ry, rz]: number[]) => {
          piece.position.set(x, y, z);
          piece.rotation.set(rx, ry, rz);
        }),
      () => {
        const { x, y, z } = toXYZ;
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
            .to([x, y, z, ...piece.userData.rot], duration / 2)
            .easing(Easing.Quadratic.Out)
            .onUpdate(([x, y, z, rx, ry, rz]: number[]) => {
              piece.position.set(x, y, z);
              piece.rotation.set(rx, ry, rz);
            })
        );
      }
    );
  }

  dropPiece(piece: Mesh<BufferGeometry, Material>, duration = 250) {
    const GAP = 0.1;

    this.addTween(
      new Tween([piece.position.y], false)
        .to([0], duration)
        .easing(Easing.Quadratic.In)
        .onUpdate(([y]: number[]) => {
          piece.position.y = y;
        })
    );

    return this.threeDPositionToChessPosition(piece.position);
  }

  random() {
    if (!this.meshes) {
      return;
    }

    const positions = this.meshesPositions.flat(2);
    shuffle(positions);
    for (const name of piecesNames) {
      const piece = this.meshes[name];
      this.movePiece(
        piece,
        Math.random() < 0.25 ? positions.shift() : undefined
      );
    }
  }
}

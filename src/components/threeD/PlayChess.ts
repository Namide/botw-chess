import stokfishSrc from "stockfish.js/stockfish.wasm.js?url";
import { ChessScene } from "./ChessScene";
import { DragControls } from "three/examples/jsm/Addons.js";
import type { BufferGeometry, Event, Material, Mesh, Object3D } from "three";
import { Easing, Tween } from "three/examples/jsm/libs/tween.module.js";

// stockfish-nnue-17-lite.js
// stockfish-nnue-17-lite.wasm

export class PlayChess {
  stockfish;
  chessScene;
  controls;

  pieceElevation = 0;
  dragTween?: Tween<[number]>;

  // https://official-stockfish.github.io/docs/stockfish-wiki/UCI-&-Commands.html
  constructor() {
    this.chessScene = ChessScene.instance;

    this.stockfish = new Worker(stokfishSrc);
    this.stockfish.addEventListener("message", function (e) {
      console.log(e.data);
    });
    // this.stockfish.postMessage("uci");

    this.chessScene.reset(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    );
    this.chessScene.moveCamera({
      cameraPosition: {
        x: 5,
        y: 29.5,
        z: 0,
      },
      targetPosition: {
        x: 0.5,
        y: 0,
        z: 0,
      },
      focus: 28,
      aperture: 0.001,
      maxblur: 0.01,
    });

    this.controls = this.initControls();
  }

  start() {
    // this.stockfish.postMessage("go")
    this.stockfish.postMessage("ucinewgame");
    this.stockfish.postMessage("isready");

    // ('position startpos moves' + get_moves())
  }

  initControls() {
    const piecesNames = [
      "R1",
      "R2",
      "N1",
      "N2",
      "B1",
      "B2",
      "Q",
      "K",
      "P1",
      "P2",
      "P3",
      "P4",
      "P5",
      "P6",
      "P7",
      "P8",
    ] as const;
    const controls = new DragControls(
      piecesNames.map((name) => this.chessScene.meshes![name]),
      this.chessScene.camera,
      this.chessScene.renderer.domElement
    );

    this.onStartDrag = this.onStartDrag.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.onHoverOn = this.onHoverOn.bind(this);
    this.onHoverOff = this.onHoverOff.bind(this);

    controls.addEventListener("dragstart", this.onStartDrag);
    controls.addEventListener("drag", this.onDrag);
    controls.addEventListener("dragend", this.onDragEnd);
    controls.addEventListener("hoveron", this.onHoverOn);
    controls.addEventListener("hoveroff", this.onHoverOff);

    return controls;
  }

  onStartDrag(
    event: {
      object: Object3D;
    } & Event<"dragstart", DragControls>
  ) {
    this.dragTween = new Tween<[number]>([event.object.position.y], false)
      .to([4], 500)
      .easing(Easing.Exponential.Out)
      .onUpdate(([y]: number[]) => {
        if (this.dragTween) {
          this.pieceElevation = y;
          event.object.position.y = y;
        }
      });
    this.chessScene.addTween(this.dragTween);
  }

  onDrag(
    event: {
      object: Object3D;
    } & Event<"drag", DragControls>
  ) {
    event.object.position.y = this.pieceElevation;
  }

  onDragEnd(
    event: {
      object: Object3D;
    } & Event<"dragend", DragControls>
  ) {
    if (this.dragTween) {
      this.dragTween.end();
      this.chessScene.removeTween(this.dragTween);
      this.dragTween = undefined;
    }
    console.log(this.chessScene.dropPiece(event.object as Mesh<BufferGeometry, Material>));
  }

  onHoverOn(
    _event: {
      object: Object3D;
    } & Event<"hoveron", DragControls>
  ) {
    this.chessScene.renderer.domElement.style.cursor = "grab";
  }

  onHoverOff(
    _event: {
      object: Object3D;
    } & Event<"hoveroff", DragControls>
  ) {
    this.chessScene.renderer.domElement.style.cursor = "none";
  }

  dispose() {
    this.controls.disconnect();
    this.controls.dispose();
  }
}

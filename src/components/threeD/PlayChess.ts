import { ChessScene } from "./ChessScene";
import { DragControls } from "three/examples/jsm/Addons.js";
import type { BufferGeometry, Event, Material, Mesh, Object3D } from "three";
import { Easing, Tween } from "three/examples/jsm/libs/tween.module.js";
import { Chess, type Color, type PieceSymbol, type Square } from "chess.js";

const stockfishSrc = "/stockfish.js/stockfish.wasm.js";
const PLAYER_COLOR: Color = "w";

// https://github.com/nmrugg/stockfish.js/blob/master/examples/enginegame.js

/**
 * Manage chess gameplay and AI
 */
export class PlayChess {
  engine;

  chessScene;
  controls;

  pieceElevation = 0;
  dragTween?: Tween<[number]>;

  status: "before" | "loaded" | "ready" = "before";

  game;

  dragFrom?: Square;

  onIllegalMove?: () => void;
  onDraw?: () => void;
  onLose?: () => void;
  onWin?: () => void;
  onCheck?: () => void;

  // https://official-stockfish.github.io/docs/stockfish-wiki/UCI-&-Commands.html
  constructor() {
    this.chessScene = ChessScene.instance;

    this.game = new Chess();
    this.engine = new Worker(stockfishSrc);

    this.onEngineMessage = this.onEngineMessage.bind(this);
    this.engine.addEventListener("message", this.onEngineMessage);

    this.controls = this.initControls();

    this.engineCmd("uci");

    this.start();
    this.restart();
  }

  movePiece(move: { from: Square; to: Square; promotion?: PieceSymbol }) {
    const isPlayerTurn = this.game.turn() === PLAYER_COLOR;
    const detail = this.game.move(move);

    if (!isPlayerTurn) {
      this.chessScene.playPieceBySquare(detail.from, detail.to, detail.piece);
    }

    if (detail.isCapture()) {
      this.chessScene.capturePieceByPosition(
        move.to,
        isPlayerTurn ? detail.captured! : detail.captured!.toUpperCase(),
        isPlayerTurn ? 0 : 400
      );
    }

    if (detail.piece === "k") {
      if (detail.to === "g1" && detail.from === "e1") {
        this.chessScene.playPieceBySquare("h1", "f1", "R");
      }

      if (detail.to === "c1" && detail.from === "e1") {
        this.chessScene.playPieceBySquare("a1", "d1", "R");
      }

      if (detail.to === "g8" && detail.from === "e8") {
        this.chessScene.playPieceBySquare("h8", "f8", "r");
      }

      if (detail.to === "c8" && detail.from === "e8") {
        this.chessScene.playPieceBySquare("a8", "d8", "r");
      }
    }

    // Todo
    // - isPromotion
    // - isEnPassant

    this.prepareMove();
  }

  onEngineMessage(event: MessageEvent<any>) {
    const line = event.data;
    if (line == "uciok") {
      this.status = "loaded";
    } else if (line == "readyok") {
      this.status = "ready";
    } else {
      let match = line.match(/^bestmove ([a-h][1-8])([a-h][1-8])([qrbn])?/);
      if (match) {
        this.movePiece({ from: match[1], to: match[2], promotion: match[3] });
      }
    }
  }

  getMoves() {
    let moves = "";
    const history = this.game.history({ verbose: true });

    for (let i = 0; i < history.length; ++i) {
      const move = history[i];
      moves +=
        " " + move.from + move.to + (move.promotion ? move.promotion : "");
    }

    return moves;
  }

  prepareMove() {
    if (this.game.isCheckmate() && this.game.turn() === PLAYER_COLOR) {
      this.onLose?.();
    } else if (this.game.isCheckmate() && this.game.turn() !== PLAYER_COLOR) {
      this.onWin?.();
    } else if (this.game.isCheck() && this.game.turn() === PLAYER_COLOR) {
      this.onCheck?.();
    } else if (this.game.isDraw() || this.game.isStalemate()) {
      this.onDraw?.();
    }

    if (!this.game.isGameOver()) {
      if (this.game.turn() !== PLAYER_COLOR) {
        this.engineCmd("position startpos moves" + this.getMoves());
        this.engineCmd("go ");
      }
    }
  }

  engineCmd(cmd: string) {
    this.engine.postMessage(cmd);
  }

  start() {
    this.engine.postMessage("ucinewgame");
    this.engine.postMessage("isready");
    this.prepareMove();
  }

  restart() {
    this.game.reset();
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
    this.chessScene.addTween(this.dragTween, "piece");

    this.dragFrom = this.chessScene.threeDPositionToChessPosition(
      event.object.position
    );
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

    const dragTo = this.chessScene.dropPiece(
      event.object as Mesh<BufferGeometry, Material>
    );

    if (this.dragFrom !== dragTo) {
      try {
        this.movePiece({
          from: this.dragFrom!,
          to: dragTo,
          promotion:
            // Auto add queen promotion
            // Will bug, need fix because 3D queen not added
            event.object.name[0].toLowerCase() === "p" &&
            Number(dragTo[1]) === 8
              ? "q"
              : undefined,
        });
      } catch (error) {
        this.onIllegalMove?.();

        this.chessScene.playPiece(
          event.object as Mesh,
          this.chessScene.squareToXYZ(this.dragFrom!)
        );
      }
    }

    this.dragFrom = undefined;
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

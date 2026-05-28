import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const GAMES = [
  {
    id: "snake",
    name: "Snake",
    engine: "snake",
    genre: "Classic",
    summary: "Guide the serpent, collect cores, avoid walls and your own tail.",
    controls: "Move: Arrow keys or WASD",
    instructions: ["Press Start.", "Move toward the glowing food.", "Do not hit the wall or your body."],
    profile: "SN",
    sound: { base: 210, wave: "triangle" },
    colors: ["#0f766e", "#2ff6d0", "#132f2a"]
  },
  {
    id: "tetris",
    name: "Tetris",
    engine: "tetris",
    genre: "Puzzle",
    summary: "Drop blocks, clear rows, and keep the skyline open.",
    controls: "Move: Arrows / Rotate: X",
    instructions: ["Press Start.", "Move blocks with arrows.", "Press X to rotate and clear full rows."],
    profile: "TT",
    sound: { base: 180, wave: "square" },
    colors: ["#334155", "#ffcc4d", "#1f2937"]
  },
  {
    id: "pong",
    name: "Pong",
    engine: "pong",
    genre: "Arcade",
    summary: "Return the signal against a clean AI rival.",
    controls: "Move: Mouse or Up/Down arrows",
    instructions: ["Press Start.", "Move your paddle up and down.", "Keep the ball in play."],
    profile: "PG",
    sound: { base: 260, wave: "sine" },
    colors: ["#0f172a", "#70ff7a", "#243447"]
  },
  {
    id: "breakout",
    name: "Breakout",
    engine: "breakout",
    genre: "Arcade",
    summary: "Break neon bricks before the ball escapes.",
    controls: "Mouse or arrow keys",
    instructions: ["Press Start.", "Move the paddle with the mouse or arrows.", "Break all bricks before lives run out."],
    profile: "BR",
    sound: { base: 320, wave: "triangle" },
    colors: ["#1e1b4b", "#ff4ad8", "#312e81"]
  },
  {
    id: "space-shooter",
    name: "Space Shooter",
    engine: "shooter",
    genre: "Action",
    summary: "Pilot a fighter through waves of hostile drones.",
    controls: "Move: Arrows / Shoot: J",
    instructions: ["Press Start.", "Move left and right with arrows.", "Press J to fire. Avoid enemy drones."],
    profile: "SS",
    sound: { base: 390, wave: "sawtooth" },
    colors: ["#111827", "#60a5fa", "#172554"]
  },
  {
    id: "flappy-drone",
    name: "Flappy Drone",
    engine: "flappy",
    genre: "Runner",
    summary: "Tap the drone through energy gates.",
    controls: "Fly: Click or J",
    instructions: ["Press Start.", "Click the board or press J to flap.", "Pass through the gates."],
    profile: "FD",
    sound: { base: 450, wave: "sine" },
    colors: ["#082f49", "#38bdf8", "#0c4a6e"]
  },
  {
    id: "memory-match",
    name: "Memory Match",
    engine: "memory",
    genre: "Puzzle",
    summary: "Match signal cards before the clock drains.",
    controls: "Click cards",
    instructions: ["Press Start to shuffle.", "Click two cards.", "Match all pairs in fewer moves."],
    profile: "MM",
    sound: { base: 520, wave: "triangle" },
    colors: ["#312e81", "#a78bfa", "#4c1d95"]
  },
  {
    id: "2048",
    name: "2048",
    engine: "twenty48",
    genre: "Puzzle",
    summary: "Merge tiles into a high-energy number stack.",
    controls: "Arrow keys",
    instructions: ["Use arrow keys.", "Same numbers merge.", "Submit when you are done."],
    profile: "24",
    sound: { base: 300, wave: "square" },
    colors: ["#7c2d12", "#fb923c", "#431407"]
  },
  {
    id: "minesweeper",
    name: "Minesweeper",
    engine: "mines",
    genre: "Logic",
    summary: "Reveal safe nodes without tripping mines.",
    controls: "Click tiles",
    instructions: ["Click a tile to reveal it.", "Numbers show nearby mines.", "Avoid the mine tiles."],
    profile: "MS",
    sound: { base: 240, wave: "sine" },
    colors: ["#164e63", "#22d3ee", "#083344"]
  },
  {
    id: "pac-maze",
    name: "Pac-Man Style Maze",
    engine: "maze",
    genre: "Maze",
    summary: "Collect city lights while patrol bots chase you.",
    controls: "Arrow keys or WASD",
    instructions: ["Press Start.", "Move with arrows or WASD.", "Collect lights and avoid patrol bots."],
    profile: "PM",
    sound: { base: 360, wave: "triangle" },
    colors: ["#581c87", "#facc15", "#2e1065"]
  },
  {
    id: "racing-runner",
    name: "Racing Runner",
    engine: "racing",
    genre: "Racing",
    summary: "Shift lanes, dodge traffic, and chase distance.",
    controls: "Left and Right",
    instructions: ["Press Start.", "Use Left and Right arrows.", "Dodge cars and drive as far as possible."],
    profile: "RR",
    sound: { base: 160, wave: "sawtooth" },
    colors: ["#0f172a", "#ef4444", "#450a0a"]
  },
  {
    id: "tower-defense",
    name: "Tower Defense Mini",
    engine: "tower",
    genre: "Strategy",
    summary: "Place turrets and hold back moving waves.",
    controls: "Click build slots",
    instructions: ["Press Start.", "Click yellow build slots to place turrets.", "Stop enemies before the base breaks."],
    profile: "TD",
    sound: { base: 275, wave: "square" },
    colors: ["#064e3b", "#34d399", "#052e16"]
  },
  {
    id: "whack-a-bot",
    name: "Whack-a-Bot",
    engine: "whack",
    genre: "Reaction",
    summary: "Hit the bot that appears before it teleports.",
    controls: "Click fast",
    instructions: ["Press Start.", "Click the active bot tile.", "Wrong clicks lose points."],
    profile: "WB",
    sound: { base: 610, wave: "triangle" },
    colors: ["#4a044e", "#f0abfc", "#701a75"]
  },
  {
    id: "word-scramble",
    name: "Word Scramble",
    engine: "words",
    genre: "Word",
    summary: "Decode scrambled arcade words under pressure.",
    controls: "Type and submit",
    instructions: ["Press Start.", "Unscramble the word.", "Type the answer and submit."],
    profile: "WS",
    sound: { base: 330, wave: "sine" },
    colors: ["#713f12", "#fde047", "#422006"]
  },
  {
    id: "checkers",
    name: "Checkers",
    engine: "checkers",
    genre: "Board",
    summary: "Capture the rival pieces in a quick checkers match.",
    controls: "Click piece, click move",
    instructions: ["Click one of your green pieces.", "Click a diagonal square to move.", "Jump over orange pieces to score."],
    profile: "CK",
    sound: { base: 230, wave: "triangle" },
    colors: ["#111827", "#f97316", "#1f2937"]
  }
].map((game) => ({
  ...game,
  banner: `/banners/${game.id}.svg`
}));

const BOARD = 16;
const TETRIS_W = 10;
const TETRIS_H = 16;
const WORDS = ["ARCADE", "NEON", "VECTOR", "PLAYER", "ROCKET", "TOWER", "PUZZLE", "RACING"];

export function GameArtwork({ game }) {
  return (
    <div className={`game-art game-art-${game.engine}`} style={{ "--art-a": game.colors[0], "--art-b": game.colors[1], "--art-c": game.colors[2] }}>
      <img className="game-banner-img" src={game.banner} alt="" loading="lazy" />
      <GameProfile game={game} />
      <span className="art-orbit" />
      <span className="art-grid" />
      <strong>{game.name}</strong>
    </div>
  );
}

export function GameProfile({ game }) {
  return (
    <span className={`game-profile game-profile-${game.engine}`} style={{ "--profile-a": game.colors[1], "--profile-b": game.colors[2] }}>
      <span className="game-character" aria-hidden="true" />
      <b>{game.profile}</b>
    </span>
  );
}

export function PlayableGame({ game, onFinish, difficulty = "medium", autoStart = false }) {
  const props = { game, onFinish, difficulty, autoStart };

  if (game.engine === "snake") return <SnakeGame {...props} />;
  if (game.engine === "tetris") return <TetrisGame {...props} />;
  if (game.engine === "pong") return <PongGame {...props} />;
  if (game.engine === "breakout") return <BreakoutGame {...props} />;
  if (game.engine === "shooter") return <ShooterGame {...props} />;
  if (game.engine === "flappy") return <FlappyGame {...props} />;
  if (game.engine === "memory") return <MemoryGame {...props} />;
  if (game.engine === "twenty48") return <Twenty48Game {...props} />;
  if (game.engine === "mines") return <MinesGame {...props} />;
  if (game.engine === "maze") return <MazeGame {...props} />;
  if (game.engine === "racing") return <RacingGame {...props} />;
  if (game.engine === "tower") return <TowerGame {...props} />;
  if (game.engine === "whack") return <WhackGame {...props} />;
  if (game.engine === "words") return <WordGame {...props} />;
  return <CheckersGame {...props} />;
}

function useFinish(onFinish) {
  const lastFinishedAt = useRef(0);
  return useCallback(
    (result) => {
      const now = Date.now();
      if (now - lastFinishedAt.current < 800) return;
      lastFinishedAt.current = now;
      onFinish(result);
    },
    [onFinish]
  );
}

// Reusable Canvas Particles and Shake Manager
export function createNeonExplosion(particles, x, y, colors, count = 12) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      radius: Math.random() * 4 + 2,
      opacity: 1,
      decay: Math.random() * 0.04 + 0.02
    });
  }
}

export function updateAndDrawParticles(ctx, particles) {
  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.opacity -= p.decay;
  });
  
  const alive = particles.filter((p) => p.opacity > 0);
  particles.length = 0;
  particles.push(...alive);

  alive.forEach((p) => {
    ctx.save();
    ctx.globalAlpha = p.opacity;
    if (p.vx !== 0 || p.vy !== 0) {
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
    }
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

export function applyCanvasShake(ctx, shake) {
  if (shake.duration > 0) {
    const dx = (Math.random() - 0.5) * shake.magnitude;
    const dy = (Math.random() - 0.5) * shake.magnitude;
    ctx.translate(dx, dy);
    shake.duration -= 1;
  }
}


function useInterval(callback, delay, active = true) {
  const saved = useRef(callback);
  useEffect(() => {
    saved.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!active || delay == null) return undefined;
    const id = window.setInterval(() => saved.current(), delay);
    return () => window.clearInterval(id);
  }, [active, delay]);
}

function keyOf(cell) {
  return `${cell.x}:${cell.y}`;
}

function randomCell(blocked = new Set(), size = BOARD) {
  let cell = { x: Math.floor(Math.random() * size), y: Math.floor(Math.random() * size) };
  while (blocked.has(keyOf(cell))) {
    cell = { x: Math.floor(Math.random() * size), y: Math.floor(Math.random() * size) };
  }
  return cell;
}

function playGameSound(game, event = "tap") {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  if (!window.__neonGameAudio) {
    window.__neonGameAudio = new AudioContext();
  }

  const context = window.__neonGameAudio;
  if (context.state === "suspended") context.resume();

  const now = context.currentTime;
  const base = game.sound?.base || 280;
  const wave = game.sound?.wave || "sine";
  const settings = {
    start: [base, base * 1.55, 0.12, wave, 0.07],
    eat: [base * 1.2, base * 2.2, 0.08, wave, 0.06],
    hit: [base * 0.8, base * 0.45, 0.16, "sawtooth", 0.08],
    score: [base * 1.4, base * 2.6, 0.11, "triangle", 0.06],
    over: [base * 1.1, 80, 0.28, "sawtooth", 0.08],
    tap: [base, base * 1.25, 0.06, wave, 0.045]
  };
  const [from, to, length, type, volume] = settings[event] || settings.tap;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(from, now);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, to), now + length);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + length);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + length + 0.03);
}

function ArcadeButton({ children, onClick, disabled, type = "button" }) {
  const handleClick = (event) => {
    event.currentTarget.blur();
    onClick?.(event);
  };

  return (
    <button type={type} className="arcade-button" onClick={handleClick} disabled={disabled}>
      {children}
    </button>
  );
}

function GameShell({ game, title, score, meta, children, controls, onStart, running, canRestartWhileRunning = false }) {
  const start = () => {
    playGameSound(game, "start");
    onStart?.();
  };

  useEffect(() => {
    const handleEnter = (event) => {
      if (event.code === "Enter" || event.key === "Enter") {
        const activeEl = document.activeElement;
        if (activeEl && ["INPUT", "TEXTAREA"].includes(activeEl.tagName)) {
          return;
        }
        if (!running || canRestartWhileRunning) {
          event.preventDefault();
          start();
        }
      }
    };
    window.addEventListener("keydown", handleEnter);
    return () => window.removeEventListener("keydown", handleEnter);
  }, [running, onStart, canRestartWhileRunning]);

  return (
    <div className="play-shell">
      <div className="play-header">
        <div>
          <span>{title}</span>
          <strong>{score}</strong>
        </div>
        <p>{meta}</p>
        <div className="play-actions">
          <span className="play-level-pill">Level {game.arcadeLevel || 1}</span>
          {onStart ? <ArcadeButton onClick={start} disabled={running && !canRestartWhileRunning}>{running ? "Playing" : "Start"}</ArcadeButton> : null}
        </div>
      </div>
      {children}
      <div className="instruction-panel">
        <div>
          <GameProfile game={game} />
          <p className="control-note">{controls}</p>
        </div>
        <ol>
          {game.instructions?.map((instruction) => (
            <li key={instruction}>{instruction}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function SnakeGame({ game, onFinish, difficulty }) {
  const finish = useFinish(onFinish);
  const [running, setRunning] = useState(false);
  const [snake, setSnake] = useState([{ x: 7, y: 8 }, { x: 6, y: 8 }, { x: 5, y: 8 }, { x: 4, y: 8 }]);
  const [food, setFood] = useState({ x: 11, y: 8 });
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const startTime = useRef(Date.now());

  const restart = () => {
    startTime.current = Date.now();
    setSnake([{ x: 7, y: 8 }, { x: 6, y: 8 }, { x: 5, y: 8 }, { x: 4, y: 8 }]);
    setFood({ x: 11, y: 8 });
    setDir({ x: 1, y: 0 });
    scoreRef.current = 0;
    setScore(0);
    setRunning(true);
  };

  useEffect(() => {
    const handler = (event) => {
      const map = {
        ArrowUp: { x: 0, y: -1 },
        KeyW: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        KeyS: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        KeyA: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        KeyD: { x: 1, y: 0 }
      };
      const next = map[event.code];
      if (next && next.x + dir.x !== 0 && next.y + dir.y !== 0) {
        event.preventDefault();
        setDir(next);
        setRunning(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dir]);

  const snakeSpeed = difficulty === "easy" ? Math.max(110, 200 - score / 8) :
                      difficulty === "hard" ? Math.max(45, 100 - score / 12) :
                      Math.max(70, 150 - score / 10);

  useInterval(
    () => {
      setSnake((current) => {
        const head = current[0];
        const next = { x: head.x + dir.x, y: head.y + dir.y };
        const collision = next.x < 0 || next.y < 0 || next.x >= BOARD || next.y >= BOARD || current.some((cell) => cell.x === next.x && cell.y === next.y);
        if (collision) {
          window.setTimeout(() => {
            setRunning(false);
            finish({ score: scoreRef.current, duration: secondsSince(startTime), detail: "Collision detected" });
          }, 0);
          return current;
        }

        const ate = next.x === food.x && next.y === food.y;
        const body = ate ? current : current.slice(0, -1);
        const nextSnake = [next, ...body];
        if (ate) {
          const blocked = new Set(nextSnake.map(keyOf));
          setFood(randomCell(blocked));
          playGameSound(game, "eat");
          scoreRef.current += 15;
          setScore(scoreRef.current);
        }
        return nextSnake;
      });
    },
    snakeSpeed,
    running
  );

  const snakeKeys = new Set(snake.map(keyOf));
  const snakeHead = keyOf(snake[0]);
  return (
    <GameShell game={game} title="Score" score={score} meta={`Length ${snake.length}`} controls={game.controls} onStart={restart} running={running}>
      <div className="pixel-board snake-board" style={{ gridTemplateColumns: `repeat(${BOARD}, 1fr)` }}>
        {Array.from({ length: BOARD * BOARD }, (_, index) => {
          const cell = { x: index % BOARD, y: Math.floor(index / BOARD) };
          const key = keyOf(cell);
          const snakeClass = snakeKeys.has(key) ? (key === snakeHead ? "snake-head" : "snake-cell") : "";
          return <button key={key} type="button" className={`pixel ${snakeClass} ${food.x === cell.x && food.y === cell.y ? "food-cell" : ""}`} onClick={() => setRunning(true)} />;
        })}
      </div>
    </GameShell>
  );
}

function TetrisGame({ game, onFinish, difficulty }) {
  const finish = useFinish(onFinish);
  const pieces = useMemo(
    () => [
      [[1, 1, 1, 1]],
      [[1, 1], [1, 1]],
      [[0, 1, 0], [1, 1, 1]],
      [[1, 0, 0], [1, 1, 1]],
      [[0, 0, 1], [1, 1, 1]],
      [[1, 1, 0], [0, 1, 1]]
    ],
    []
  );
  const [grid, setGrid] = useState(emptyTetris());
  const [piece, setPiece] = useState(() => ({ shape: pieces[0], x: 3, y: 0 }));
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const startTime = useRef(Date.now());

  const spawn = useCallback(() => ({ shape: pieces[Math.floor(Math.random() * pieces.length)], x: 3, y: 0 }), [pieces]);
  const restart = () => {
    startTime.current = Date.now();
    setGrid(emptyTetris());
    setPiece(spawn());
    scoreRef.current = 0;
    setScore(0);
    setRunning(true);
  };

  const move = useCallback(
    (dx, dy, shape = piece.shape) => {
      const next = { ...piece, x: piece.x + dx, y: piece.y + dy, shape };
      if (!tetrisCollides(grid, next)) {
        setPiece(next);
        return true;
      }
      return false;
    },
    [grid, piece]
  );

  const lockPiece = useCallback(() => {
    const merged = grid.map((row) => [...row]);
    piece.shape.forEach((row, y) => row.forEach((value, x) => {
      if (value && merged[piece.y + y]) merged[piece.y + y][piece.x + x] = 1;
    }));
    const openRows = merged.filter((row) => row.some((value) => !value));
    const cleared = TETRIS_H - openRows.length;
    const nextGrid = [...Array.from({ length: cleared }, () => Array(TETRIS_W).fill(0)), ...openRows];
    const nextPiece = spawn();
    setGrid(nextGrid);
    setPiece(nextPiece);
    if (cleared) {
      playGameSound(game, "score");
    }
    scoreRef.current += cleared * 120 + 8;
    setScore(scoreRef.current);
    if (tetrisCollides(nextGrid, nextPiece)) {
      setRunning(false);
      playGameSound(game, "over");
      finish({ score: scoreRef.current, duration: secondsSince(startTime), detail: "Rows cleared" });
    }
  }, [finish, game, grid, piece, spawn]);

  const tetrisSpeed = difficulty === "easy" ? Math.max(220, 800 - score / 3) :
                       difficulty === "hard" ? Math.max(80, 400 - score) :
                       Math.max(140, 600 - score / 2);

  useInterval(() => {
    if (!move(0, 1)) lockPiece();
  }, tetrisSpeed, running);

  useEffect(() => {
    const handler = (event) => {
      if (!running) return;
      if (["ArrowLeft", "ArrowRight", "ArrowDown", "KeyX"].includes(event.code)) {
        event.preventDefault();
      }
      if (event.code === "ArrowLeft") move(-1, 0);
      if (event.code === "ArrowRight") move(1, 0);
      if (event.code === "ArrowDown" && !move(0, 1)) lockPiece();
      if (event.code === "KeyX") {
        playGameSound(game, "tap");
        move(0, 0, rotate(piece.shape));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lockPiece, move, piece.shape, running]);

  const display = drawTetris(grid, piece);
  return (
    <GameShell game={game} title="Score" score={score} meta="Clear rows" controls={game.controls} onStart={restart} running={running}>
      <div className="pixel-board tetris-board" style={{ gridTemplateColumns: `repeat(${TETRIS_W}, 1fr)` }}>
        {display.flat().map((value, index) => <span key={index} className={`pixel ${value ? "active-cell" : ""}`} />)}
      </div>
    </GameShell>
  );
}

function emptyTetris() {
  return Array.from({ length: TETRIS_H }, () => Array(TETRIS_W).fill(0));
}


function rotate(shape) {
  return shape[0].map((_, index) => shape.map((row) => row[index]).reverse());
}

function tetrisCollides(grid, piece) {
  return piece.shape.some((row, y) => row.some((value, x) => {
    if (!value) return false;
    const px = piece.x + x;
    const py = piece.y + y;
    return px < 0 || px >= TETRIS_W || py >= TETRIS_H || (py >= 0 && grid[py][px]);
  }));
}

function drawTetris(grid, piece) {
  const display = grid.map((row) => [...row]);
  piece.shape.forEach((row, y) => row.forEach((value, x) => {
    if (value && display[piece.y + y]?.[piece.x + x] !== undefined) display[piece.y + y][piece.x + x] = 2;
  }));
  return display;
}

function PongGame({ game, onFinish, difficulty }) {
  return <CanvasBallGame game={game} onFinish={onFinish} mode="pong" difficulty={difficulty} />;
}

function BreakoutGame({ game, onFinish, difficulty }) {
  return <CanvasBallGame game={game} onFinish={onFinish} mode="breakout" difficulty={difficulty} />;
}

function CanvasBallGame({ game, onFinish, mode, difficulty }) {
  const finish = useFinish(onFinish);
  const canvasRef = useRef(null);
  const state = useRef(null);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [lives, setLives] = useState(3);
  const startTime = useRef(Date.now());

  const particlesRef = useRef([]);
  const shakeRef = useRef({ duration: 0, magnitude: 0 });

  const reset = () => {
    startTime.current = Date.now();
    const vxVal = difficulty === "easy" ? 3 : difficulty === "hard" ? 6.5 : 4.8;
    const paddleW = difficulty === "easy" ? 130 : difficulty === "hard" ? 75 : 104;
    state.current = {
      ball: { x: 330, y: 220, vx: vxVal, vy: -vxVal },
      paddle: 300,
      paddleWidth: paddleW,
      ai: 160,
      bricks: Array.from({ length: 32 }, (_, i) => ({ x: 45 + (i % 8) * 74, y: 42 + Math.floor(i / 8) * 28, alive: true }))
    };
    particlesRef.current = [];
    shakeRef.current = { duration: 0, magnitude: 0 };
    scoreRef.current = 0;
    setScore(0);
    setLives(3);
    setRunning(true);
  };

  useEffect(() => {
    const handler = (event) => {
      if (!state.current) return;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "KeyW", "KeyS", "KeyA", "KeyD"].includes(event.code)) {
        event.preventDefault();
      }
      if (mode === "pong") {
        // Left paddle controlled by Left Arrow (UP) and Down Arrow (DOWN)
        if (event.code === "ArrowLeft" || event.code === "KeyA") {
          state.current.ai -= 34;
        }
        if (event.code === "ArrowDown" || event.code === "KeyS") {
          state.current.ai += 34;
        }
        // Right paddle controlled by Up Arrow (UP) and Right Arrow (DOWN)
        if (event.code === "ArrowUp" || event.code === "KeyW") {
          state.current.paddle -= 34;
        }
        if (event.code === "ArrowRight" || event.code === "KeyD") {
          state.current.paddle += 34;
        }
      } else {
        // Breakout paddle moves horizontally
        if (event.code === "ArrowLeft" || event.code === "KeyA") {
          state.current.paddle -= 34;
        }
        if (event.code === "ArrowRight" || event.code === "KeyD") {
          state.current.paddle += 34;
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    if (mode === "pong") return undefined; // Disable mouse paddle override in Pong mode

    const move = (event) => {
      const rect = canvas.getBoundingClientRect();
      if (!state.current) return;
      state.current.paddle = ((event.clientX - rect.left) / rect.width) * 660 - 52;
    };
    canvas.addEventListener("mousemove", move);
    return () => canvas.removeEventListener("mousemove", move);
  }, [mode]);

  useInterval(
    () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !state.current) return;
      const s = state.current;
      if (!running) {
        if (Math.random() < 0.04 && particlesRef.current.length < 60) {
          createNeonExplosion(particlesRef.current, Math.random() * 660, Math.random() * 200 + 40, ["#2ff6d0", "#ff4ad8", "#ffcc4d", "#70ff7a", "#60a5fa"], 12);
        }
        drawBallCanvas(ctx, s, mode, game, canvas, shakeRef.current, particlesRef.current);
        return;
      }

      // Paddle position constraints based on game mode
      if (mode === "pong") {
        s.paddle = Math.max(0, Math.min(430 - 92, s.paddle));
        s.ai = Math.max(0, Math.min(430 - 92, s.ai));
      } else {
        s.paddle = Math.max(0, Math.min(660 - (s.paddleWidth || 104), s.paddle));
      }

      s.ball.x += s.ball.vx;
      s.ball.y += s.ball.vy;

      // Ball wall bounces based on game mode
      if (mode === "breakout") {
        if (s.ball.x < 8 || s.ball.x > 652) {
          s.ball.vx *= -1;
          shakeRef.current = { duration: 5, magnitude: 2.5 };
        }
        if (s.ball.y < 8) {
          s.ball.vy *= -1;
          shakeRef.current = { duration: 5, magnitude: 2.5 };
        }
      } else {
        // Pong mode vertical wall boundaries (bounces off top and bottom walls)
        if (s.ball.y < 8 || s.ball.y > 422) {
          s.ball.vy *= -1;
          shakeRef.current = { duration: 5, magnitude: 2.5 };
        }
      }

      particlesRef.current.push({
        x: s.ball.x,
        y: s.ball.y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        color: game.colors[1],
        radius: 6,
        opacity: 0.6,
        decay: 0.04
      });

      if (mode === "pong") {
        // Player controlled left paddle collision
        if (s.ball.x < 35 && s.ball.y > s.ai && s.ball.y < s.ai + 92) {
          s.ball.vx = Math.abs(s.ball.vx) + 0.2;
          playGameSound(game, "hit");
          scoreRef.current += 10;
          setScore(scoreRef.current);
          shakeRef.current = { duration: 6, magnitude: 3 };
          for (let i = 0; i < 8; i++) {
            particlesRef.current.push({
              x: 35,
              y: s.ball.y,
              vx: Math.random() * 3 + 2,
              vy: (Math.random() - 0.5) * 3,
              color: game.colors[1],
              radius: Math.random() * 3 + 1,
              opacity: 1,
              decay: Math.random() * 0.05 + 0.03
            });
          }
        }
        // Player controlled right paddle collision
        if (s.ball.x > 582 && s.ball.y > s.paddle && s.ball.y < s.paddle + 92) {
          s.ball.vx = -Math.abs(s.ball.vx) - 0.2;
          playGameSound(game, "hit");
          scoreRef.current += 10;
          setScore(scoreRef.current);
          shakeRef.current = { duration: 6, magnitude: 3 };
          for (let i = 0; i < 8; i++) {
            particlesRef.current.push({
              x: 582,
              y: s.ball.y,
              vx: -Math.random() * 3 - 2,
              vy: (Math.random() - 0.5) * 3,
              color: game.colors[1],
              radius: Math.random() * 3 + 1,
              opacity: 1,
              decay: Math.random() * 0.05 + 0.03
            });
          }
        }
        // If ball crosses left or right brick line, game ends instantly
        if (s.ball.x < 12 || s.ball.x > 648) loseLife();
      } else {
        if (s.ball.y > 372 && s.ball.x > s.paddle && s.ball.x < s.paddle + (s.paddleWidth || 104)) {
          s.ball.vy = -Math.abs(s.ball.vy) - 0.12;
          playGameSound(game, "hit");
          scoreRef.current += 5;
          setScore(scoreRef.current);
          shakeRef.current = { duration: 6, magnitude: 3 };
          for (let i = 0; i < 8; i++) {
            particlesRef.current.push({
              x: s.ball.x,
              y: 388,
              vx: (Math.random() - 0.5) * 3,
              vy: -Math.random() * 3 - 2,
              color: game.colors[1],
              radius: Math.random() * 3 + 1,
              opacity: 1,
              decay: Math.random() * 0.05 + 0.03
            });
          }
        }
        s.bricks.forEach((brick) => {
          if (brick.alive && s.ball.x > brick.x && s.ball.x < brick.x + 58 && s.ball.y > brick.y && s.ball.y < brick.y + 18) {
            brick.alive = false;
            s.ball.vy *= -1;
            playGameSound(game, "score");
            scoreRef.current += 25;
            setScore(scoreRef.current);
            shakeRef.current = { duration: 10, magnitude: 5.5 };
            createNeonExplosion(particlesRef.current, brick.x + 29, brick.y + 9, [game.colors[1], "#ffffff"], 14);
          }
        });
        if (s.bricks.every((brick) => !brick.alive)) {
          setRunning(false);
          playGameSound(game, "score");
          finish({ score: scoreRef.current + 400, level: 4, duration: secondsSince(startTime), detail: "Board cleared" });
        }
        if (s.ball.y > 430) loseLife();
      }

      drawBallCanvas(ctx, s, mode, game, canvas, shakeRef.current, particlesRef.current);
    },
    16,
    running || (particlesRef.current && particlesRef.current.length > 0)
  );

  function loseLife() {
    shakeRef.current = { duration: 25, magnitude: 9 };
    setLives((value) => {
      const next = mode === "pong" ? 0 : value - 1;
      if (next <= 0) {
        setRunning(false);
        playGameSound(game, "over");
        finish({ score: scoreRef.current, level: Math.max(1, Math.floor(scoreRef.current / 120) + 1), duration: secondsSince(startTime), detail: mode === "pong" ? "Rally ended" : "Bricks broken" });
      }
      return next;
    });
    if (state.current) state.current.ball = { x: 330, y: 220, vx: 4, vy: -4 };
  }

  return (
    <GameShell game={game} title="Score" score={score} meta={`Lives ${lives}`} controls={game.controls} onStart={reset} running={running}>
      <canvas className="arcade-canvas" width="660" height="430" ref={canvasRef} />
    </GameShell>
  );
}

function drawBallCanvas(ctx, s, mode, game, canvas, shake, particles) {
  const dpr = window.devicePixelRatio || 1;
  const expectedW = 660 * dpr;
  const expectedH = 430 * dpr;
  if (canvas.width !== expectedW || canvas.height !== expectedH) {
    canvas.width = expectedW;
    canvas.height = expectedH;
    canvas.style.width = "100%";
    canvas.style.height = "auto";
  }

  ctx.save();
  ctx.scale(dpr, dpr);

  applyCanvasShake(ctx, shake);

  ctx.clearRect(0, 0, 660, 430);
  drawCanvasBackdrop(ctx, game);
  ctx.shadowColor = game.colors[1];
  ctx.shadowBlur = 18;
  ctx.fillStyle = game.colors[1];
  if (mode === "pong") {
    roundedRect(ctx, 20, s.ai, 14, 92, 8);
    ctx.fill();
    roundedRect(ctx, 626, s.paddle, 14, 92, 8);
    ctx.fill();
  } else {
    roundedRect(ctx, s.paddle, 390, s.paddleWidth || 104, 16, 8);
    ctx.fill();
    ctx.shadowBlur = 10;
    s.bricks.forEach((brick, index) => {
      if (brick.alive) {
        ctx.fillStyle = index % 2 ? game.colors[1] : "#ffffff";
        roundedRect(ctx, brick.x, brick.y, 58, 18, 5);
        ctx.fill();
      }
    });
  }
  ctx.shadowBlur = 18;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(s.ball.x, s.ball.y, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  updateAndDrawParticles(ctx, particles);
  ctx.restore();
}

function ShooterGame({ game, onFinish, difficulty }) {
  const finish = useFinish(onFinish);
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const shakeRef = useRef({ duration: 0, magnitude: 0 });
  const keys = useRef(new Set());
  const state = useRef(null);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const startTime = useRef(Date.now());

  const start = () => {
    startTime.current = Date.now();
    state.current = { player: 330, bullets: [], enemies: [], ticks: 0 };
    particlesRef.current = [];
    shakeRef.current = { duration: 0, magnitude: 0 };
    scoreRef.current = 0;
    setScore(0);
    setRunning(true);
  };

  useKeys(keys);

  useInterval(
    () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !state.current) return;
      const s = state.current;
      if (!running) {
        if (Math.random() < 0.04 && particlesRef.current.length < 60) {
          createNeonExplosion(particlesRef.current, Math.random() * 660, Math.random() * 200 + 40, ["#2ff6d0", "#ff4ad8", "#ffcc4d", "#70ff7a", "#60a5fa"], 12);
        }
        drawShooter(ctx, s, game, canvas, shakeRef.current, particlesRef.current);
        return;
      }
      s.ticks += 1;
      if (keys.current.has("ArrowLeft")) s.player -= 7;
      if (keys.current.has("ArrowRight")) s.player += 7;
      if (keys.current.has("KeyJ") && s.ticks % 8 === 0) {
        s.bullets.push({ x: s.player + 12, y: 360 });
        playGameSound(game, "tap");
      }
      s.player = Math.max(10, Math.min(620, s.player));
      const spawnRate = difficulty === "easy" ? 38 : difficulty === "hard" ? 16 : 26;
      const enemySpeed = difficulty === "easy" ? (1.5 + scoreRef.current / 240) : difficulty === "hard" ? (3.5 + scoreRef.current / 120) : (2.2 + scoreRef.current / 180);
      if (s.ticks % spawnRate === 0) s.enemies.push({ x: Math.random() * 620 + 10, y: -20, vy: enemySpeed });
      s.bullets.forEach((b) => (b.y -= 9));
      s.enemies.forEach((e) => (e.y += e.vy));

      // Ship exhaust trailing
      particlesRef.current.push({
        x: s.player + 18,
        y: 392,
        vx: (Math.random() - 0.5) * 1.5,
        vy: Math.random() * 2 + 2,
        color: game.colors[1],
        radius: Math.random() * 3 + 1,
        opacity: 0.8,
        decay: 0.04
      });

      s.enemies.forEach((e) => {
        s.bullets.forEach((b) => {
          if (!e.hit && Math.abs(e.x - b.x) < 20 && Math.abs(e.y - b.y) < 20) {
            e.hit = true;
            b.hit = true;
            playGameSound(game, "score");
            scoreRef.current += 20;
            setScore(scoreRef.current);
            createNeonExplosion(particlesRef.current, e.x, e.y, ["#ff4a67", "#ffffff", game.colors[1]], 12);
            shakeRef.current = { duration: 8, magnitude: 4.5 };
          }
        });
      });
      s.enemies = s.enemies.filter((e) => !e.hit && e.y < 440);
      s.bullets = s.bullets.filter((b) => !b.hit && b.y > -20);
      if (s.enemies.some((e) => e.y > 360 && Math.abs(e.x - s.player) < 34)) {
        setRunning(false);
        playGameSound(game, "over");
        createNeonExplosion(particlesRef.current, s.player + 18, 375, [game.colors[1], "#ffffff", "#ff4a67"], 26);
        shakeRef.current = { duration: 25, magnitude: 11 };
        finish({ score: scoreRef.current, level: Math.max(1, Math.floor(scoreRef.current / 160) + 1), duration: secondsSince(startTime), detail: "Drone wave" });
      }
      drawShooter(ctx, s, game, canvas, shakeRef.current, particlesRef.current);
    },
    16,
    running || (particlesRef.current && particlesRef.current.length > 0)
  );

  return (
    <GameShell game={game} title="Score" score={score} meta="Clear drones" controls={game.controls} onStart={start} running={running}>
      <canvas className="arcade-canvas" width="660" height="430" ref={canvasRef} />
    </GameShell>
  );
}

function drawShooter(ctx, s, game, canvas, shake, particles) {
  const dpr = window.devicePixelRatio || 1;
  const expectedW = 660 * dpr;
  const expectedH = 430 * dpr;
  if (canvas.width !== expectedW || canvas.height !== expectedH) {
    canvas.width = expectedW;
    canvas.height = expectedH;
    canvas.style.width = "100%";
    canvas.style.height = "auto";
  }

  ctx.save();
  ctx.scale(dpr, dpr);

  applyCanvasShake(ctx, shake);

  ctx.clearRect(0, 0, 660, 430);
  drawCanvasBackdrop(ctx, game);
  const shipGradient = ctx.createLinearGradient(s.player, 350, s.player + 36, 398);
  shipGradient.addColorStop(0, "#ffffff");
  shipGradient.addColorStop(0.45, game.colors[1]);
  shipGradient.addColorStop(1, "#0b1222");
  ctx.shadowColor = game.colors[1];
  ctx.shadowBlur = 20;
  ctx.fillStyle = shipGradient;
  ctx.beginPath();
  ctx.moveTo(s.player + 18, 350);
  ctx.lineTo(s.player - 3, 398);
  ctx.lineTo(s.player + 18, 386);
  ctx.lineTo(s.player + 39, 398);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.beginPath();
  ctx.ellipse(s.player + 18, 377, 7, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 10;
  s.bullets.forEach((b) => {
    roundedRect(ctx, b.x, b.y, 4, 18, 3);
    ctx.fill();
  });
  ctx.shadowColor = "#ff4a67";
  ctx.shadowBlur = 14;
  s.enemies.forEach((e) => {
    ctx.fillStyle = "#ff4a67";
    ctx.beginPath();
    ctx.ellipse(e.x, e.y, 20, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(7,17,31,0.55)";
    roundedRect(ctx, e.x - 10, e.y - 4, 20, 7, 4);
    ctx.fill();
  });
  ctx.shadowBlur = 0;

  updateAndDrawParticles(ctx, particles);
  ctx.restore();
}

function FlappyGame({ game, onFinish, difficulty }) {
  const finish = useFinish(onFinish);
  const canvasRef = useRef(null);
  const state = useRef(null);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const startTime = useRef(Date.now());
  const particlesRef = useRef([]);
  const shakeRef = useRef({ duration: 0, magnitude: 0 });

  const start = () => {
    startTime.current = Date.now();
    state.current = { y: 180, vy: 0, pipes: [{ x: 680, gap: 190 }], ticks: 0 };
    particlesRef.current = [];
    shakeRef.current = { duration: 0, magnitude: 0 };
    scoreRef.current = 0;
    setScore(0);
    setRunning(true);
  };

  useEffect(() => {
    const flap = (event) => {
      if (event.code && event.code !== "KeyJ") return;
      event.preventDefault();
      if (state.current) {
        state.current.vy = -7.6;
        playGameSound(game, "tap");
      }
      setRunning(true);
    };
    window.addEventListener("keydown", flap);
    return () => window.removeEventListener("keydown", flap);
  }, []);

  useInterval(
    () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !state.current) return;
      const s = state.current;
      if (!running) {
        if (Math.random() < 0.04 && particlesRef.current.length < 60) {
          createNeonExplosion(particlesRef.current, Math.random() * 660, Math.random() * 200 + 40, ["#2ff6d0", "#ff4ad8", "#ffcc4d", "#70ff7a", "#60a5fa"], 12);
        }
        drawFlappy(ctx, s, game, canvas, shakeRef.current, particlesRef.current);
        return;
      }
      s.ticks += 1;
      s.vy += 0.45;
      s.y += s.vy;
      const flappyGap = difficulty === "easy" ? 100 : difficulty === "hard" ? 60 : 80;
      const flappySpeed = difficulty === "easy" ? 2.5 : difficulty === "hard" ? 4.6 : 3.4;
      if (s.ticks % 110 === 0) s.pipes.push({ x: 680, gap: flappyGap + Math.random() * (320 - flappyGap) });
      s.pipes.forEach((p) => (p.x -= flappySpeed));

      // Drone engine exhaust trailing
      particlesRef.current.push({
        x: 64,
        y: s.y,
        vx: -Math.random() * 3 - 2,
        vy: (Math.random() - 0.5) * 1.5,
        color: game.colors[1],
        radius: Math.random() * 3 + 1,
        opacity: 0.8,
        decay: 0.04
      });

      s.pipes.forEach((p) => {
        if (!p.passed && p.x < 90) {
          p.passed = true;
          playGameSound(game, "score");
          scoreRef.current += 25;
          setScore(scoreRef.current);
        }
      });
      s.pipes = s.pipes.filter((p) => p.x > -80);
      const flappyTolerance = difficulty === "easy" ? 78 : difficulty === "hard" ? 56 : 68;
      const crashed = s.y < 0 || s.y > 410 || s.pipes.some((p) => p.x < 128 && p.x + 54 > 70 && (s.y < p.gap - flappyTolerance || s.y > p.gap + flappyTolerance));
      if (crashed) {
        setRunning(false);
        playGameSound(game, "over");
        createNeonExplosion(particlesRef.current, 90, s.y, [game.colors[1], "#ffffff"], 16);
        shakeRef.current = { duration: 25, magnitude: 9 };
        finish({ score: scoreRef.current, level: Math.max(1, Math.floor(scoreRef.current / 100) + 1), duration: secondsSince(startTime), detail: "Gates passed" });
      }
      drawFlappy(ctx, s, game, canvas, shakeRef.current, particlesRef.current);
    },
    16,
    running || (particlesRef.current && particlesRef.current.length > 0)
  );

  return (
    <GameShell game={game} title="Score" score={score} meta="Tap to fly" controls={game.controls} onStart={start} running={running}>
      <canvas
        className="arcade-canvas"
        width="660"
        height="430"
        ref={canvasRef}
        onClick={() => {
          if (state.current) {
            state.current.vy = -7.6;
            playGameSound(game, "tap");
          }
        }}
      />
    </GameShell>
  );
}

function drawFlappy(ctx, s, game, canvas, shake, particles) {
  const dpr = window.devicePixelRatio || 1;
  const expectedW = 660 * dpr;
  const expectedH = 430 * dpr;
  if (canvas.width !== expectedW || canvas.height !== expectedH) {
    canvas.width = expectedW;
    canvas.height = expectedH;
    canvas.style.width = "100%";
    canvas.style.height = "auto";
  }

  ctx.save();
  ctx.scale(dpr, dpr);

  applyCanvasShake(ctx, shake);

  ctx.clearRect(0, 0, 660, 430);
  drawCanvasBackdrop(ctx, game);
  const gateGradient = ctx.createLinearGradient(0, 0, 0, 430);
  gateGradient.addColorStop(0, game.colors[1]);
  gateGradient.addColorStop(1, "rgba(255,255,255,0.78)");
  ctx.fillStyle = gateGradient;
  ctx.shadowColor = game.colors[1];
  ctx.shadowBlur = 16;
  s.pipes.forEach((p) => {
    roundedRect(ctx, p.x, -8, 54, p.gap - 64, 10);
    ctx.fill();
    roundedRect(ctx, p.x, p.gap + 72, 54, 430, 10);
    ctx.fill();
  });
  ctx.shadowBlur = 18;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(90, s.y, 24, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = game.colors[1];
  ctx.fillRect(64, s.y - 2, 52, 4);
  ctx.beginPath();
  ctx.arc(64, s.y, 8, 0, Math.PI * 2);
  ctx.arc(116, s.y, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#07111f";
  ctx.beginPath();
  ctx.arc(99, s.y - 3, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  updateAndDrawParticles(ctx, particles);
  ctx.restore();
}

function MemoryGame({ game, onFinish, difficulty }) {
  const finish = useFinish(onFinish);
  const pairCount = difficulty === "easy" ? 6 : difficulty === "hard" ? 10 : 8;
  const [cards, setCards] = useState(() => shuffle([...Array(pairCount).keys(), ...Array(pairCount).keys()]).map((value, id) => ({ id, value, open: false, done: false })));
  const [choice, setChoice] = useState([]);
  const [moves, setMoves] = useState(0);
  const movesRef = useRef(0);
  const startTime = useRef(Date.now());

  const restart = () => {
    startTime.current = Date.now();
    setCards(shuffle([...Array(pairCount).keys(), ...Array(pairCount).keys()]).map((value, id) => ({ id, value, open: false, done: false })));
    setChoice([]);
    movesRef.current = 0;
    setMoves(0);
  };

  const pick = (card) => {
    if (card.open || card.done || choice.length === 2) return;
    playGameSound(game, "tap");
    const nextChoice = [...choice, card];
    setCards((current) => current.map((item) => (item.id === card.id ? { ...item, open: true } : item)));
    setChoice(nextChoice);
    if (nextChoice.length === 2) {
      movesRef.current += 1;
      setMoves(movesRef.current);
      window.setTimeout(() => {
        setCards((current) => {
          const match = nextChoice[0].value === nextChoice[1].value;
          if (match) {
            playGameSound(game, "score");
          } else {
            playGameSound(game, "hit");
          }
          const next = current.map((item) => (nextChoice.some((c) => c.id === item.id) ? { ...item, open: match, done: match } : item));
          if (next.every((item) => item.done)) {
            const score = Math.max(50, 600 - movesRef.current * 18 - secondsSince(startTime) * 2);
            playGameSound(game, "score");
            finish({ score, level: 3, duration: secondsSince(startTime), detail: "Matched all cards" });
          }
          return next;
        });
        setChoice([]);
      }, 520);
    }
  };

  return (
    <GameShell game={game} title="Moves" score={moves} meta="Match all pairs" controls={game.controls} onStart={restart} running={false}>
      <div className="card-grid">
        {cards.map((card) => (
          <button key={card.id} type="button" className={`memory-card ${card.open || card.done ? "open" : ""}`} onClick={() => pick(card)}>
            {card.open || card.done ? card.value + 1 : ""}
          </button>
        ))}
      </div>
    </GameShell>
  );
}

function Twenty48Game({ game, onFinish, difficulty }) {
  const finish = useFinish(onFinish);
  const [grid, setGrid] = useState(() => addTile(addTile(empty2048())));
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const startTime = useRef(Date.now());

  const restart = () => {
    startTime.current = Date.now();
    setGrid(addTile(addTile(empty2048())));
    scoreRef.current = 0;
    setScore(0);
  };

  const playMove = useCallback(
    (dir) => {
      const { grid: moved, gained, changed } = move2048(grid, dir);
      if (!changed) return;
      playGameSound(game, gained ? "score" : "tap");
      const next = addTile(moved);
      setGrid(next);
      scoreRef.current += gained;
      setScore(scoreRef.current);
      if (!canMove2048(next)) {
        playGameSound(game, "over");
        finish({ score: scoreRef.current, level: Math.max(1, Math.floor(Math.log2(Math.max(...next.flat()))) - 7), duration: secondsSince(startTime), detail: "Tile merge" });
      }
    },
    [finish, grid]
  );

  useEffect(() => {
    const handler = (event) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.code)) {
        event.preventDefault();
        playMove(event.code.replace("Arrow", "").toLowerCase());
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [playMove]);

  return (
    <GameShell game={game} title="Score" score={score} meta="Merge to win" controls={game.controls} onStart={restart} running={false}>
      <div className="grid-2048">
        {grid.flat().map((value, index) => <span key={index} className={`tile tile-${value}`}>{value || ""}</span>)}
      </div>
      <div className="move-row">
        {["left", "up", "down", "right"].map((dir) => <ArcadeButton key={dir} onClick={() => playMove(dir)}>{dir}</ArcadeButton>)}
      </div>
      <ArcadeButton onClick={() => finish({ score: scoreRef.current, duration: secondsSince(startTime), detail: "Manual finish" })}>Submit run</ArcadeButton>
    </GameShell>
  );
}

function MinesGame({ game, onFinish, difficulty }) {
  const finish = useFinish(onFinish);
  const mineCount = difficulty === "easy" ? 6 : difficulty === "hard" ? 18 : 10;
  const [board, setBoard] = useState(() => makeMines(mineCount));
  const [status, setStatus] = useState("Find safe nodes");
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const startTime = useRef(Date.now());

  const restart = () => {
    startTime.current = Date.now();
    setBoard(makeMines(mineCount));
    setStatus("Find safe nodes");
    scoreRef.current = 0;
    setScore(0);
  };

  const reveal = (index) => {
    if (board[index].open) return;
    playGameSound(game, board[index].mine ? "over" : "tap");
    const next = board.map((cell, i) => (i === index ? { ...cell, open: true } : cell));
    setBoard(next);
    if (next[index].mine) {
      setStatus("Mine triggered");
      const finalScore = next.filter((cell) => cell.open && !cell.mine).length * 10;
      scoreRef.current = finalScore;
      setScore(finalScore);
      finish({ score: finalScore, level: 1, duration: secondsSince(startTime), detail: "Mine triggered" });
    } else if (next.filter((cell) => !cell.mine && !cell.open).length === 0) {
      setStatus("Field clear");
      playGameSound(game, "score");
      const finalScore = Math.max(50, 900 - secondsSince(startTime) * 5);
      scoreRef.current = finalScore;
      setScore(finalScore);
      finish({ score: finalScore, level: 4, duration: secondsSince(startTime), detail: "Field clear" });
    } else {
      const currentScore = next.filter((cell) => cell.open && !cell.mine).length * 10;
      scoreRef.current = currentScore;
      setScore(currentScore);
    }
  };

  return (
    <GameShell game={game} title="Safe" score={score} meta={status} controls={game.controls} onStart={restart} running={false}>
      <div className="mine-grid">
        {board.map((cell, index) => (
          <button key={index} type="button" className={`mine-cell ${cell.open ? "open" : ""} ${cell.open && cell.mine ? "mine" : ""}`} onClick={() => reveal(index)}>
            {cell.open ? (cell.mine ? "X" : cell.count || "") : ""}
          </button>
        ))}
      </div>
    </GameShell>
  );
}

function MazeGame({ game, onFinish, difficulty }) {
  const finish = useFinish(onFinish);
  const keys = useRef(new Set());
  const [player, setPlayer] = useState({ x: 1, y: 1 });
  const botList = difficulty === "easy" ? [{ x: 10, y: 10 }] :
                  difficulty === "hard" ? [{ x: 10, y: 10 }, { x: 6, y: 7 }, { x: 2, y: 10 }] :
                  [{ x: 10, y: 10 }, { x: 6, y: 7 }];
  const [bots, setBots] = useState(botList);
  const [dots, setDots] = useState(() => Array.from({ length: 32 }, () => randomCell(new Set(["1:1"]), 12)));
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const startTime = useRef(Date.now());
  useKeys(keys);

  const restart = () => {
    startTime.current = Date.now();
    setPlayer({ x: 1, y: 1 });
    setBots(botList);
    setDots(Array.from({ length: 32 }, () => randomCell(new Set(["1:1"]), 12)));
    scoreRef.current = 0;
    setScore(0);
    setRunning(true);
  };

  useInterval(
    () => {
      let nextPlayer = { ...player };
      if (keys.current.has("ArrowLeft") || keys.current.has("KeyA")) nextPlayer.x -= 1;
      if (keys.current.has("ArrowRight") || keys.current.has("KeyD")) nextPlayer.x += 1;
      if (keys.current.has("ArrowUp") || keys.current.has("KeyW")) nextPlayer.y -= 1;
      if (keys.current.has("ArrowDown") || keys.current.has("KeyS")) nextPlayer.y += 1;
      nextPlayer.x = Math.max(0, Math.min(11, nextPlayer.x));
      nextPlayer.y = Math.max(0, Math.min(11, nextPlayer.y));

      const chaseRate = difficulty === "easy" ? 0.35 : difficulty === "hard" ? 0.8 : 0.6;
      const nextBots = bots.map((bot) => {
        const shouldChase = Math.random() < chaseRate;
        if (shouldChase) {
          const dx = nextPlayer.x - bot.x;
          const dy = nextPlayer.y - bot.y;
          let nextBot = { ...bot };
          if (dx !== 0 && dy !== 0) {
            const axis = Math.abs(dx) > Math.abs(dy) ? "x" : Math.abs(dy) > Math.abs(dx) ? "y" : (Math.random() > 0.5 ? "x" : "y");
            if (axis === "x") {
              nextBot.x += dx > 0 ? 1 : -1;
            } else {
              nextBot.y += dy > 0 ? 1 : -1;
            }
          } else if (dx !== 0) {
            nextBot.x += dx > 0 ? 1 : -1;
          } else if (dy !== 0) {
            nextBot.y += dy > 0 ? 1 : -1;
          }
          nextBot.x = Math.max(0, Math.min(11, nextBot.x));
          nextBot.y = Math.max(0, Math.min(11, nextBot.y));
          return nextBot;
        } else {
          const axis = Math.random() > 0.5 ? "x" : "y";
          return { ...bot, [axis]: Math.max(0, Math.min(11, bot[axis] + (Math.random() > 0.5 ? 1 : -1))) };
        }
      });

      const ate = dots.some((dot) => dot.x === nextPlayer.x && dot.y === nextPlayer.y);
      let nextDots = dots;
      if (ate) {
        playGameSound(game, "eat");
        scoreRef.current += 12;
        setScore(scoreRef.current);
        nextDots = dots.filter((dot) => dot.x !== nextPlayer.x || dot.y !== nextPlayer.y);
      }

      setPlayer(nextPlayer);
      setBots(nextBots);
      setDots(nextDots);

      if (nextBots.some((bot) => bot.x === nextPlayer.x && bot.y === nextPlayer.y)) {
        setRunning(false);
        playGameSound(game, "over");
        finish({ score: scoreRef.current, level: Math.max(1, Math.floor(scoreRef.current / 100) + 1), duration: secondsSince(startTime), detail: "Maze chase" });
        return;
      }

      if (!nextDots.length) {
        setRunning(false);
        playGameSound(game, "score");
        finish({ score: scoreRef.current + 300, level: 4, duration: secondsSince(startTime), detail: "Maze clear" });
      }
    },
    150,
    running
  );

  const dotKeys = new Set(dots.map(keyOf));
  const botKeys = new Set(bots.map(keyOf));
  return (
    <GameShell game={game} title="Score" score={score} meta={`${dots.length} lights left`} controls={game.controls} onStart={restart} running={running}>
      <div className="pixel-board maze-board" style={{ gridTemplateColumns: "repeat(12, 1fr)" }}>
        {Array.from({ length: 144 }, (_, index) => {
          const cell = { x: index % 12, y: Math.floor(index / 12) };
          const key = keyOf(cell);
          return <span key={key} className={`pixel ${player.x === cell.x && player.y === cell.y ? "player-cell" : ""} ${dotKeys.has(key) ? "food-cell" : ""} ${botKeys.has(key) ? "enemy-cell" : ""}`} />;
        })}
      </div>
    </GameShell>
  );
}

function RacingGame({ game, onFinish, difficulty }) {
  const finish = useFinish(onFinish);
  const canvasRef = useRef(null);
  const state = useRef(null);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const startTime = useRef(Date.now());
  const particlesRef = useRef([]);
  const shakeRef = useRef({ duration: 0, magnitude: 0 });

  const start = () => {
    startTime.current = Date.now();
    state.current = { lane: 1, cars: [], ticks: 0 };
    particlesRef.current = [];
    shakeRef.current = { duration: 0, magnitude: 0 };
    scoreRef.current = 0;
    setScore(0);
    setRunning(true);
  };

  useEffect(() => {
    const handler = (event) => {
      if (!running || !state.current) return;
      if (["ArrowLeft", "ArrowRight", "KeyA", "KeyD"].includes(event.code)) {
        event.preventDefault();
      }
      if (event.code === "ArrowLeft" || event.code === "KeyA") {
        state.current.lane = Math.max(0, state.current.lane - 1);
      }
      if (event.code === "ArrowRight" || event.code === "KeyD") {
        state.current.lane = Math.min(2, state.current.lane + 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [running]);

  useInterval(
    () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !state.current) return;
      const s = state.current;
      if (!running) {
        if (Math.random() < 0.04 && particlesRef.current.length < 60) {
          createNeonExplosion(particlesRef.current, Math.random() * 660, Math.random() * 200 + 40, ["#2ff6d0", "#ff4ad8", "#ffcc4d", "#70ff7a", "#60a5fa"], 12);
        }
        drawRacing(ctx, s, game, canvas, shakeRef.current, particlesRef.current);
        return;
      }
      s.ticks += 1;
      const spawnRate = difficulty === "easy" ? 44 : difficulty === "hard" ? 22 : 32;
      const baseSpeed = difficulty === "easy" ? 4.0 : difficulty === "hard" ? 9.5 : 6.5;
      const speedScale = difficulty === "easy" ? 400 : difficulty === "hard" ? 150 : 260;

      if (s.ticks % spawnRate === 0) s.cars.push({ lane: Math.floor(Math.random() * 3), y: -60 });
      s.cars.forEach((car) => (car.y += baseSpeed + scoreRef.current / speedScale));

      const laneX = (lane) => lane * 220 + 88;
      particlesRef.current.push({
        x: laneX(s.lane) + 27,
        y: 418,
        vx: (Math.random() - 0.5) * 1.5,
        vy: Math.random() * 2 + 2,
        color: game.colors[1],
        radius: Math.random() * 4 + 2,
        opacity: 0.7,
        decay: 0.04
      });

      s.cars = s.cars.filter((car) => car.y < 500);
      scoreRef.current += 1;
      setScore(scoreRef.current);
      if (s.cars.some((car) => car.lane === s.lane && car.y > 318 && car.y < 386)) {
        setRunning(false);
        playGameSound(game, "over");
        createNeonExplosion(particlesRef.current, laneX(s.lane) + 27, 386, ["#ffffff", game.colors[1]], 20);
        shakeRef.current = { duration: 25, magnitude: 10 };
        finish({ score: scoreRef.current, level: Math.max(1, Math.floor(scoreRef.current / 200) + 1), duration: secondsSince(startTime), detail: "Distance run" });
      }
      drawRacing(ctx, s, game, canvas, shakeRef.current, particlesRef.current);
    },
    30,
    running
  );

  return (
    <GameShell game={game} title="Distance" score={score} meta="Dodge traffic" controls={game.controls} onStart={start} running={running}>
      <canvas className="arcade-canvas" width="660" height="430" ref={canvasRef} />
    </GameShell>
  );
}

function drawRacing(ctx, s, game, canvas, shake, particles) {
  const dpr = window.devicePixelRatio || 1;
  const expectedW = 660 * dpr;
  const expectedH = 430 * dpr;
  if (canvas.width !== expectedW || canvas.height !== expectedH) {
    canvas.width = expectedW;
    canvas.height = expectedH;
    canvas.style.width = "100%";
    canvas.style.height = "auto";
  }

  ctx.save();
  ctx.scale(dpr, dpr);

  applyCanvasShake(ctx, shake);

  ctx.clearRect(0, 0, 660, 430);
  drawCanvasBackdrop(ctx, game);
  const road = ctx.createLinearGradient(0, 0, 0, 430);
  road.addColorStop(0, "rgba(255,255,255,0.04)");
  road.addColorStop(1, "rgba(255,255,255,0.12)");
  ctx.fillStyle = road;
  roundedRect(ctx, 52, 0, 556, 430, 24);
  ctx.fill();
  [220, 440].forEach((x) => {
    ctx.strokeStyle = "rgba(255,255,255,0.28)";
    ctx.setLineDash([18, 18]);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 430);
    ctx.stroke();
    ctx.setLineDash([]);
  });
  const laneX = (lane) => lane * 220 + 88;
  drawCar(ctx, laneX(s.lane), 352, game.colors[1], true);
  s.cars.forEach((car) => drawCar(ctx, laneX(car.lane), car.y, "#ffffff"));

  updateAndDrawParticles(ctx, particles);
  ctx.restore();
}

function TowerGame({ game, onFinish, difficulty }) {
  const finish = useFinish(onFinish);
  const [turrets, setTurrets] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [coins, setCoins] = useState(60);
  const [health, setHealth] = useState(8);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const scoreRef = useRef(0);
  const healthRef = useRef(8);
  const startTime = useRef(Date.now());
  const slots = [{ x: 2, y: 2 }, { x: 5, y: 3 }, { x: 8, y: 2 }, { x: 3, y: 6 }, { x: 7, y: 7 }, { x: 10, y: 5 }];

  const restart = () => {
    startTime.current = Date.now();
    setTurrets([]);
    setEnemies([]);
    const initialCoins = difficulty === "easy" ? 90 : difficulty === "hard" ? 40 : 60;
    const initialHealth = difficulty === "easy" ? 12 : difficulty === "hard" ? 5 : 8;
    setCoins(initialCoins);
    healthRef.current = initialHealth;
    setHealth(initialHealth);
    scoreRef.current = 0;
    setScore(0);
    setRunning(true);
  };

  const build = (slot) => {
    if (coins < 20 || turrets.some((t) => t.x === slot.x && t.y === slot.y)) return;
    playGameSound(game, "score");
    setTurrets((current) => [...current, slot]);
    setCoins((value) => value - 20);
  };

  useInterval(
    () => {
      let nextEnemies = enemies.map((enemy) => ({
        ...enemy,
        x: enemy.x + 1,
        hp: enemy.hp - turrets.filter((t) => Math.abs(t.x - enemy.x) <= 2 && Math.abs(t.y - enemy.y) <= 2).length
      }));
      const defeated = nextEnemies.filter((enemy) => enemy.hp <= 0).length;
      if (defeated) {
        playGameSound(game, "hit");
        scoreRef.current += defeated * 25;
        setScore(scoreRef.current);
        setCoins((value) => value + defeated * 8);
      }
      nextEnemies = nextEnemies.filter((enemy) => enemy.hp > 0);
      const escaped = nextEnemies.filter((enemy) => enemy.x > 11).length;
      if (escaped) {
        healthRef.current -= escaped;
        setHealth(healthRef.current);
      }
      const filteredEnemies = nextEnemies.filter((enemy) => enemy.x <= 11);

      if (Math.random() > 0.56) {
        filteredEnemies.push({
          x: 0,
          y: [1, 4, 8][Math.floor(Math.random() * 3)],
          hp: 2 + Math.floor(scoreRef.current / 180)
        });
      }
      setEnemies(filteredEnemies);

      if (healthRef.current <= 0) {
        setRunning(false);
        playGameSound(game, "over");
        finish({ score: scoreRef.current, level: Math.max(1, Math.floor(scoreRef.current / 180) + 1), duration: secondsSince(startTime), detail: "Waves held" });
      }
    },
    650,
    running
  );

  return (
    <GameShell game={game} title="Score" score={score} meta={`Coins ${coins} / Base ${health}`} controls={game.controls} onStart={restart} running={running}>
      <div className="pixel-board tower-board" style={{ gridTemplateColumns: "repeat(12, 1fr)" }}>
        {Array.from({ length: 108 }, (_, index) => {
          const cell = { x: index % 12, y: Math.floor(index / 12) };
          const slot = slots.find((s) => s.x === cell.x && s.y === cell.y);
          const turret = turrets.find((t) => t.x === cell.x && t.y === cell.y);
          const enemy = enemies.find((e) => e.x === cell.x && e.y === cell.y);
          return <button key={index} type="button" className={`pixel ${slot ? "build-cell" : ""} ${turret ? "turret-cell" : ""} ${enemy ? "enemy-cell" : ""}`} onClick={() => slot && build(slot)} />;
        })}
      </div>
    </GameShell>
  );
}

function WhackGame({ game, onFinish, difficulty }) {
  const finish = useFinish(onFinish);
  const [active, setActive] = useState(4);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [time, setTime] = useState(30);
  const [running, setRunning] = useState(false);

  const restart = () => {
    setActive(Math.floor(Math.random() * 9));
    scoreRef.current = 0;
    setScore(0);
    setTime(30);
    setRunning(true);
  };

  useInterval(() => {
    setTime((value) => {
      if (value <= 1) {
        setRunning(false);
        playGameSound(game, "over");
        finish({ score: scoreRef.current, level: Math.max(1, Math.floor(scoreRef.current / 120) + 1), duration: 30, detail: "Bots hit" });
        return 0;
      }
      return value - 1;
    });
  }, 1000, running);

  const whackDelay = difficulty === "easy" ? 950 : difficulty === "hard" ? 380 : 620;
  useInterval(() => setActive(Math.floor(Math.random() * 9)), whackDelay, running);

  const hit = (index) => {
    if (!running) return;
    if (index === active) {
      playGameSound(game, "score");
      scoreRef.current += 15;
      setScore(scoreRef.current);
      setActive(Math.floor(Math.random() * 9));
    } else {
      playGameSound(game, "hit");
      scoreRef.current = Math.max(0, scoreRef.current - 5);
      setScore(scoreRef.current);
    }
  };

  return (
    <GameShell game={game} title="Score" score={score} meta={`${time}s`} controls={game.controls} onStart={restart} running={running}>
      <div className="whack-grid">
        {Array.from({ length: 9 }, (_, index) => <button key={index} type="button" className={`bot-hole ${index === active && running ? "active" : ""}`} onClick={() => hit(index)}>{index === active && running ? "BOT" : ""}</button>)}
      </div>
    </GameShell>
  );
}

const VALID_DICTIONARY = new Set([
  // Game list words
  "NEON", "GRID", "TOWER", "PONG", "BOT", "LOOP", "PLAY", "GAME", "DISK", "CHIP", "CORE", "LINK", "PIXEL", "SHIFT", "BYTE",
  "ARCADE", "VECTOR", "PLAYER", "ROCKET", "PUZZLE", "RACING", "CYBER", "MATRIX", "RETRO", "GLITCH", "SYNTH", "SHIELD", "SCREEN",
  "SPACESHOOTER", "NEONARCADE", "VECTORRUN", "WORLDARCADE", "CYBERPUNK", "LEVELDESIGN", "HIGHSCORE", "DEVELOPER", "ALGORITHM", "SYNTHWAVE",
  // Common valid English anagrams of the game words
  "POOL", "POLO", "WROTE", "MEGA", "KILN", "GIRD", "ACRE", "RACE", "CARE"
]);

function WordGame({ game, onFinish, difficulty, autoStart }) {
  const finish = useFinish(onFinish);
  const [word, setWord] = useState("");
  const [scrambled, setScrambled] = useState("");
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const startTime = useRef(Date.now());
  const [running, setRunning] = useState(false);
  const textareaRef = useRef(null);

  const nextWord = (currentWord) => {
    const easyList = ["NEON", "GRID", "TOWER", "PONG", "BOT", "LOOP", "PLAY", "GAME", "DISK", "CHIP", "CORE", "LINK", "PIXEL", "SHIFT", "BYTE"];
    const mediumList = ["ARCADE", "VECTOR", "PLAYER", "ROCKET", "PUZZLE", "RACING", "CYBER", "MATRIX", "RETRO", "GLITCH", "SYNTH", "SHIELD", "SCREEN"];
    const hardList = ["SPACESHOOTER", "NEONARCADE", "VECTORRUN", "WORLDARCADE", "CYBERPUNK", "LEVELDESIGN", "HIGHSCORE", "DEVELOPER", "ALGORITHM", "SYNTHWAVE"];

    const list = difficulty === "easy" ? easyList :
                 difficulty === "hard" ? hardList :
                 mediumList;
    if (list.length <= 1) return list[0];
    let next = list[Math.floor(Math.random() * list.length)];
    while (next === currentWord) {
      next = list[Math.floor(Math.random() * list.length)];
    }
    return next;
  };

  const scrambleWord = (w) => {
    if (w.length <= 1) return w;
    let s = w;
    let attempts = 0;
    while (s === w && attempts < 20) {
      s = shuffle(w.split("")).join("");
      attempts++;
    }
    return s;
  };

  const restart = () => {
    startTime.current = Date.now();
    const newW = nextWord("");
    setWord(newW);
    setScrambled(scrambleWord(newW));
    setInput("");
    scoreRef.current = 0;
    setScore(0);
    setRunning(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  const handleInputChange = (val) => {
    if (!running) return;
    const cleanVal = val.toUpperCase().replace(/[^A-Z]/g, "").slice(0, word.length);
    setInput(cleanVal);

    const isCorrectWord = cleanVal === word;
    const isAnagram = cleanVal.split("").sort().join("") === word.split("").sort().join("");
    const isAlternativeValid = isAnagram && VALID_DICTIONARY.has(cleanVal);

    if (isCorrectWord || isAlternativeValid) {
      playGameSound(game, "score");
      scoreRef.current += 1;
      setScore(scoreRef.current);
      const newW = nextWord(word);
      setWord(newW);
      setScrambled(scrambleWord(newW));
      setInput("");
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 20);
    }
  };

  const submit = (event) => {
    if (event) event.preventDefault();
    if (!running) return;

    const typedWord = input.trim().toUpperCase();
    const isCorrectWord = typedWord === word;
    const isAnagram = typedWord.split("").sort().join("") === word.split("").sort().join("");
    const isAlternativeValid = isAnagram && VALID_DICTIONARY.has(typedWord);

    if (isCorrectWord || isAlternativeValid) {
      playGameSound(game, "score");
      scoreRef.current += 1;
      setScore(scoreRef.current);
      const newW = nextWord(word);
      setWord(newW);
      setScrambled(scrambleWord(newW));
      setInput("");
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 20);
    } else {
      // Wrong guess triggers immediate game-over
      setRunning(false);
      playGameSound(game, "over");
      finish({ score: scoreRef.current, level: Math.max(1, Math.floor(scoreRef.current / 5) + 1), duration: secondsSince(startTime), detail: `WRONG! The correct word was: ${word}` });

      // Reset input immediately and scramble a fresh word so the background doesn't show old failed state
      setInput("");
      const freshW = nextWord(word);
      setWord(freshW);
      setScrambled(scrambleWord(freshW));
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  };

  const clearInput = () => {
    if (!running) return;
    setInput("");
    textareaRef.current?.focus();
  };

  const reshuffle = () => {
    if (!running) return;
    setScrambled(scrambleWord(word));
    textareaRef.current?.focus();
  };

  const usedIndices = useMemo(() => {
    const scrambledArr = scrambled.split("");
    const indices = [];
    for (const char of input.toUpperCase()) {
      const idx = scrambledArr.findIndex((c, i) => c === char && !indices.includes(i));
      if (idx !== -1) {
        indices.push(idx);
      }
    }
    return indices;
  }, [scrambled, input]);

  const handleTileClick = (letter, idx) => {
    if (!running) return;
    textareaRef.current?.focus();
    if (usedIndices.includes(idx)) return;

    if (input.length < word.length) {
      const nextVal = input + letter;
      handleInputChange(nextVal);
    }
  };

  // Initialize WordGame word
  useEffect(() => {
    const initialW = nextWord("");
    setWord(initialW);
    setScrambled(scrambleWord(initialW));

    if (autoStart) {
      const timer = setTimeout(() => {
        restart();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [difficulty, autoStart]);

  return (
    <GameShell game={game} title="Score" score={score} meta="Sudden Death" controls={game.controls} onStart={restart} running={running}>
      <div className="word-scramble-container">
        {/* Scrambled letters tiles */}
        <div className="scrambled-tiles">
          {(scrambled || word).split("").map((letter, idx) => {
            const isUsed = usedIndices.includes(idx);
            return (
              <button
                key={idx}
                type="button"
                className={`scramble-tile ${isUsed ? "used" : ""}`}
                onClick={() => handleTileClick(letter, idx)}
                disabled={!running || isUsed}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* Blank slot indicators */}
        <div className="guess-slots">
          {Array.from({ length: (word || "WORD").length }).map((_, idx) => {
            const char = input[idx] || "";
            return (
              <div
                key={idx}
                className={`guess-slot ${char ? "filled" : ""} ${running && idx === input.length ? "active" : ""}`}
              >
                {char}
              </div>
            );
          })}
        </div>

        {/* Console-terminal text entry */}
        <div className="scramble-entry-wrapper">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="scramble-textarea"
            placeholder={running ? "Type guess here or click tiles..." : "Press START to play"}
            disabled={!running}
            rows={2}
          />
        </div>

        {/* Actions panel */}
        <div className="scramble-actions">
          <ArcadeButton type="button" onClick={reshuffle} disabled={!running} className="action-btn shuffle-btn">
            Shuffle
          </ArcadeButton>
          <ArcadeButton type="button" onClick={clearInput} disabled={!running} className="action-btn clear-btn">
            Clear
          </ArcadeButton>
          <ArcadeButton type="button" onClick={submit} disabled={!running} className="action-btn submit-btn">
            Submit
          </ArcadeButton>
        </div>
      </div>
    </GameShell>
  );
}

function CheckersGame({ game, onFinish, difficulty }) {
  const finish = useFinish(onFinish);
  const [pieces, setPieces] = useState(makeCheckers());
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const startTime = useRef(Date.now());

  const restart = () => {
    startTime.current = Date.now();
    setPieces(makeCheckers());
    setSelected(null);
    scoreRef.current = 0;
    setScore(0);
  };

  const clickCell = (x, y) => {
    const piece = pieces.find((p) => p.x === x && p.y === y);
    if (piece?.side === "player") {
      playGameSound(game, "tap");
      setSelected(piece);
      return;
    }
    if (!selected) return;
    const dx = x - selected.x;
    const dy = y - selected.y;
    const target = pieces.find((p) => p.x === x && p.y === y);
    if (target) return;
    const jumped = pieces.find((p) => p.side === "ai" && p.x === selected.x + dx / 2 && p.y === selected.y + dy / 2);
    const legalMove = Math.abs(dx) === 1 && dy === -1;
    const legalJump = Math.abs(dx) === 2 && dy === -2 && jumped;
    if (!legalMove && !legalJump) return;
    let next = pieces.map((p) => (p.id === selected.id ? { ...p, x, y } : p));
    if (legalJump) {
      playGameSound(game, "score");
      next = next.filter((p) => p.id !== jumped.id);
      scoreRef.current += 80;
      setScore(scoreRef.current);
    } else {
      playGameSound(game, "tap");
      scoreRef.current += 10;
      setScore(scoreRef.current);
    }
    setSelected(null);
    const aiPieces = next.filter((p) => p.side === "ai");
    if (!aiPieces.length) {
      playGameSound(game, "score");
      finish({ score: scoreRef.current + 400, level: 4, duration: secondsSince(startTime), detail: "Board won" });
      setPieces(next);
      return;
    }
    const ai = aiPieces[Math.floor(Math.random() * aiPieces.length)];
    const moves = [-1, 1].map((dir) => ({ x: ai.x + dir, y: ai.y + 1 })).filter((m) => m.x >= 0 && m.x < 8 && m.y < 8 && !next.some((p) => p.x === m.x && p.y === m.y));
    if (moves.length) {
      const move = moves[Math.floor(Math.random() * moves.length)];
      next = next.map((p) => (p.id === ai.id ? { ...p, ...move } : p));
    }
    setPieces(next);
  };

  return (
    <GameShell game={game} title="Score" score={score} meta="You play green" controls={game.controls} onStart={restart} running={false}>
      <div className="checkers-board">
        {Array.from({ length: 64 }, (_, index) => {
          const x = index % 8;
          const y = Math.floor(index / 8);
          const piece = pieces.find((p) => p.x === x && p.y === y);
          return (
            <button key={index} type="button" className={`checker-cell ${(x + y) % 2 ? "dark" : ""}`} onClick={() => clickCell(x, y)}>
               {piece ? <span className={`checker-piece ${piece.side} ${selected?.id === piece.id ? "selected" : ""}`} /> : null}
            </button>
          );
        })}
      </div>
      <ArcadeButton onClick={() => finish({ score: scoreRef.current, duration: secondsSince(startTime), detail: "Checkers run" })}>Submit run</ArcadeButton>
    </GameShell>
  );
}

function useKeys(keys) {
  useEffect(() => {
    const down = (event) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "KeyA", "KeyD", "KeyW", "KeyS", "KeyJ"].includes(event.code)) {
        event.preventDefault();
      }
      keys.current.add(event.code);
    };
    const up = (event) => keys.current.delete(event.code);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [keys]);
}

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawCar(ctx, x, y, color, player = false) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = player ? 18 : 9;
  ctx.fillStyle = color;
  roundedRect(ctx, x, y, 54, 70, 14);
  ctx.fill();
  ctx.fillStyle = player ? "rgba(255,255,255,0.64)" : "rgba(7,17,31,0.42)";
  roundedRect(ctx, x + 10, y + 10, 34, 18, 7);
  ctx.fill();
  ctx.fillStyle = "rgba(7,17,31,0.72)";
  roundedRect(ctx, x - 5, y + 12, 8, 18, 4);
  ctx.fill();
  roundedRect(ctx, x + 51, y + 12, 8, 18, 4);
  ctx.fill();
  roundedRect(ctx, x - 5, y + 45, 8, 18, 4);
  ctx.fill();
  roundedRect(ctx, x + 51, y + 45, 8, 18, 4);
  ctx.fill();
  ctx.fillStyle = player ? "#ffffff" : color;
  roundedRect(ctx, x + 13, y + 50, 28, 8, 4);
  ctx.fill();
  ctx.restore();
}

function drawCanvasBackdrop(ctx, game) {
  const gradient = ctx.createLinearGradient(0, 0, 660, 430);
  gradient.addColorStop(0, game.colors[2]);
  gradient.addColorStop(1, "#07111f");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 660, 430);
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  for (let x = 0; x < 660; x += 44) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 430);
    ctx.stroke();
  }
  for (let y = 0; y < 430; y += 44) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(660, y);
    ctx.stroke();
  }
}

function secondsSince(ref) {
  return Math.max(1, Math.round((Date.now() - ref.current) / 1000));
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function empty2048() {
  return Array.from({ length: 4 }, () => Array(4).fill(0));
}

function addTile(grid) {
  const open = [];
  grid.forEach((row, y) => row.forEach((value, x) => !value && open.push({ x, y })));
  if (!open.length) return grid;
  const pick = open[Math.floor(Math.random() * open.length)];
  const next = grid.map((row) => [...row]);
  next[pick.y][pick.x] = Math.random() > 0.85 ? 4 : 2;
  return next;
}

function move2048(grid, dir) {
  let gained = 0;
  let changed = false;
  const next = empty2048();
  const lines = [0, 1, 2, 3].map((i) => {
    if (dir === "left") return grid[i];
    if (dir === "right") return [...grid[i]].reverse();
    if (dir === "up") return [grid[0][i], grid[1][i], grid[2][i], grid[3][i]];
    return [grid[3][i], grid[2][i], grid[1][i], grid[0][i]];
  });
  const merged = lines.map((line) => {
    const values = line.filter(Boolean);
    const result = [];
    for (let i = 0; i < values.length; i += 1) {
      if (values[i] === values[i + 1]) {
        result.push(values[i] * 2);
        gained += values[i] * 2;
        i += 1;
      } else {
        result.push(values[i]);
      }
    }
    return [...result, ...Array(4 - result.length).fill(0)];
  });
  merged.forEach((line, i) => {
    const values = dir === "right" || dir === "down" ? [...line].reverse() : line;
    values.forEach((value, j) => {
      if (dir === "left" || dir === "right") next[i][j] = value;
      else next[j][i] = value;
    });
  });
  changed = JSON.stringify(next) !== JSON.stringify(grid);
  return { grid: next, gained, changed };
}

function canMove2048(grid) {
  if (grid.flat().some((value) => !value)) return true;
  return ["left", "right", "up", "down"].some((dir) => move2048(grid, dir).changed);
}

function makeMines(mineCount = 10) {
  const mines = new Set();
  while (mines.size < mineCount) mines.add(Math.floor(Math.random() * 81));
  return Array.from({ length: 81 }, (_, index) => {
    const x = index % 9;
    const y = Math.floor(index / 9);
    let count = 0;
    for (let dx = -1; dx <= 1; dx += 1) {
      for (let dy = -1; dy <= 1; dy += 1) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < 9 && ny >= 0 && ny < 9 && mines.has(ny * 9 + nx)) count += 1;
      }
    }
    return { mine: mines.has(index), count, open: false };
  });
}

function makeCheckers() {
  const pieces = [];
  let id = 0;
  for (let y = 0; y < 3; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      if ((x + y) % 2) pieces.push({ id: `a-${id++}`, side: "ai", x, y });
    }
  }
  for (let y = 5; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      if ((x + y) % 2) pieces.push({ id: `p-${id++}`, side: "player", x, y });
    }
  }
  return pieces;
}

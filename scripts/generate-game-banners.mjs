import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "client", "public", "banners");

const banners = [
  ["snake", "Snake", "#0f766e", "#2ff6d0", "snake"],
  ["tetris", "Tetris", "#334155", "#ffcc4d", "blocks"],
  ["pong", "Pong", "#0f172a", "#70ff7a", "pong"],
  ["breakout", "Breakout", "#1e1b4b", "#ff4ad8", "bricks"],
  ["space-shooter", "Space Shooter", "#111827", "#60a5fa", "ship"],
  ["flappy-drone", "Flappy Drone", "#082f49", "#38bdf8", "drone"],
  ["memory-match", "Memory Match", "#312e81", "#a78bfa", "cards"],
  ["2048", "2048", "#7c2d12", "#fb923c", "tiles"],
  ["minesweeper", "Minesweeper", "#164e63", "#22d3ee", "mines"],
  ["pac-maze", "Pac-Man Style Maze", "#581c87", "#facc15", "maze"],
  ["racing-runner", "Racing Runner", "#0f172a", "#ef4444", "road"],
  ["tower-defense", "Tower Defense Mini", "#064e3b", "#34d399", "tower"],
  ["whack-a-bot", "Whack-a-Bot", "#4a044e", "#f0abfc", "bot"],
  ["word-scramble", "Word Scramble", "#713f12", "#fde047", "words"],
  ["checkers", "Checkers", "#111827", "#f97316", "checkers"]
];

function esc(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[char]);
}

function background(id, a, b) {
  return `
  <defs>
    <linearGradient id="g-${id}" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="${a}"/>
      <stop offset="58%" stop-color="#08111f"/>
      <stop offset="100%" stop-color="${b}"/>
    </linearGradient>
    <radialGradient id="pulse-${id}" cx="30%" cy="35%" r="55%">
      <stop offset="0%" stop-color="${b}" stop-opacity=".55"/>
      <stop offset="100%" stop-color="${b}" stop-opacity="0"/>
    </radialGradient>
    <filter id="glow-${id}" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="960" height="420" fill="url(#g-${id})"/>
  <rect width="960" height="420" fill="url(#pulse-${id})"/>
  <g opacity=".16">
    ${Array.from({ length: 25 }, (_, i) => `<path d="M${i * 44} 0V420" stroke="#fff"/>`).join("")}
    ${Array.from({ length: 12 }, (_, i) => `<path d="M0 ${i * 42}H960" stroke="#fff"/>`).join("")}
  </g>`;
}

const shapes = {
  snake: (b) => `
    <path d="M160 244 C245 132 355 336 458 205 S675 140 802 236" fill="none" stroke="${b}" stroke-width="54" stroke-linecap="round" filter="url(#glow-snake)"/>
    <path d="M785 226 C840 205 880 232 872 266 C861 311 778 306 752 265" fill="${b}" filter="url(#glow-snake)"/>
    <circle cx="828" cy="244" r="8" fill="#06111d"/>
    <circle cx="856" cy="260" r="8" fill="#06111d"/>
    <circle cx="620" cy="128" r="26" fill="#ffcc4d" filter="url(#glow-snake)"/>`,
  blocks: (b) => `
    ${[[218, 90], [298, 90], [378, 90], [298, 170], [540, 125], [620, 125], [540, 205], [620, 205]].map(([x, y]) => `<rect x="${x}" y="${y}" width="74" height="74" rx="10" fill="${b}" filter="url(#glow-tetris)"/>`).join("")}
    <rect x="450" y="80" width="74" height="234" rx="10" fill="#fff" opacity=".82"/>`,
  pong: (b) => `
    <rect x="132" y="86" width="24" height="236" rx="12" fill="${b}" filter="url(#glow-pong)"/>
    <rect x="804" y="126" width="24" height="236" rx="12" fill="${b}" filter="url(#glow-pong)"/>
    <circle cx="490" cy="210" r="28" fill="#fff" filter="url(#glow-pong)"/>
    <path d="M480 24V396" stroke="#fff" stroke-dasharray="18 18" opacity=".34"/>`,
  bricks: (b) => `
    ${Array.from({ length: 28 }, (_, i) => {
      const x = 130 + (i % 7) * 100;
      const y = 76 + Math.floor(i / 7) * 52;
      return `<rect x="${x}" y="${y}" width="82" height="34" rx="8" fill="${i % 2 ? b : "#fff"}" opacity="${i % 2 ? 1 : 0.86}" filter="url(#glow-breakout)"/>`;
    }).join("")}
    <rect x="390" y="336" width="180" height="22" rx="11" fill="${b}" filter="url(#glow-breakout)"/>
    <circle cx="510" cy="282" r="20" fill="#fff"/>`,
  ship: (b) => `
    <path d="M480 78 L570 320 L480 272 L390 320 Z" fill="${b}" filter="url(#glow-space-shooter)"/>
    <ellipse cx="480" cy="226" rx="34" ry="58" fill="#fff" opacity=".76"/>
    <circle cx="230" cy="106" r="18" fill="#fff" opacity=".68"/>
    <circle cx="720" cy="142" r="28" fill="#ff4ad8" filter="url(#glow-space-shooter)"/>
    <path d="M218 230H742" stroke="#fff" stroke-dasharray="12 24" opacity=".25"/>`,
  drone: (b) => `
    <ellipse cx="480" cy="210" rx="96" ry="54" fill="#fff" opacity=".88" filter="url(#glow-flappy-drone)"/>
    <rect x="310" y="198" width="340" height="24" rx="12" fill="${b}"/>
    <circle cx="302" cy="210" r="46" fill="none" stroke="${b}" stroke-width="16" filter="url(#glow-flappy-drone)"/>
    <circle cx="658" cy="210" r="46" fill="none" stroke="${b}" stroke-width="16" filter="url(#glow-flappy-drone)"/>
    <rect x="720" y="0" width="56" height="142" rx="18" fill="${b}" opacity=".76"/>
    <rect x="720" y="270" width="56" height="160" rx="18" fill="${b}" opacity=".76"/>`,
  cards: (b) => `
    ${[0, 1, 2, 3, 4].map((i) => `<rect x="${250 + i * 78}" y="${96 + (i % 2) * 34}" width="108" height="150" rx="16" fill="${i % 2 ? b : "#fff"}" opacity=".9" transform="rotate(${(i - 2) * 7} ${304 + i * 78} ${171 + (i % 2) * 34})" filter="url(#glow-memory-match)"/>`).join("")}
    <circle cx="480" cy="210" r="34" fill="#07111f" opacity=".55"/>`,
  tiles: (b) => `
    ${[2, 4, 8, 16, 32, 64, 128, 256].map((n, i) => `<rect x="${182 + (i % 4) * 150}" y="${80 + Math.floor(i / 4) * 132}" width="116" height="100" rx="14" fill="${i % 2 ? b : "#fff"}" opacity=".9" filter="url(#glow-2048)"/><text x="${240 + (i % 4) * 150}" y="${142 + Math.floor(i / 4) * 132}" text-anchor="middle" font-family="Arial" font-size="38" font-weight="900" fill="#07111f">${n}</text>`).join("")}`,
  mines: (b) => `
    ${Array.from({ length: 45 }, (_, i) => `<rect x="${178 + (i % 9) * 68}" y="${68 + Math.floor(i / 9) * 58}" width="48" height="42" rx="7" fill="${i % 7 === 0 ? "#ff4ad8" : i % 3 === 0 ? b : "#fff"}" opacity="${i % 7 === 0 ? 1 : .72}" filter="url(#glow-minesweeper)"/>`).join("")}`,
  maze: (b) => `
    <path d="M158 78H804V342H158V78ZM238 78V270H314V150H420V342M510 78V198H652V342M238 270H652M420 150H804" fill="none" stroke="${b}" stroke-width="28" stroke-linejoin="round" filter="url(#glow-pac-maze)"/>
    <circle cx="210" cy="126" r="26" fill="#fff"/>
    <circle cx="715" cy="292" r="24" fill="#ff4ad8"/>`,
  road: (b) => `
    <path d="M314 420 L406 0 H554 L646 420 Z" fill="#111827" opacity=".85"/>
    <path d="M480 0V420" stroke="#fff" stroke-width="14" stroke-dasharray="34 30" opacity=".5"/>
    <rect x="428" y="260" width="104" height="124" rx="22" fill="${b}" filter="url(#glow-racing-runner)"/>
    <rect x="446" y="284" width="68" height="30" rx="12" fill="#fff" opacity=".66"/>
    <rect x="608" y="94" width="86" height="108" rx="18" fill="#fff" opacity=".88"/>`,
  tower: (b) => `
    <path d="M132 284 C250 180 342 356 474 246 S670 126 820 238" fill="none" stroke="#fff" stroke-width="32" opacity=".22"/>
    ${[[236, 218], [424, 150], [626, 246]].map(([x, y]) => `<path d="M${x} ${y + 88}h92l-16-116h-60z" fill="${b}" filter="url(#glow-tower-defense)"/><circle cx="${x + 46}" cy="${y}" r="28" fill="#fff" opacity=".85"/>`).join("")}
    <circle cx="760" cy="220" r="32" fill="#ff4ad8"/>`,
  bot: (b) => `
    ${[[260, 120], [426, 98], [592, 120], [342, 246], [508, 246]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="112" height="94" rx="24" fill="${i === 1 ? "#fff" : b}" opacity=".92" filter="url(#glow-whack-a-bot)"/><circle cx="${x + 38}" cy="${y + 40}" r="8" fill="#07111f"/><circle cx="${x + 74}" cy="${y + 40}" r="8" fill="#07111f"/>`).join("")}`,
  words: (b) => `
    ${["A", "R", "C", "A", "D", "E"].map((letter, i) => `<rect x="${172 + i * 104}" y="${134 + (i % 2) * 42}" width="78" height="78" rx="15" fill="${i % 2 ? b : "#fff"}" filter="url(#glow-word-scramble)"/><text x="${211 + i * 104}" y="${187 + (i % 2) * 42}" text-anchor="middle" font-family="Arial" font-size="48" font-weight="900" fill="#07111f">${letter}</text>`).join("")}`,
  checkers: (b) => `
    ${Array.from({ length: 32 }, (_, i) => {
      const x = 260 + (i % 8) * 56;
      const y = 76 + Math.floor(i / 8) * 56;
      return `<rect x="${x}" y="${y}" width="56" height="56" fill="${(i + Math.floor(i / 8)) % 2 ? "#fff" : "#07111f"}" opacity=".28"/>`;
    }).join("")}
    ${[[344, 134, b], [456, 246, "#fff"], [568, 134, b], [624, 246, "#fff"]].map(([x, y, color]) => `<circle cx="${x}" cy="${y}" r="34" fill="${color}" filter="url(#glow-checkers)"/>`).join("")}`
};

function svg([id, title, a, b, kind]) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="420" viewBox="0 0 960 420" role="img" aria-label="${esc(title)} game banner">
  ${background(id, a, b)}
  <g opacity=".22">
    <circle cx="110" cy="90" r="72" fill="#fff"/>
    <circle cx="850" cy="330" r="96" fill="${b}"/>
  </g>
  <g>${shapes[kind](b)}</g>
  <rect x="0" y="0" width="960" height="420" fill="url(#pulse-${id})" opacity=".45"/>
</svg>`;
}

await fs.mkdir(outDir, { recursive: true });
await Promise.all(banners.map((banner) => fs.writeFile(path.join(outDir, `${banner[0]}.svg`), svg(banner), "utf8")));
console.log(`Generated ${banners.length} banners in ${outDir}`);

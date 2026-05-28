import {
  ArrowLeft,
  Check,
  Gamepad2,
  Globe2,
  Home,
  Image,
  ListOrdered,
  Lock,
  LogOut,
  Medal,
  Play,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Swords,
  Trophy,
  UserPlus,
  UserRound,
  Users,
  X
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GAMES, GameArtwork, PlayableGame } from "./games.jsx";

const API_BASE = import.meta.env.VITE_API_BASE || "";
const TOKEN_KEY = "neon-arcade-token";
const LEVEL_KEY = "neon-arcade-levels";
const EMPTY_FRIENDS = { friends: [], incoming: [], outgoing: [] };
const AVATAR_COLORS = ["#2ff6d0", "#ff4ad8", "#ffcc4d", "#70ff7a", "#60a5fa", "#f97316", "#a78bfa", "#f0abfc"];
const AVATAR_PICTURES = [
  { id: "pilot", label: "Pilot" },
  { id: "racer", label: "Racer" },
  { id: "mage", label: "Mage" },
  { id: "robot", label: "Robot" },
  { id: "snake", label: "Snake" },
  { id: "rocket", label: "Rocket" }
];

function soundFor(kind, gameIndex = 0) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  if (!window.__neonArcadeAudio) {
    window.__neonArcadeAudio = new AudioContext();
  }
  const context = window.__neonArcadeAudio;
  if (context.state === "suspended") context.resume();
  const now = context.currentTime;
  const base = 190 + gameIndex * 23;

  if (kind === "congrats") {
    const notes = [base, base * 1.25, base * 1.5, base * 2.0];
    notes.forEach((freq, idx) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      gain.gain.setValueAtTime(0.0001, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.08, now + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.35);
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.4);
    });
    return;
  }

  if (kind === "gameover") {
    const notes = [base * 1.2, base * 1.1, base * 0.95, base * 0.7];
    notes.forEach((freq, idx) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.8, now + idx * 0.15 + 0.22);
      gain.gain.setValueAtTime(0.0001, now + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.06, now + idx * 0.15 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.15 + 0.25);
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 0.3);
    });
    return;
  }

  const ranges = {
    click: [base, base * 1.4, 0.08, "triangle"],
    open: [base * 1.2, base * 2.1, 0.14, "sine"],
    win: [base * 1.4, base * 2.8, 0.24, "triangle"],
    error: [base * 1.5, 90, 0.2, "sawtooth"]
  };
  const [from, to, length, type] = ranges[kind] || ranges.click;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(from, now);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, to), now + length);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + length);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + length + 0.03);
}

function apiHeaders(token) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function readJson(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

function readSavedRecords() {
  try {
    const saved = JSON.parse(localStorage.getItem("neon-arcade-records") || "{}");
    return GAMES.reduce((records, game) => ({
      ...records,
      [game.id]: {
        easy: Number(saved[game.id]?.easy) || 0,
        medium: Number(saved[game.id]?.medium) || 0,
        hard: Number(saved[game.id]?.hard) || 0
      }
    }), {});
  } catch {
    return GAMES.reduce((records, game) => ({
      ...records,
      [game.id]: { easy: 0, medium: 0, hard: 0 }
    }), {});
  }
}

function saveRecords(records) {
  localStorage.setItem("neon-arcade-records", JSON.stringify(records));
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authError, setAuthError] = useState("");
  const [selectedGame, setSelectedGame] = useState(GAMES[0]);
  const [view, setView] = useState("home");
  const [query, setQuery] = useState("");
  const [scores, setScores] = useState([]);
  const [globalScores, setGlobalScores] = useState([]);
  const [boardGameId, setBoardGameId] = useState("all");
  const [boardDifficulty, setBoardDifficulty] = useState("all");
  const [boardScores, setBoardScores] = useState([]);
  const [gameDiffFilter, setGameDiffFilter] = useState("all");
  const [challenges, setChallenges] = useState([]);
  const [friendsData, setFriendsData] = useState(EMPTY_FRIENDS);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [challengeError, setChallengeError] = useState("");
  const [friendError, setFriendError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSaved, setProfileSaved] = useState("");
  const [lastRun, setLastRun] = useState(null);
  const [personalRecords, setPersonalRecords] = useState(readSavedRecords);
  const [difficulty, setDifficulty] = useState("medium");
  const [levelUp, setLevelUp] = useState(null);
  const [gameOverRun, setGameOverRun] = useState(null);
  const [posting, setPosting] = useState(false);
  const [apiMode, setApiMode] = useState("checking");
  const userLoadedRef = useRef(false);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [ratings, setRatings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("neon-arcade-ratings") || "{}");
    } catch {
      return {};
    }
  });

  const rateGame = (gameId, rating) => {
    const nextRatings = { ...ratings, [gameId]: rating };
    setRatings(nextRatings);
    localStorage.setItem("neon-arcade-ratings", JSON.stringify(nextRatings));
    soundFor("win");
  };

  const [onlinePlayers, setOnlinePlayers] = useState(2450);
  const [activities, setActivities] = useState([
    { id: 1, player: "PILOT", game: "Space Shooter", level: 3, action: "chased score on Medium in" },
    { id: 2, player: "RACER", game: "Racing Runner", level: 5, action: "beat high score on Hard in" },
    { id: 3, player: "SNAKE", game: "Snake", level: 4, action: "grew to 20 blocks in" }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlinePlayers((prev) => {
        const delta = Math.floor(Math.random() * 11) - 5;
        return Math.max(100, prev + delta);
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const mockFeed = [
      { player: "PILOT", game: "Space Shooter", action: "scored personal best on Medium in" },
      { player: "RACER", game: "Racing Runner", action: "chased distance on Hard in" },
      { player: "SNAKE", game: "Snake", action: "reached high score on Easy in" },
      { player: "MAGE", game: "Memory Match", action: "cleared matrix on Hard in" },
      { player: "ROBOT", game: "Tetris", action: "cleared 4 rows on Medium in" },
      { player: "ROCKET", game: "Flappy Drone", action: "flapped through gates on Hard in" },
      { player: "CHIP", game: "Breakout", action: "shattered bricks on Medium in" },
      { player: "PADDLE", game: "Pong", action: "returned 15 balls on Easy in" }
    ];
    const interval = setInterval(() => {
      const randomMock = mockFeed[Math.floor(Math.random() * mockFeed.length)];
      const newActivity = {
        id: Date.now(),
        player: randomMock.player,
        game: randomMock.game,
        level: Math.floor(Math.random() * 5) + 3,
        action: randomMock.action
      };
      setActivities((prev) => [newActivity, prev[0], prev[1]]);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const filteredGames = useMemo(() => {
    const needle = query.trim().toLowerCase();
    let list = GAMES;
    if (selectedCategory !== "All") {
      list = list.filter((game) => game.genre.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (!needle) return list;
    return list.filter((game) => `${game.name} ${game.genre} ${game.summary}`.toLowerCase().includes(needle));
  }, [query, selectedCategory]);

  const totalXp = useMemo(() => {
    return Object.values(personalRecords).reduce((sum, rec) => {
      return sum + (rec.easy || 0) + Math.round((rec.medium || 0) * 1.5) + (rec.hard || 0) * 2;
    }, 0);
  }, [personalRecords]);

  const userLevel = useMemo(() => {
    return Math.floor(totalXp / 1000) + 1;
  }, [totalXp]);

  const xpProgress = useMemo(() => {
    const currentLvlXp = totalXp % 1000;
    return (currentLvlXp / 1000) * 100;
  }, [totalXp]);

  const loadScores = useCallback(async (gameId = selectedGame.id, diff = gameDiffFilter) => {
    try {
      const suffix = diff !== "all" ? `&difficulty=${diff}` : "";
      const [gameScores, worldScores] = await Promise.all([
        fetch(`${API_BASE}/api/scores?gameId=${gameId}&limit=10${suffix}`).then(readJson),
        fetch(`${API_BASE}/api/scores?limit=8`).then(readJson)
      ]);
      setScores(gameScores);
      setGlobalScores(worldScores);
    } catch {
      setScores([]);
      setGlobalScores([]);
    }
  }, [selectedGame.id, gameDiffFilter]);

  const loadLeaderboard = useCallback(async (gameId = boardGameId, diff = boardDifficulty) => {
    try {
      let queryParts = [];
      if (gameId !== "all") queryParts.push(`gameId=${gameId}`);
      if (diff !== "all") queryParts.push(`difficulty=${diff}`);
      queryParts.push("limit=30");
      const suffix = queryParts.join("&");
      const data = await fetch(`${API_BASE}/api/scores?${suffix}`).then(readJson);
      setBoardScores(data);
    } catch {
      setBoardScores([]);
    }
  }, [boardGameId, boardDifficulty]);

  const loadChallenges = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetch(`${API_BASE}/api/challenges`, { headers: apiHeaders(token) }).then(readJson);
      setChallenges(data);
    } catch {
      setChallenges([]);
    }
  }, [token]);

  const loadFriends = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetch(`${API_BASE}/api/friends`, { headers: apiHeaders(token) }).then(readJson);
      setFriendsData({
        friends: data.friends || [],
        incoming: data.incoming || [],
        outgoing: data.outgoing || []
      });
      setFriendError("");
    } catch (error) {
      setFriendsData(EMPTY_FRIENDS);
      setFriendError(error.message);
    }
  }, [token]);

  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then(readJson)
      .then((data) => setApiMode(data.mode || "memory"))
      .catch(() => setApiMode("offline"));
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/auth/me`, { headers: apiHeaders(token) })
      .then(readJson)
      .then((data) => {
        setUser(data.user);
        userLoadedRef.current = true;

        fetch(`${API_BASE}/api/scores/personal`, { headers: apiHeaders(token) })
          .then(readJson)
          .then((records) => {
            if (records && typeof records === "object") {
              setPersonalRecords((current) => {
                const nextRecords = { ...current };
                Object.keys(records).forEach((gameId) => {
                  nextRecords[gameId] = {
                    easy: Math.max(nextRecords[gameId]?.easy || 0, records[gameId].easy || 0),
                    medium: Math.max(nextRecords[gameId]?.medium || 0, records[gameId].medium || 0),
                    hard: Math.max(nextRecords[gameId]?.hard || 0, records[gameId].hard || 0)
                  };
                });
                saveRecords(nextRecords);
                return nextRecords;
              });
            }
          })
          .catch(() => {});
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken("");
        setUser(null);
      });
  }, [token]);

  useEffect(() => {
    loadScores(selectedGame.id, gameDiffFilter);
  }, [loadScores, selectedGame.id, gameDiffFilter]);

  useEffect(() => {
    loadLeaderboard(boardGameId);
  }, [boardGameId, loadLeaderboard]);

  useEffect(() => {
    if (user) {
      loadChallenges();
      loadFriends();
    }
  }, [loadChallenges, loadFriends, user]);

  const handleAuth = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const username = String(form.get("username") || "");
    const password = String(form.get("password") || "");
    setAuthError("");

    try {
      const data = await fetch(`${API_BASE}/api/auth/${authMode}`, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({ username, password })
      }).then(readJson);
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      soundFor("open");
    } catch (error) {
      setAuthError(error.message);
      soundFor("error");
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setUser(null);
    setView("home");
    setFriendsData(EMPTY_FRIENDS);
  };

  const openGame = (game) => {
    setSelectedGame(game);
    setLastRun(null);
    setLevelUp(null);
    setGameOverRun(null);
    setView("play");
    loadScores(game.id);
    soundFor("open", GAMES.findIndex((item) => item.id === game.id));
  };

  const goView = (nextView) => {
    setView(nextView);
    soundFor("click");
    if (nextView === "leaderboard") loadLeaderboard(boardGameId);
    if (nextView === "friends") {
      loadChallenges();
      loadFriends();
    }
  };

  const createChallenge = async ({ username, gameId }) => {
    const game = GAMES.find((item) => item.id === gameId) || selectedGame;
    setChallengeError("");
    try {
      const challenge = await fetch(`${API_BASE}/api/challenges`, {
        method: "POST",
        headers: apiHeaders(token),
        body: JSON.stringify({
          toUsername: username,
          gameId: game.id,
          gameName: game.name
        })
      }).then(readJson);
      setActiveChallenge(challenge);
      setSelectedGame(game);
      setChallenges((current) => [challenge, ...current.filter((item) => item.id !== challenge.id)]);
      setView("play");
      soundFor("win", GAMES.findIndex((item) => item.id === game.id));
    } catch (error) {
      setChallengeError(error.message);
      soundFor("error");
    }
  };

  const sendFriendRequest = async (username) => {
    setFriendError("");
    try {
      await fetch(`${API_BASE}/api/friends/requests`, {
        method: "POST",
        headers: apiHeaders(token),
        body: JSON.stringify({ username })
      }).then(readJson);
      await loadFriends();
      soundFor("win");
    } catch (error) {
      setFriendError(error.message);
      soundFor("error");
    }
  };

  const refreshUser = async () => {
    const data = await fetch(`${API_BASE}/api/auth/me`, { headers: apiHeaders(token) }).then(readJson);
    setUser(data.user);
  };

  const acceptFriendRequest = async (id) => {
    setFriendError("");
    try {
      await fetch(`${API_BASE}/api/friends/requests/${id}/accept`, {
        method: "POST",
        headers: apiHeaders(token)
      }).then(readJson);
      await Promise.all([loadFriends(), refreshUser()]);
      soundFor("win");
    } catch (error) {
      setFriendError(error.message);
      soundFor("error");
    }
  };

  const rejectFriendRequest = async (id) => {
    setFriendError("");
    try {
      await fetch(`${API_BASE}/api/friends/requests/${id}/reject`, {
        method: "POST",
        headers: apiHeaders(token)
      }).then(readJson);
      await loadFriends();
      soundFor("click");
    } catch (error) {
      setFriendError(error.message);
      soundFor("error");
    }
  };

  const saveProfile = async ({ bio, avatar, username }) => {
    setProfileError("");
    setProfileSaved("");
    try {
      const data = await fetch(`${API_BASE}/api/profile`, {
        method: "PATCH",
        headers: apiHeaders(token),
        body: JSON.stringify({ bio, avatar, username })
      }).then(readJson);
      setUser(data.user);
      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
      }
      setProfileSaved("Saved");
      soundFor("win");
    } catch (error) {
      setProfileError(error.message);
      soundFor("error");
    }
  };

  const handleFinish = async (result) => {
    const scoreVal = Math.max(0, Math.round(result.score || 0));
    const run = {
      score: scoreVal,
      level: 1,
      difficulty: difficulty,
      duration: Math.max(1, Math.round(result.duration || 1)),
      detail: result.detail || "Arcade run"
    };
    setLastRun({ ...run, status: "posting" });
    setPosting(true);

    try {
      await fetch(`${API_BASE}/api/scores`, {
        method: "POST",
        headers: apiHeaders(token),
        body: JSON.stringify({
          ...run,
          gameId: selectedGame.id,
          gameName: selectedGame.name
        })
      }).then(readJson);
      if (activeChallenge?.gameId === selectedGame.id) {
        const updatedChallenge = await fetch(`${API_BASE}/api/challenges/${activeChallenge.id}/score`, {
          method: "POST",
          headers: apiHeaders(token),
          body: JSON.stringify({ score: run.score })
        }).then(readJson);
        setActiveChallenge(updatedChallenge);
        setChallenges((current) => [updatedChallenge, ...current.filter((item) => item.id !== updatedChallenge.id)]);
      }
      
      const currentRecords = personalRecords[selectedGame.id] || { easy: 0, medium: 0, hard: 0 };
      const currentBest = currentRecords[difficulty] || 0;
      const isNewBest = scoreVal > currentBest;

      if (isNewBest) {
        const nextRecords = {
          ...personalRecords,
          [selectedGame.id]: {
            ...currentRecords,
            [difficulty]: scoreVal
          }
        };
        setPersonalRecords(nextRecords);
        saveRecords(nextRecords);
        setLevelUp({
          id: `${selectedGame.id}-${Date.now()}`,
          gameId: selectedGame.id,
          gameName: selectedGame.name,
          difficulty,
          score: scoreVal
        });
        soundFor("congrats", GAMES.findIndex((item) => item.id === selectedGame.id));
      } else {
        soundFor("gameover", GAMES.findIndex((item) => item.id === selectedGame.id));
      }

      setLastRun({ ...run, status: "posted", isNewBest, detail: isNewBest ? `🏆 NEW HIGH SCORE: ${scoreVal}! ✨ Great run!` : `🎮 Run complete! Score: ${scoreVal}` });
      setGameOverRun({
        id: `${selectedGame.id}-${Date.now()}`,
        gameId: selectedGame.id,
        gameName: selectedGame.name,
        difficulty,
        score: scoreVal,
        isNewBest
      });
      await loadScores(selectedGame.id);
      await loadLeaderboard(boardGameId);
    } catch (error) {
      setLastRun({ ...run, status: "failed", error: error.message });
      soundFor("error");
    } finally {
      setPosting(false);
    }
  };

  if (!user) {
    return <AuthScreen mode={authMode} setMode={setAuthMode} error={authError} onSubmit={handleAuth} apiMode={apiMode} />;
  }

  return (
    <main className="site-shell">
      <header className="site-header">
        <div className="brand-lockup">
          <div className="brand-mark">
            <Gamepad2 size={24} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span>Neon World Arcade</span>
              <div className="active-players-pill" title="Players currently playing online">
                <span className="active-pulse-dot" />
                <span>{onlinePlayers.toLocaleString()} Live</span>
              </div>
            </div>
            <h1>Pick. Play. Climb.</h1>
          </div>
        </div>
        <nav className="top-nav" aria-label="Arcade navigation">
          <button type="button" className={view === "home" ? "active" : ""} onClick={() => goView("home")}>
            <Home size={16} />
            Games
          </button>
          <button type="button" className={view === "leaderboard" ? "active" : ""} onClick={() => goView("leaderboard")}>
            <ListOrdered size={16} />
            Leaderboard
          </button>
          <button type="button" className={view === "friends" ? "active" : ""} onClick={() => goView("friends")}>
            <Swords size={16} />
            Friends
          </button>
          <button type="button" className={view === "profile" ? "active" : ""} onClick={() => goView("profile")}>
            <Settings size={16} />
            Profile
          </button>
        </nav>
        <div className="user-xp-panel">
          <div className="user-xp-header">
            <span>Rank Progress</span>
            <strong>LVL {userLevel}</strong>
          </div>
          <div className="xp-bar-container" title={`${totalXp % 500} / 500 XP to next rank`}>
            <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }} />
          </div>
        </div>
        <div className="user-pill">
          <Avatar user={user} />
          <ShieldCheck size={16} />
          <span>{user.username}</span>
          <button type="button" onClick={logout} title="Log out">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {view === "home" ? (
        <HomeView
          games={filteredGames}
          query={query}
          setQuery={setQuery}
          onOpenGame={openGame}
          globalScores={globalScores}
          apiMode={apiMode}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          activities={activities}
        />
      ) : view === "leaderboard" ? (
        <LeaderboardPage boardGameId={boardGameId} setBoardGameId={setBoardGameId} scores={boardScores} />
      ) : view === "friends" ? (
        <FriendsPage
          friendsData={friendsData}
          challenges={challenges}
          onCreateChallenge={createChallenge}
          onFriendRequest={sendFriendRequest}
          onAcceptRequest={acceptFriendRequest}
          onRejectRequest={rejectFriendRequest}
          challengeError={challengeError}
          friendError={friendError}
        />
      ) : view === "profile" ? (
        <ProfilePage user={user} onSaveProfile={saveProfile} error={profileError} saved={profileSaved} />
      ) : (
        <GameView
          game={selectedGame}
          onBack={() => setView("home")}
          onFinish={handleFinish}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          personalRecords={personalRecords[selectedGame.id] || { easy: 0, medium: 0, hard: 0 }}
          levelUp={levelUp?.gameId === selectedGame.id ? levelUp : null}
          scores={scores}
          lastRun={lastRun}
          posting={posting}
          activeChallenge={activeChallenge}
          challenges={challenges}
          onCreateChallenge={createChallenge}
          challengeError={challengeError}
          ratings={ratings}
          rateGame={rateGame}
          onOpenGame={openGame}
          gameDiffFilter={gameDiffFilter}
          setGameDiffFilter={setGameDiffFilter}
        />
      )}
      {gameOverRun && (
        <GameOverModal gameOverRun={gameOverRun} onClose={() => setGameOverRun(null)} />
      )}
    </main>
  );
}

function AuthScreen({ mode, setMode, error, onSubmit, apiMode }) {
  const isSignup = mode === "signup";
  return (
    <main className="auth-screen">
      <section className="auth-hero">
        <div className="auth-art">
          <span />
          <span />
          <span />
        </div>
        <p className="eyebrow">Global mini-games portal</p>
        <h1>Neon World Arcade</h1>
        <p className="auth-copy">One login unlocks 15 fast games, personal runs, and global leaderboards.</p>
        <div className={`status-chip ${apiMode}`}>
          <Globe2 size={16} />
          <span>{apiMode === "mongo" ? "Mongo online" : apiMode === "offline" ? "API offline" : "Memory online"}</span>
        </div>
      </section>

      <section className="auth-card">
        <div className="auth-title">
          {isSignup ? <UserPlus size={22} /> : <Lock size={22} />}
          <div>
            <span>{isSignup ? "Create account" : "Login required"}</span>
            <strong>{isSignup ? "Join the arcade" : "Enter your arcade pass"}</strong>
          </div>
        </div>
        <form onSubmit={onSubmit}>
          <label htmlFor="username">Callsign (email or custom name)</label>
          <input id="username" name="username" minLength="3" maxLength="64" autoComplete="username" required placeholder="PLAYER01@GMAIL.COM" />
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" minLength="6" autoComplete={isSignup ? "new-password" : "current-password"} required placeholder="6 characters minimum" />
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="primary-button">
            {isSignup ? "Create and Enter" : "Login"}
          </button>
        </form>
        <button type="button" className="text-button" onClick={() => setMode(isSignup ? "login" : "signup")}>
          {isSignup ? "I already have an account" : "Create a new account"}
        </button>
      </section>
    </main>
  );
}

function Avatar({ user, label }) {
  const avatar = user?.avatar || { initials: label?.slice(0, 2).toUpperCase() || "P", color: "#2ff6d0", picture: "pilot" };
  const picture = avatar.picture || "pilot";
  return (
    <span className={`avatar avatar-${picture}`} style={{ "--avatar": avatar.color }}>
      <span>{avatar.initials}</span>
    </span>
  );
}

function HomeView({ games, query, setQuery, onOpenGame, globalScores, apiMode, selectedCategory, setSelectedCategory, activities }) {
  const categories = useMemo(() => {
    const genres = GAMES.map((g) => g.genre);
    return ["All", ...Array.from(new Set(genres)).sort()];
  }, []);

  function getGameBadge(gameId) {
    if (["snake", "tetris", "twenty48"].includes(gameId)) return "popular";
    if (["pong", "breakout", "space-shooter", "racing-runner"].includes(gameId)) return "hot";
    if (["flappy-drone", "checkers", "tower-defense"].includes(gameId)) return "new";
    return null;
  }

  function getGameCardClass(gameId) {
    if (gameId === "snake") return "game-card featured-large";
    if (gameId === "space-shooter" || gameId === "tetris") return "game-card featured-wide";
    return "game-card";
  }

  return (
    <>
      <section className="hero-band">
        <div>
          <p className="eyebrow">15 games live</p>
          <h2>Choose a game and start in one click.</h2>
        </div>
        <div className="search-box">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search games" />
        </div>
      </section>

      <nav className="category-nav" aria-label="Game categories selector">
        {categories.map((cat) => {
          const count = cat === "All"
            ? GAMES.length
            : GAMES.filter((g) => g.genre.toLowerCase() === cat.toLowerCase()).length;
          return (
            <button
              key={cat}
              type="button"
              className={`category-pill ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              <span>{cat}</span>
              <span style={{ fontSize: "0.65rem", opacity: 0.6 }}>({count})</span>
            </button>
          );
        })}
      </nav>

      <section className="home-grid">
        <div className="game-gallery">
          {games.map((game) => {
            const cardClass = getGameCardClass(game.id);
            const badge = getGameBadge(game.id);
            return (
              <article key={game.id} className={cardClass} onClick={() => onOpenGame(game)} style={{ cursor: "pointer" }}>
                {badge && (
                  <span className={`game-card-badge ${badge}`}>
                    {badge}
                  </span>
                )}
                <GameArtwork game={game} />
                <div className="game-card-body">
                  <div>
                    <span>{game.genre}</span>
                    <h3>{game.name}</h3>
                  </div>
                  <p>{game.summary}</p>
                  <button type="button" className="play-card-button" onClick={() => onOpenGame(game)}>
                    <Play size={17} />
                    Play
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="world-panel">
          <div className="panel-heading">
            <Trophy size={20} />
            <div>
              <span>Worldwide race</span>
              <strong>{apiMode === "mongo" ? "Live global board" : "Dev global board"}</strong>
            </div>
          </div>
          <LeaderboardList scores={globalScores} empty="No global runs yet" />

          <div className="arcade-live-log">
            <h3>
              <Sparkles size={14} style={{ color: "var(--cyan)" }} />
              Live Arcade Feed
            </h3>
            <div className="live-feed-ticker">
              {activities.map((act) => (
                <div key={act.id} className="live-feed-item">
                  <b>{act.player}</b> {act.action} <span>{act.game}</span> (Lvl {act.level})
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}

function LeaderboardPage({ boardGameId, setBoardGameId, boardDifficulty, setBoardDifficulty, scores }) {
  return (
    <section className="leaderboard-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Global leaderboard</p>
          <h2>Race players around the world.</h2>
        </div>
        <div className="filter-controls" style={{ display: "flex", gap: "12px" }}>
          <select value={boardGameId} onChange={(event) => setBoardGameId(event.target.value)}>
            <option value="all">All games</option>
            {GAMES.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
          <select value={boardDifficulty} onChange={(event) => setBoardDifficulty(event.target.value)}>
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>
      <div className="leaderboard-wide">
        <LeaderboardList scores={scores} empty="No scores yet. Play any game to appear here." showAvatar />
      </div>
    </section>
  );
}

function FriendsPage({ friendsData, challenges, onCreateChallenge, onFriendRequest, onAcceptRequest, onRejectRequest, challengeError, friendError }) {
  return (
    <section className="friends-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Friends and races</p>
          <h2>Add friends, accept requests, race together.</h2>
        </div>
      </div>
      <div className="friends-grid friend-hub">
        <FriendInviteForm onFriendRequest={onFriendRequest} error={friendError} />
        <FriendBoard friendsData={friendsData} onAcceptRequest={onAcceptRequest} onRejectRequest={onRejectRequest} />
      </div>
      <div className="friends-grid race-hub">
        <ChallengeForm onCreateChallenge={onCreateChallenge} error={challengeError} />
        <ChallengeList challenges={challenges} />
      </div>
    </section>
  );
}

function FriendInviteForm({ onFriendRequest, error }) {
  const [username, setUsername] = useState("");

  const submit = (event) => {
    event.preventDefault();
    const nextUsername = username.trim().toUpperCase();
    if (!nextUsername) return;
    onFriendRequest(nextUsername);
    setUsername("");
  };

  return (
    <form className="friend-card-panel" onSubmit={submit}>
      <div className="panel-heading">
        <UserPlus size={20} />
        <div>
          <span>Add friend</span>
          <strong>Send by username</strong>
        </div>
      </div>
      <label htmlFor="friend-request-name">Username / Email</label>
      <input id="friend-request-name" value={username} onChange={(event) => setUsername(event.target.value.toUpperCase())} placeholder="PLAYER02@GMAIL.COM" minLength="3" maxLength="64" required />
      {error ? <p className="form-error">{error}</p> : null}
      <button type="submit" className="primary-button">
        <UserPlus size={17} />
        Send request
      </button>
    </form>
  );
}

function FriendBoard({ friendsData, onAcceptRequest, onRejectRequest }) {
  return (
    <section className="friend-card-panel friend-board">
      <div className="panel-heading">
        <Users size={20} />
        <div>
          <span>Friend list</span>
          <strong>{friendsData.friends.length ? `${friendsData.friends.length} friends` : "No friends yet"}</strong>
        </div>
      </div>

      {friendsData.incoming.length ? (
        <div className="request-stack">
          <h3>Requests</h3>
          {friendsData.incoming.map((request) => (
            <article key={request.id} className="request-card">
              <div>
                <Avatar label={request.fromUsername} />
                <strong>{request.fromUsername}</strong>
              </div>
              <div className="request-actions">
                <button type="button" onClick={() => onAcceptRequest(request.id)} title="Accept request">
                  <Check size={17} />
                </button>
                <button type="button" onClick={() => onRejectRequest(request.id)} title="Reject request">
                  <X size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {friendsData.friends.length ? (
        <div className="friend-list">
          {friendsData.friends.map((friend) => (
            <article key={friend.username} className="friend-card">
              <Avatar user={friend} />
              <div>
                <strong>{friend.username}</strong>
                <p>{friend.bio || "Ready to race"}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="empty-board">Send a request or accept one to build your crew.</p>
      )}

      {friendsData.outgoing.length ? (
        <div className="pending-row">
          <span>Waiting</span>
          {friendsData.outgoing.map((request) => (
            <b key={request.id}>{request.toUsername}</b>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ProfilePage({ user, onSaveProfile, error, saved }) {
  const [bio, setBio] = useState(user.bio || "");
  const [avatar, setAvatar] = useState(user.avatar || {});
  const [username, setUsername] = useState(user.username || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setBio(user.bio || "");
    setAvatar(user.avatar || {});
    setUsername(user.username || "");
  }, [user]);

  const updateAvatar = (patch) => {
    setAvatar((current) => ({ ...current, ...patch }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    await onSaveProfile({ bio, avatar, username });
    setSaving(false);
  };

  return (
    <section className="profile-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Player settings</p>
          <h2>Make your arcade profile yours.</h2>
        </div>
      </div>
      <form className="profile-panel" onSubmit={submit}>
        <div className="profile-preview">
          <Avatar user={{ username: user.username, avatar }} />
          <div>
            <span>{user.username}</span>
            <strong>{bio || "New arcade player"}</strong>
          </div>
        </div>

        <label htmlFor="profile-username">Username / Callsign</label>
        <input id="profile-username" value={username} onChange={(event) => setUsername(event.target.value.toUpperCase())} maxLength="64" minLength="3" placeholder="CALLSIGN" required />

        <label htmlFor="profile-bio">Bio</label>
        <input id="profile-bio" value={bio} onChange={(event) => setBio(event.target.value)} maxLength="120" placeholder="Fast runs, clean wins." />

        <label htmlFor="profile-initials">Initials (Letters or Emojis)</label>
        <input id="profile-initials" value={avatar.initials || ""} onChange={(event) => {
          const val = event.target.value;
          const sliced = Array.from(val).slice(0, 2).join("");
          updateAvatar({ initials: sliced.toUpperCase() });
        }} maxLength="8" placeholder="PX or 😊" />

        <div className="setting-group">
          <div className="setting-title">
            <Image size={18} />
            <span>Profile picture</span>
          </div>
          <div className="picture-grid">
            {AVATAR_PICTURES.map((picture) => (
              <button key={picture.id} type="button" className={avatar.picture === picture.id ? "active" : ""} onClick={() => updateAvatar({ picture: picture.id })}>
                <Avatar user={{ username: user.username, avatar: { ...avatar, picture: picture.id } }} />
                <span>{picture.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="setting-group">
          <div className="setting-title">
            <UserRound size={18} />
            <span>Color</span>
          </div>
          <div className="color-grid">
            {AVATAR_COLORS.map((color) => (
              <button key={color} type="button" className={avatar.color === color ? "active" : ""} style={{ "--avatar": color }} onClick={() => updateAvatar({ color })} aria-label={`Use ${color}`} />
            ))}
          </div>
        </div>

        {error ? <p className="form-error">{error}</p> : null}
        {saved ? <p className="form-success">{saved}</p> : null}
        <button type="submit" className="primary-button" disabled={saving}>
          {saving ? "Saving" : "Save profile"}
        </button>
      </form>
    </section>
  );
}

function GameView({
  game,
  onBack,
  onFinish,
  difficulty,
  setDifficulty,
  personalRecords,
  levelUp,
  scores,
  lastRun,
  posting,
  activeChallenge,
  challenges,
  onCreateChallenge,
  challengeError,
  ratings,
  rateGame,
  onOpenGame,
  gameDiffFilter,
  setGameDiffFilter
}) {
  const playShellRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFs = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFs);
    return () => document.removeEventListener("fullscreenchange", handleFs);
  }, []);

  const toggleFullscreen = () => {
    if (!playShellRef.current) return;
    if (!document.fullscreenElement) {
      playShellRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const recommendedGames = useMemo(() => {
    const sameGenre = GAMES.filter((g) => g.genre === game.genre && g.id !== game.id);
    const others = GAMES.filter((g) => g.genre !== game.genre && g.id !== game.id);
    return [...sameGenre, ...others].slice(0, 5);
  }, [game]);

  const currentRating = ratings[game.id] || 4;

  return (
    <section className="game-layout">
      <div className="game-stage">
        <button type="button" className="back-button" onClick={onBack}>
          <ArrowLeft size={17} />
          All games
        </button>
        <div className="stage-title">
          <GameArtwork game={game} />
          <div>
            <span>{game.genre}</span>
            <h2>{game.name}</h2>
            <p>{game.summary}</p>
            <div className="stage-difficulty-row">
              <span>Select difficulty</span>
              <div className="difficulty-segmented">
                {["easy", "medium", "hard"].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    className={`difficulty-btn btn-${diff} ${difficulty === diff ? "active" : ""}`}
                    onClick={() => {
                      setDifficulty(diff);
                      soundFor("click");
                    }}
                  >
                    {diff.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {levelUp ? <LevelUpBanner levelUp={levelUp} /> : null}

        <div className="playroom-stage-container">
          <div ref={playShellRef} className="play-shell crt-frame">
            <div className="crt-glow-overlay" />
            <PlayableGame key={`${game.id}-${difficulty}`} game={game} onFinish={onFinish} difficulty={difficulty} />
            <div className="playroom-feedback-bar">
              <div className="rating-widget">
                <span>Rate Game:</span>
                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      onClick={() => rateGame(game.id, star)}
                      className={star <= currentRating ? "active" : ""}
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill={star <= currentRating ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
              </div>
              <button type="button" className="fullscreen-action-btn" onClick={toggleFullscreen}>
                {isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
              </button>
            </div>
          </div>

          <aside className="recommended-sidebar">
            <h3>Recommended Games</h3>
            <div className="recommended-list">
              {recommendedGames.map((rec) => (
                <div key={rec.id} className="recommended-card" onClick={() => onOpenGame(rec)}>
                  <div className="recommended-card-banner">
                    <img src={rec.banner} alt={rec.name} loading="lazy" />
                  </div>
                  <div className="recommended-card-info">
                    <h4>{rec.name}</h4>
                    <span>{rec.genre}</span>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>

      <aside className="game-side">
        <div className="personal-records-panel">
          <div className="panel-heading">
            <Trophy size={20} />
            <div>
              <span>Personal records</span>
              <strong>Your high scores</strong>
            </div>
          </div>
          <div className="personal-records-grid">
            <div className="record-item easy">
              <span className="bullet">🟢</span>
              <span className="label">EASY</span>
              <strong className="value">{personalRecords.easy}</strong>
            </div>
            <div className="record-item medium">
              <span className="bullet">🟡</span>
              <span className="label">MEDIUM</span>
              <strong className="value">{personalRecords.medium}</strong>
            </div>
            <div className="record-item hard">
              <span className="bullet">🔴</span>
              <span className="label">HARD</span>
              <strong className="value">{personalRecords.hard}</strong>
            </div>
          </div>
        </div>

        <div className="challenge-panel">
          <div className="panel-heading">
            <Swords size={20} />
            <div>
              <span>Multiplayer race</span>
              <strong>{activeChallenge?.gameId === game.id ? "Challenge active" : "Invite a friend"}</strong>
            </div>
          </div>
          {activeChallenge?.gameId === game.id ? <ChallengeCard challenge={activeChallenge} /> : <ChallengeForm onCreateChallenge={onCreateChallenge} gameId={game.id} error={challengeError} compact />}
          <ChallengeList challenges={challenges.filter((challenge) => challenge.gameId === game.id).slice(0, 3)} compact />
        </div>

        <div className="result-panel">
          <div className="panel-heading">
            <Sparkles size={20} />
            <div>
              <span>Run status</span>
              <strong>{posting ? "Posting score" : lastRun?.status === "posted" ? "Score online" : "Ready"}</strong>
            </div>
          </div>
          {lastRun ? (
            <div className="run-result">
              <strong>{lastRun.score}</strong>
              <span>Difficulty: {String(lastRun.difficulty).toUpperCase()} finished</span>
              <p>{lastRun.status === "failed" ? lastRun.error : lastRun.detail}</p>
            </div>
          ) : (
            <p className="side-copy">Finish a run and your score is sent to this game leaderboard automatically.</p>
          )}
        </div>

        <div className="leader-panel">
          <div className="panel-heading" style={{ marginBottom: "8px" }}>
            <Medal size={20} />
            <div>
              <span>Leaderboard</span>
              <strong>{game.name}</strong>
            </div>
          </div>
          <div className="sidebar-filter-row" style={{ marginBottom: "12px" }}>
            <select
              value={gameDiffFilter}
              onChange={(e) => {
                setGameDiffFilter(e.target.value);
                soundFor("click");
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid var(--line)",
                background: "rgba(8, 15, 27, 0.75)",
                color: "#ffffff",
                fontSize: "0.85rem",
                fontWeight: "700",
                cursor: "pointer",
                outline: "none"
              }}
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <LeaderboardList scores={scores} empty="Be the first to post" />
        </div>
      </aside>
    </section>
  );
}

function LevelUpBanner({ levelUp }) {
  return (
    <div className="level-up-banner" role="status" aria-live="polite">
      <div className="level-up-card">
        <span className="level-up-icon">🏆</span>
        <div>
          <p>NEW PERSONAL RECORD!</p>
          <strong>✨ {String(levelUp.difficulty).toUpperCase()} Best: {levelUp.score} ✨</strong>
          <small>{levelUp.gameName} run complete!</small>
        </div>
      </div>
      <span className="spark spark-a">✨</span>
      <span className="spark spark-b">✨</span>
      <span className="spark spark-c">✨</span>
    </div>
  );
}

function GameOverModal({ gameOverRun, onClose }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!gameOverRun || !gameOverRun.isNewBest) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    const colors = ["#2ff6d0", "#ff4ad8", "#ffcc4d", "#70ff7a", "#60a5fa", "#ff4a67", "#ffffff"];

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const spawnPopper = (x, angle) => {
      for (let i = 0; i < 60; i++) {
        const theta = angle + (Math.random() - 0.5) * 0.45;
        const velocity = Math.random() * 12 + 10;
        particles.push({
          x,
          y: height,
          vx: Math.cos(theta) * velocity,
          vy: Math.sin(theta) * velocity,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 6 + 4,
          opacity: 1,
          decay: Math.random() * 0.015 + 0.008,
          gravity: 0.28,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2
        });
      }
    };

    spawnPopper(0, -Math.PI / 4);
    spawnPopper(width, -3 * Math.PI / 4);

    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.opacity -= p.decay;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      const alive = particles.filter((p) => p.opacity > 0 && p.y <= height);
      particles.length = 0;
      particles.push(...alive);

      if (alive.length > 0) {
        animationFrameId = requestAnimationFrame(loop);
      }
    };

    loop();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameOverRun]);

  const isBest = gameOverRun?.isNewBest;

  return (
    <div className={`level-modal-overlay ${isBest ? "new-best-theme" : "game-over-theme"}`}>
      {isBest && <canvas ref={canvasRef} className="confetti-canvas" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 100000 }} />}
      <div className={`level-modal-content crt-frame ${isBest ? "gold-border" : "red-border"}`} style={{ zIndex: 100001, position: "relative" }}>
        <div className="crt-glow-overlay" />
        <div className="level-modal-star">{isBest ? "🏆" : "👾"}</div>
        <h2>{isBest ? "CONGRATS! NEW HIGH SCORE!" : "GAME OVER"}</h2>
        <p>{isBest ? "✨ Incredible run! You set a new personal record! ✨" : "🎮 Run complete! Keep practicing to climb the ranks! 🎮"}</p>
        <div className="level-modal-stats">
          <div className="level-modal-stat-card">
            <span>Game</span>
            <strong>{gameOverRun?.gameName}</strong>
          </div>
          <div className="level-modal-stat-card yellow">
            <span>Difficulty</span>
            <strong>{String(gameOverRun?.difficulty || "medium").toUpperCase()}</strong>
          </div>
          <div className="level-modal-stat-card green">
            <span>{isBest ? "New Record" : "Final Score"}</span>
            <strong>{gameOverRun?.score}</strong>
          </div>
        </div>
        <button type="button" className={`primary-button level-modal-action ${isBest ? "gold-glow" : "red-glow"}`} onClick={onClose}>
          {isBest ? "Awesome!" : "Try Again"}
        </button>
      </div>
    </div>
  );
}

function ChallengeForm({ onCreateChallenge, gameId = GAMES[0].id, error, compact = false }) {
  const [username, setUsername] = useState("");
  const [selectedGameId, setSelectedGameId] = useState(gameId);

  useEffect(() => {
    setSelectedGameId(gameId);
  }, [gameId]);

  const submit = (event) => {
    event.preventDefault();
    onCreateChallenge({ username, gameId: selectedGameId });
  };

  return (
    <form className={`challenge-form ${compact ? "compact" : ""}`} onSubmit={submit}>
      <label htmlFor={compact ? "friend-compact" : "friend"}>Friend username</label>
      <input id={compact ? "friend-compact" : "friend"} value={username} onChange={(event) => setUsername(event.target.value.toUpperCase())} placeholder="FRIEND01@GMAIL.COM" required minLength="3" maxLength="64" />
      {!compact ? (
        <>
          <label htmlFor="challenge-game">Game</label>
          <select id="challenge-game" value={selectedGameId} onChange={(event) => setSelectedGameId(event.target.value)}>
            {GAMES.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </>
      ) : null}
      {error ? <p className="form-error">{error}</p> : null}
      <button type="submit" className="primary-button">
        Invite
      </button>
    </form>
  );
}

function ChallengeList({ challenges, compact = false }) {
  if (!challenges.length) {
    return <p className="empty-board">{compact ? "No races for this game yet." : "No friend races yet. Invite someone to start."}</p>;
  }

  return (
    <div className={`challenge-list ${compact ? "compact" : ""}`}>
      {challenges.map((challenge) => (
        <ChallengeCard key={challenge.id} challenge={challenge} />
      ))}
    </div>
  );
}

function ChallengeCard({ challenge }) {
  const leader =
    challenge.fromScore === challenge.toScore
      ? "Tied"
      : challenge.fromScore > challenge.toScore
        ? challenge.fromUsername
        : challenge.toUsername;

  return (
    <article className="challenge-card">
      <div>
        <strong>{challenge.gameName}</strong>
        <span>{challenge.status === "complete" ? "Complete" : "Open race"}</span>
      </div>
      <div className="race-row">
        <span>{challenge.fromUsername}</span>
        <b>{challenge.fromScore || 0}</b>
      </div>
      <div className="race-row">
        <span>{challenge.toUsername}</span>
        <b>{challenge.toScore || 0}</b>
      </div>
      <p>{leader === "Tied" ? "Race is tied" : `${leader} is leading`}</p>
    </article>
  );
}

function LeaderboardList({ scores, empty, showAvatar = false }) {
  if (!scores.length) {
    return <p className="empty-board">{empty}</p>;
  }

  return (
    <ol className={`leader-list ${showAvatar ? "with-avatar" : ""}`}>
      {scores.map((score, index) => (
        <li key={score.id || `${score.player}-${index}`}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          {showAvatar ? <Avatar label={score.player} /> : null}
          <div>
            <strong>{score.player}</strong>
            <small>{score.gameName} / <span className={`diff-badge badge-${score.difficulty || "medium"}`}>{String(score.difficulty || "medium").toUpperCase()}</span></small>
          </div>
          <b>{score.score}</b>
        </li>
      ))}
    </ol>
  );
}

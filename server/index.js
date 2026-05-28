import cors from "cors";
import crypto from "node:crypto";
import dotenv from "dotenv";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT) || 5050;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const SCORE_LIMIT = 20;
const TOKEN_DAYS = 7;
const AUTH_SECRET = process.env.AUTH_SECRET || "neon-arcade-local-secret";

let mongoReady = false;
let scoreModel = null;
let userModel = null;
let challengeModel = null;
let friendRequestModel = null;

const memoryUsers = [];
const memoryScores = [
  seedScore("snake", "Snake", "NOVA", 180, 3, 74, 16),
  seedScore("space-shooter", "Space Shooter", "ORBIT", 420, 4, 96, 22),
  seedScore("breakout", "Breakout", "CIPHER", 310, 3, 88, 28),
  seedScore("tetris", "Tetris", "STACK", 520, 5, 124, 32),
  seedScore("racing-runner", "Racing Runner", "VEGA", 690, 6, 140, 45)
];
const memoryChallenges = [];
const memoryFriendRequests = [];

app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? undefined : CLIENT_ORIGIN
  })
);
app.use(express.json({ limit: "32kb" }));

function seedScore(gameId, gameName, player, score, level, duration, minutesAgo) {
  return {
    id: `seed-${gameId}-${player.toLowerCase()}`,
    gameId,
    gameName,
    player,
    score,
    level,
    duration,
    detail: "World run",
    createdAt: new Date(Date.now() - 1000 * 60 * minutesAgo).toISOString()
  };
}

function clampNumber(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return min;
  }

  return Math.min(max, Math.max(min, Math.round(number)));
}

function cleanUsername(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_@.+-]/g, "")
    .slice(0, 64);
}

function cleanGameId(value) {
  return String(value || "snake")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 48);
}

function cleanGameName(value) {
  return String(value || "Arcade Run").trim().replace(/[<>]/g, "").slice(0, 40);
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, hash] = String(storedHash || "").split(":");
  if (!salt || !hash) {
    return false;
  }

  const candidate = crypto.scryptSync(password, salt, 64);
  const stored = Buffer.from(hash, "hex");
  return stored.length === candidate.length && crypto.timingSafeEqual(stored, candidate);
}

function base64Url(input) {
  return Buffer.from(input).toString("base64url");
}

function signToken(user) {
  const payload = {
    id: user._id?.toString?.() || user.id,
    username: user.username,
    exp: Date.now() + TOKEN_DAYS * 24 * 60 * 60 * 1000
  };
  const body = base64Url(JSON.stringify(payload));
  const signature = crypto.createHmac("sha256", AUTH_SECRET).update(body).digest("base64url");
  return `${body}.${signature}`;
}

function readToken(token) {
  const [body, signature] = String(token || "").split(".");
  if (!body || !signature) {
    return null;
  }

  const expected = crypto.createHmac("sha256", AUTH_SECRET).update(body).digest("base64url");
  if (expected.length !== signature.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload.exp || payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

async function findUserByUsername(username) {
  if (mongoReady && userModel) {
    return userModel.findOne({ username }).lean();
  }

  return memoryUsers.find((user) => user.username === username) || null;
}

async function findUserById(id) {
  if (mongoReady && userModel) {
    return userModel.findById(id).lean();
  }

  return memoryUsers.find((user) => user.id === id) || null;
}

async function createUser(username, password) {
  const user = {
    username,
    avatar: avatarFor(username),
    bio: "",
    friends: [],
    passwordHash: hashPassword(password)
  };

  if (mongoReady && userModel) {
    return userModel.create(user);
  }

  const created = {
    ...user,
    id: `user-${crypto.randomUUID()}`,
    createdAt: new Date().toISOString()
  };
  memoryUsers.push(created);
  return created;
}

function toClientUser(user) {
  return {
    id: user._id?.toString?.() || user.id,
    username: user.username,
    avatar: user.avatar || avatarFor(user.username),
    bio: user.bio || "",
    friends: user.friends || []
  };
}

function cleanBio(value) {
  return String(value || "").trim().replace(/[<>]/g, "").slice(0, 120);
}

function normalizeAvatar(payload, username) {
  const fallback = avatarFor(username);
  const colors = ["#2ff6d0", "#ff4ad8", "#ffcc4d", "#70ff7a", "#60a5fa", "#f97316", "#a78bfa", "#f0abfc"];
  const color = colors.includes(payload?.color) ? payload.color : fallback.color;
  const rawInitials = payload?.initials !== undefined ? String(payload.initials) : String(username || "P");
  const initials = Array.from(rawInitials).slice(0, 2).join("").toUpperCase() || fallback.initials;
  const picture = ["pilot", "racer", "mage", "robot", "snake", "rocket"].includes(payload?.picture) ? payload.picture : "pilot";

  return {
    initials,
    color,
    picture
  };
}

function avatarFor(username) {
  const colors = ["#2ff6d0", "#ff4ad8", "#ffcc4d", "#70ff7a", "#60a5fa", "#f97316"];
  const total = String(username).split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return {
    initials: String(username || "P").slice(0, 2).toUpperCase(),
    color: colors[total % colors.length],
    picture: "pilot"
  };
}

function normalizeScore(payload, user) {
  const allowedDiffs = ["easy", "medium", "hard"];
  const difficulty = allowedDiffs.includes(payload.difficulty?.toLowerCase())
    ? payload.difficulty.toLowerCase()
    : "medium";

  return {
    userId: user._id?.toString?.() || user.id,
    player: user.username,
    gameId: cleanGameId(payload.gameId),
    gameName: cleanGameName(payload.gameName),
    score: clampNumber(payload.score, 0, 9999999),
    level: clampNumber(payload.level || 1, 1, 999),
    difficulty,
    duration: clampNumber(payload.duration, 0, 99999),
    detail: String(payload.detail || "Arcade run").replace(/[<>]/g, "").slice(0, 64)
  };
}

function toClientScore(score) {
  return {
    id: score._id?.toString?.() || score.id,
    userId: score.userId?.toString?.() || score.userId,
    player: score.player,
    gameId: score.gameId,
    gameName: score.gameName,
    score: score.score,
    level: score.level || 1,
    difficulty: score.difficulty || "medium",
    duration: score.duration,
    detail: score.detail,
    createdAt: score.createdAt instanceof Date ? score.createdAt.toISOString() : score.createdAt
  };
}

function normalizeChallenge(payload, user) {
  return {
    fromUserId: user._id?.toString?.() || user.id,
    fromUsername: user.username,
    toUsername: cleanUsername(payload.toUsername),
    gameId: cleanGameId(payload.gameId),
    gameName: cleanGameName(payload.gameName),
    fromScore: 0,
    toScore: 0,
    status: "open"
  };
}

function toClientChallenge(challenge) {
  return {
    id: challenge._id?.toString?.() || challenge.id,
    fromUserId: challenge.fromUserId?.toString?.() || challenge.fromUserId,
    fromUsername: challenge.fromUsername,
    toUsername: challenge.toUsername,
    gameId: challenge.gameId,
    gameName: challenge.gameName,
    fromScore: challenge.fromScore || 0,
    toScore: challenge.toScore || 0,
    status: challenge.status,
    createdAt: challenge.createdAt instanceof Date ? challenge.createdAt.toISOString() : challenge.createdAt
  };
}

function toClientFriendRequest(request) {
  return {
    id: request._id?.toString?.() || request.id,
    fromUsername: request.fromUsername,
    toUsername: request.toUsername,
    status: request.status,
    createdAt: request.createdAt instanceof Date ? request.createdAt.toISOString() : request.createdAt
  };
}

async function friendSummary(username) {
  const friend = await findUserByUsername(username);
  if (!friend) {
    return {
      username,
      avatar: avatarFor(username),
      bio: ""
    };
  }

  return {
    username: friend.username,
    avatar: friend.avatar || avatarFor(friend.username),
    bio: friend.bio || ""
  };
}

async function addFriendship(userA, userB) {
  const usernameA = userA.username;
  const usernameB = userB.username;

  if (mongoReady && userModel) {
    await Promise.all([
      userModel.updateOne({ username: usernameA }, { $addToSet: { friends: usernameB } }),
      userModel.updateOne({ username: usernameB }, { $addToSet: { friends: usernameA } })
    ]);
    return;
  }

  const memoryA = memoryUsers.find((user) => user.username === usernameA);
  const memoryB = memoryUsers.find((user) => user.username === usernameB);
  if (memoryA && !memoryA.friends.includes(usernameB)) memoryA.friends.push(usernameB);
  if (memoryB && !memoryB.friends.includes(usernameA)) memoryB.friends.push(usernameA);
}

function sortScores(scores) {
  return [...scores].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

async function requireAuth(request, response, next) {
  const header = request.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const payload = readToken(token);

  if (!payload) {
    response.status(401).json({ error: "Login required." });
    return;
  }

  const user = await findUserById(payload.id);
  if (!user) {
    response.status(401).json({ error: "Login required." });
    return;
  }

  request.user = user;
  next();
}

async function connectMongo() {
  if (!process.env.MONGO_URI) {
    console.log("MongoDB not configured; using in-memory auth and leaderboards.");
    return;
  }

  const userSchema = new mongoose.Schema(
    {
      username: { type: String, required: true, unique: true, maxlength: 64 },
      avatar: {
        initials: { type: String, maxlength: 16 },
        color: { type: String, maxlength: 16 },
        picture: { type: String, maxlength: 16 }
      },
      bio: { type: String, maxlength: 120, default: "" },
      friends: [{ type: String, maxlength: 64 }],
      passwordHash: { type: String, required: true }
    },
    { timestamps: true }
  );

  const scoreSchema = new mongoose.Schema(
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      player: { type: String, required: true, maxlength: 64 },
      gameId: { type: String, required: true, index: true },
      gameName: { type: String, required: true, maxlength: 40 },
      score: { type: Number, required: true, min: 0 },
      level: { type: Number, default: 1 },
      difficulty: { type: String, maxlength: 12, default: "medium", index: true },
      duration: { type: Number, required: true, min: 0 },
      detail: { type: String, maxlength: 64 }
    },
    { timestamps: true }
  );

  const challengeSchema = new mongoose.Schema(
    {
      fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      fromUsername: { type: String, required: true, maxlength: 64 },
      toUsername: { type: String, required: true, maxlength: 64 },
      gameId: { type: String, required: true },
      gameName: { type: String, required: true, maxlength: 40 },
      fromScore: { type: Number, default: 0 },
      toScore: { type: Number, default: 0 },
      status: { type: String, enum: ["open", "complete"], default: "open" }
    },
    { timestamps: true }
  );

  const friendRequestSchema = new mongoose.Schema(
    {
      fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      fromUsername: { type: String, required: true, maxlength: 64 },
      toUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      toUsername: { type: String, required: true, maxlength: 64 },
      status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" }
    },
    { timestamps: true }
  );

  scoreSchema.index({ gameId: 1, score: -1, createdAt: 1 });
  challengeSchema.index({ fromUsername: 1, toUsername: 1, createdAt: -1 });
  friendRequestSchema.index({ fromUsername: 1, toUsername: 1, status: 1 });
  friendRequestSchema.index({ toUsername: 1, status: 1, createdAt: -1 });
  userModel = mongoose.models.User || mongoose.model("User", userSchema);
  scoreModel = mongoose.models.Score || mongoose.model("Score", scoreSchema);
  challengeModel = mongoose.models.Challenge || mongoose.model("Challenge", challengeSchema);
  friendRequestModel = mongoose.models.FriendRequest || mongoose.model("FriendRequest", friendRequestSchema);

  try {
    await mongoose.connect(process.env.MONGO_URI);
    mongoReady = true;
    console.log("MongoDB arcade database connected.");
  } catch (error) {
    mongoReady = false;
    console.warn(`MongoDB unavailable; using in-memory auth and leaderboards. ${error.message}`);
  }
}

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    mode: mongoReady ? "mongo" : "memory",
    service: "neon-arcade-api"
  });
});

app.post("/api/auth/signup", async (request, response, next) => {
  try {
    const username = cleanUsername(request.body.username);
    const password = String(request.body.password || "");

    if (username.length < 3 || password.length < 6) {
      response.status(400).json({ error: "Use 3+ username characters and 6+ password characters." });
      return;
    }

    const existing = await findUserByUsername(username);
    if (existing) {
      response.status(409).json({ error: "That callsign is already taken." });
      return;
    }

    const user = await createUser(username, password);
    response.status(201).json({ token: signToken(user), user: toClientUser(user) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/login", async (request, response, next) => {
  try {
    const username = cleanUsername(request.body.username);
    const password = String(request.body.password || "");
    const user = await findUserByUsername(username);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      response.status(401).json({ error: "Invalid callsign or password." });
      return;
    }

    response.json({ token: signToken(user), user: toClientUser(user) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/auth/me", requireAuth, (request, response) => {
  response.json({ user: toClientUser(request.user) });
});

app.patch("/api/profile", requireAuth, async (request, response, next) => {
  try {
    const oldUsername = request.user.username;
    const newUsername = request.body.username ? cleanUsername(request.body.username) : oldUsername;

    if (newUsername !== oldUsername) {
      if (newUsername.length < 3) {
        response.status(400).json({ error: "Callsign must be 3+ characters." });
        return;
      }
      const existing = await findUserByUsername(newUsername);
      if (existing) {
        response.status(409).json({ error: "That callsign is already taken." });
        return;
      }
    }

    const avatar = normalizeAvatar(request.body.avatar, newUsername);
    const bio = cleanBio(request.body.bio);

    if (mongoReady && userModel) {
      if (newUsername !== oldUsername) {
        await Promise.all([
          scoreModel.updateMany({ userId: request.user._id }, { player: newUsername }),
          challengeModel.updateMany({ fromUserId: request.user._id }, { fromUsername: newUsername }),
          challengeModel.updateMany({ toUsername: oldUsername }, { toUsername: newUsername }),
          friendRequestModel.updateMany({ fromUsername: oldUsername }, { fromUsername: newUsername }),
          friendRequestModel.updateMany({ toUsername: oldUsername }, { toUsername: newUsername }),
          userModel.updateMany({ friends: oldUsername }, { $set: { "friends.$": newUsername } })
        ]);
        request.user.username = newUsername;
      }

      const updated = await userModel
        .findByIdAndUpdate(request.user._id, { username: request.user.username, avatar, bio }, { new: true })
        .lean();
      
      const clientUser = toClientUser(updated);
      const token = newUsername !== oldUsername ? signToken(updated) : undefined;
      response.json({ user: clientUser, ...(token ? { token } : {}) });
      return;
    }

    const user = memoryUsers.find((item) => item.id === request.user.id);
    if (!user) {
      response.status(404).json({ error: "Player not found." });
      return;
    }

    if (newUsername !== oldUsername) {
      memoryScores.forEach((s) => {
        if (s.userId === request.user.id) s.player = newUsername;
      });
      memoryChallenges.forEach((c) => {
        if (c.fromUserId === request.user.id) c.fromUsername = newUsername;
        if (c.toUsername === oldUsername) c.toUsername = newUsername;
      });
      memoryFriendRequests.forEach((fr) => {
        if (fr.fromUsername === oldUsername) fr.fromUsername = newUsername;
        if (fr.toUsername === oldUsername) fr.toUsername = newUsername;
      });
      memoryUsers.forEach((u) => {
        u.friends = u.friends.map((f) => (f === oldUsername ? newUsername : f));
      });
      user.username = newUsername;
    }

    user.avatar = avatar;
    user.bio = bio;

    const clientUser = toClientUser(user);
    const token = newUsername !== oldUsername ? signToken(user) : undefined;
    response.json({ user: clientUser, ...(token ? { token } : {}) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/friends", requireAuth, async (request, response, next) => {
  try {
    const username = request.user.username;
    const freshUser = await findUserByUsername(username);
    const friends = await Promise.all((freshUser?.friends || []).map(friendSummary));

    if (mongoReady && friendRequestModel) {
      const requests = await friendRequestModel
        .find({
          status: "pending",
          $or: [{ fromUsername: username }, { toUsername: username }]
        })
        .sort({ createdAt: -1 })
        .limit(80)
        .lean();

      response.json({
        friends,
        incoming: requests.filter((item) => item.toUsername === username).map(toClientFriendRequest),
        outgoing: requests.filter((item) => item.fromUsername === username).map(toClientFriendRequest)
      });
      return;
    }

    const requests = memoryFriendRequests.filter(
      (item) => item.status === "pending" && (item.fromUsername === username || item.toUsername === username)
    );
    response.json({
      friends,
      incoming: requests.filter((item) => item.toUsername === username).map(toClientFriendRequest),
      outgoing: requests.filter((item) => item.fromUsername === username).map(toClientFriendRequest)
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/friends/requests", requireAuth, async (request, response, next) => {
  try {
    const fromUsername = request.user.username;
    const toUsername = cleanUsername(request.body.username || request.body.toUsername);

    if (!toUsername || toUsername === fromUsername) {
      response.status(400).json({ error: "Enter another player's username." });
      return;
    }

    const [currentUser, targetUser] = await Promise.all([findUserByUsername(fromUsername), findUserByUsername(toUsername)]);
    if (!targetUser) {
      response.status(404).json({ error: "No player found with that username." });
      return;
    }

    if ((currentUser?.friends || []).includes(toUsername)) {
      response.status(409).json({ error: "That player is already your friend." });
      return;
    }

    if (mongoReady && friendRequestModel) {
      const existing = await friendRequestModel
        .findOne({
          status: "pending",
          $or: [
            { fromUsername, toUsername },
            { fromUsername: toUsername, toUsername: fromUsername }
          ]
        })
        .lean();
      if (existing) {
        response.status(409).json({ error: "A friend request is already waiting." });
        return;
      }

      const created = await friendRequestModel.create({
        fromUserId: request.user._id,
        fromUsername,
        toUserId: targetUser._id,
        toUsername,
        status: "pending"
      });
      response.status(201).json(toClientFriendRequest(created));
      return;
    }

    const existing = memoryFriendRequests.find(
      (item) =>
        item.status === "pending" &&
        ((item.fromUsername === fromUsername && item.toUsername === toUsername) ||
          (item.fromUsername === toUsername && item.toUsername === fromUsername))
    );
    if (existing) {
      response.status(409).json({ error: "A friend request is already waiting." });
      return;
    }

    const created = {
      id: `friend-${Date.now()}-${crypto.randomUUID()}`,
      fromUserId: request.user.id,
      fromUsername,
      toUserId: targetUser.id,
      toUsername,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    memoryFriendRequests.unshift(created);
    memoryFriendRequests.splice(120);
    response.status(201).json(toClientFriendRequest(created));
  } catch (error) {
    next(error);
  }
});

app.post("/api/friends/requests/:id/accept", requireAuth, async (request, response, next) => {
  try {
    const id = request.params.id;
    const username = request.user.username;

    if (mongoReady && friendRequestModel) {
      const friendRequest = await friendRequestModel.findById(id);
      if (!friendRequest) {
        response.status(404).json({ error: "Friend request not found." });
        return;
      }

      if (friendRequest.toUsername !== username) {
        response.status(403).json({ error: "This request is not for you." });
        return;
      }

      if (friendRequest.status === "pending") {
        const [fromUser, toUser] = await Promise.all([
          findUserByUsername(friendRequest.fromUsername),
          findUserByUsername(friendRequest.toUsername)
        ]);
        if (fromUser && toUser) {
          await addFriendship(fromUser, toUser);
        }
        friendRequest.status = "accepted";
        await friendRequest.save();
      }

      response.json(toClientFriendRequest(friendRequest));
      return;
    }

    const friendRequest = memoryFriendRequests.find((item) => item.id === id);
    if (!friendRequest) {
      response.status(404).json({ error: "Friend request not found." });
      return;
    }

    if (friendRequest.toUsername !== username) {
      response.status(403).json({ error: "This request is not for you." });
      return;
    }

    if (friendRequest.status === "pending") {
      const fromUser = await findUserByUsername(friendRequest.fromUsername);
      const toUser = await findUserByUsername(friendRequest.toUsername);
      if (fromUser && toUser) {
        await addFriendship(fromUser, toUser);
      }
      friendRequest.status = "accepted";
    }

    response.json(toClientFriendRequest(friendRequest));
  } catch (error) {
    next(error);
  }
});

app.post("/api/friends/requests/:id/reject", requireAuth, async (request, response, next) => {
  try {
    const id = request.params.id;
    const username = request.user.username;

    if (mongoReady && friendRequestModel) {
      const friendRequest = await friendRequestModel.findById(id);
      if (!friendRequest) {
        response.status(404).json({ error: "Friend request not found." });
        return;
      }

      if (friendRequest.toUsername !== username) {
        response.status(403).json({ error: "This request is not for you." });
        return;
      }

      if (friendRequest.status === "pending") {
        friendRequest.status = "rejected";
        await friendRequest.save();
      }
      response.json(toClientFriendRequest(friendRequest));
      return;
    }

    const friendRequest = memoryFriendRequests.find((item) => item.id === id);
    if (!friendRequest) {
      response.status(404).json({ error: "Friend request not found." });
      return;
    }

    if (friendRequest.toUsername !== username) {
      response.status(403).json({ error: "This request is not for you." });
      return;
    }

    if (friendRequest.status === "pending") {
      friendRequest.status = "rejected";
    }
    response.json(toClientFriendRequest(friendRequest));
  } catch (error) {
    next(error);
  }
});

app.get("/api/scores/personal", requireAuth, async (request, response, next) => {
  try {
    const userId = request.user._id?.toString?.() || request.user.id;
    if (mongoReady && scoreModel) {
      const scores = await scoreModel.find({ userId }).lean();
      const records = {};
      scores.forEach((s) => {
        const gameId = s.gameId;
        const diff = s.difficulty || "medium";
        if (!records[gameId]) {
          records[gameId] = { easy: 0, medium: 0, hard: 0 };
        }
        if (s.score > records[gameId][diff]) {
          records[gameId][diff] = s.score;
        }
      });
      response.json(records);
      return;
    }

    const records = {};
    memoryScores.forEach((s) => {
      if (s.userId === userId) {
        const gameId = s.gameId;
        const diff = s.difficulty || "medium";
        if (!records[gameId]) {
          records[gameId] = { easy: 0, medium: 0, hard: 0 };
        }
        if (s.score > records[gameId][diff]) {
          records[gameId][diff] = s.score;
        }
      }
    });
    response.json(records);
  } catch (error) {
    next(error);
  }
});

app.get("/api/scores", async (request, response, next) => {
  try {
    const gameId = cleanGameId(request.query.gameId || "");
    const limit = clampNumber(request.query.limit, 1, SCORE_LIMIT);
    const difficulty = request.query.difficulty;

    if (mongoReady && scoreModel) {
      const query = {};
      if (gameId) query.gameId = gameId;
      if (difficulty) query.difficulty = difficulty;
      const scores = await scoreModel.find(query).sort({ score: -1, createdAt: 1 }).limit(limit).lean();
      response.json(scores.map(toClientScore));
      return;
    }

    let filtered = gameId ? memoryScores.filter((score) => score.gameId === gameId) : memoryScores;
    if (difficulty) {
      filtered = filtered.filter((score) => score.difficulty === difficulty);
    }
    response.json(sortScores(filtered).slice(0, limit).map(toClientScore));
  } catch (error) {
    next(error);
  }
});

app.post("/api/scores", requireAuth, async (request, response, next) => {
  try {
    const score = normalizeScore(request.body, request.user);

    if (mongoReady && scoreModel) {
      const created = await scoreModel.create(score);
      response.status(201).json(toClientScore(created));
      return;
    }

    const created = {
      ...score,
      id: `memory-${Date.now()}-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString()
    };
    memoryScores.push(created);
    const trimmed = sortScores(memoryScores).slice(0, 300);
    memoryScores.length = 0;
    memoryScores.push(...trimmed);
    response.status(201).json(toClientScore(created));
  } catch (error) {
    next(error);
  }
});

app.get("/api/challenges", requireAuth, async (request, response, next) => {
  try {
    const username = request.user.username;

    if (mongoReady && challengeModel) {
      const challenges = await challengeModel
        .find({ $or: [{ fromUsername: username }, { toUsername: username }] })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();
      response.json(challenges.map(toClientChallenge));
      return;
    }

    response.json(
      memoryChallenges
        .filter((challenge) => challenge.fromUsername === username || challenge.toUsername === username)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 20)
        .map(toClientChallenge)
    );
  } catch (error) {
    next(error);
  }
});

app.post("/api/challenges", requireAuth, async (request, response, next) => {
  try {
    const challenge = normalizeChallenge(request.body, request.user);

    if (!challenge.toUsername || challenge.toUsername === request.user.username) {
      response.status(400).json({ error: "Enter a friend's username." });
      return;
    }

    const friend = await findUserByUsername(challenge.toUsername);
    if (!friend) {
      response.status(404).json({ error: "No player found with that username." });
      return;
    }

    if (mongoReady && challengeModel) {
      const created = await challengeModel.create(challenge);
      response.status(201).json(toClientChallenge(created));
      return;
    }

    const created = {
      ...challenge,
      id: `challenge-${Date.now()}-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString()
    };
    memoryChallenges.unshift(created);
    memoryChallenges.splice(80);
    response.status(201).json(toClientChallenge(created));
  } catch (error) {
    next(error);
  }
});

app.post("/api/challenges/:id/score", requireAuth, async (request, response, next) => {
  try {
    const score = clampNumber(request.body.score, 0, 9999999);
    const id = request.params.id;

    if (mongoReady && challengeModel) {
      const challenge = await challengeModel.findById(id);
      if (!challenge) {
        response.status(404).json({ error: "Challenge not found." });
        return;
      }

      if (challenge.fromUsername === request.user.username) {
        challenge.fromScore = Math.max(challenge.fromScore || 0, score);
      } else if (challenge.toUsername === request.user.username) {
        challenge.toScore = Math.max(challenge.toScore || 0, score);
      } else {
        response.status(403).json({ error: "This is not your challenge." });
        return;
      }

      challenge.status = challenge.fromScore && challenge.toScore ? "complete" : "open";
      await challenge.save();
      response.json(toClientChallenge(challenge));
      return;
    }

    const challenge = memoryChallenges.find((item) => item.id === id);
    if (!challenge) {
      response.status(404).json({ error: "Challenge not found." });
      return;
    }

    if (challenge.fromUsername === request.user.username) {
      challenge.fromScore = Math.max(challenge.fromScore || 0, score);
    } else if (challenge.toUsername === request.user.username) {
      challenge.toScore = Math.max(challenge.toScore || 0, score);
    } else {
      response.status(403).json({ error: "This is not your challenge." });
      return;
    }

    challenge.status = challenge.fromScore && challenge.toScore ? "complete" : "open";
    response.json(toClientChallenge(challenge));
  } catch (error) {
    next(error);
  }
});

const distPath = path.resolve(__dirname, "..", "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/^(?!\/api).*/, (_request, response) => {
    response.sendFile(path.join(distPath, "index.html"));
  });
}

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: "The arcade server missed a beat." });
});

await connectMongo();

const server = app.listen(PORT, () => {
  console.log(`Neon Arcade API listening on http://localhost:${PORT}`);
});

function shutdown() {
  server.close(async () => {
    if (mongoReady) {
      await mongoose.disconnect();
    }
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

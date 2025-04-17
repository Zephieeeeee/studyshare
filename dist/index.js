// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import session from "express-session";
import createMemoryStore from "memorystore";
import fs from "fs";
import path from "path";
var MemoryStore = createMemoryStore(session);
var UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
var MemStorage = class {
  users;
  categories;
  notes;
  ratings;
  files;
  // noteId -> filePath
  currentUserId;
  currentCategoryId;
  currentNoteId;
  currentRatingId;
  sessionStore;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.categories = /* @__PURE__ */ new Map();
    this.notes = /* @__PURE__ */ new Map();
    this.ratings = /* @__PURE__ */ new Map();
    this.files = /* @__PURE__ */ new Map();
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentNoteId = 1;
    this.currentRatingId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 864e5
      // prune expired entries every 24h
    });
    this.initializeDefaultCategories();
  }
  initializeDefaultCategories() {
    const defaultCategories = [
      { name: "Computer Science", color: "blue", icon: "computer-line" },
      { name: "Mathematics", color: "green", icon: "calculator-line" },
      { name: "Business", color: "yellow", icon: "briefcase-line" },
      { name: "Engineering", color: "purple", icon: "tools-line" },
      { name: "Medicine", color: "pink", icon: "heart-pulse-line" },
      { name: "Sciences", color: "indigo", icon: "flask-line" }
    ];
    defaultCategories.forEach((category) => {
      this.createCategory(category);
    });
  }
  // User methods
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async getUserByEmail(email) {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  async createUser(insertUser) {
    const id = this.currentUserId++;
    const user = { ...insertUser, id, profileImage: null };
    this.users.set(id, user);
    return user;
  }
  // Category methods
  async getCategories() {
    return Array.from(this.categories.values());
  }
  async getCategory(id) {
    return this.categories.get(id);
  }
  async createCategory(category) {
    const id = this.currentCategoryId++;
    const newCategory = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  // Note methods
  async getNotes() {
    return Array.from(this.notes.values());
  }
  async getNotesByCategory(categoryId) {
    return Array.from(this.notes.values()).filter(
      (note) => note.categoryId === categoryId
    );
  }
  async getNotesByUser(userId) {
    return Array.from(this.notes.values()).filter(
      (note) => note.userId === userId
    );
  }
  async getNote(id) {
    return this.notes.get(id);
  }
  async createNote(insertNote) {
    const id = this.currentNoteId++;
    const now = /* @__PURE__ */ new Date();
    const note = {
      ...insertNote,
      id,
      uploadDate: now,
      downloads: 0,
      views: 0
    };
    this.notes.set(id, note);
    return note;
  }
  async incrementNoteDownloads(id) {
    const note = this.notes.get(id);
    if (!note) return void 0;
    const updatedNote = { ...note, downloads: note.downloads + 1 };
    this.notes.set(id, updatedNote);
    return updatedNote;
  }
  async incrementNoteViews(id) {
    const note = this.notes.get(id);
    if (!note) return void 0;
    const updatedNote = { ...note, views: note.views + 1 };
    this.notes.set(id, updatedNote);
    return updatedNote;
  }
  // Rating methods
  async getRatingsByNote(noteId) {
    return Array.from(this.ratings.values()).filter(
      (rating) => rating.noteId === noteId
    );
  }
  async getUserRating(userId, noteId) {
    return Array.from(this.ratings.values()).find(
      (rating) => rating.userId === userId && rating.noteId === noteId
    );
  }
  async createRating(insertRating) {
    const id = this.currentRatingId++;
    const rating = { ...insertRating, id };
    this.ratings.set(id, rating);
    return rating;
  }
  async updateRating(id, ratingUpdate) {
    const rating = this.ratings.get(id);
    if (!rating) return void 0;
    const updatedRating = { ...rating, ...ratingUpdate };
    this.ratings.set(id, updatedRating);
    return updatedRating;
  }
  // File methods
  async saveFile(file, noteId) {
    const fileName = `${noteId}_${file.originalname}`;
    const filePath = path.join(UPLOADS_DIR, fileName);
    const writeStream = fs.createWriteStream(filePath);
    writeStream.write(file.buffer);
    writeStream.end();
    return new Promise((resolve, reject) => {
      writeStream.on("finish", () => {
        this.files.set(noteId, filePath);
        resolve(filePath);
      });
      writeStream.on("error", reject);
    });
  }
  async getFilePath(noteId) {
    return this.files.get(noteId);
  }
};
var storage = new MemStorage();

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "studyshare-session-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1e3
      // 1 week
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !await comparePasswords(password, user.password)) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const existingUserByUsername = await storage.getUserByUsername(req.body.username);
      if (existingUserByUsername) {
        return res.status(400).send("Username already exists");
      }
      const existingUserByEmail = await storage.getUserByEmail(req.body.email);
      if (existingUserByEmail) {
        return res.status(400).send("Email already exists");
      }
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password)
      });
      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (err) {
      next(err);
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid username or password" });
      req.login(user, (err2) => {
        if (err2) return next(err2);
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}

// server/routes.ts
import multer from "multer";

// shared/schema.ts
import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  email: text("email").notNull().unique(),
  profileImage: text("profile_image")
});
var categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  icon: text("icon").notNull()
});
var notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  fileType: text("file_type").notNull(),
  uploadDate: timestamp("upload_date").defaultNow().notNull(),
  userId: integer("user_id").notNull(),
  categoryId: integer("category_id").notNull(),
  downloads: integer("downloads").default(0).notNull(),
  views: integer("views").default(0).notNull()
});
var ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  noteId: integer("note_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment")
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  email: true
});
var insertCategorySchema = createInsertSchema(categories);
var insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  uploadDate: true,
  downloads: true,
  views: true
});
var insertRatingSchema = createInsertSchema(ratings).omit({
  id: true
});

// server/routes.ts
import fs2 from "fs";
var upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/msword",
      "application/vnd.ms-powerpoint"
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, Word and PowerPoint files are allowed"));
    }
  }
});
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.get("/api/categories", async (_req, res) => {
    try {
      const categories2 = await storage.getCategories();
      res.json(categories2);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  });
  app2.get("/api/notes", async (_req, res) => {
    try {
      const notes2 = await storage.getNotes();
      res.json(notes2);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  });
  app2.get("/api/notes/category/:categoryId", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      const category = await storage.getCategory(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      const notes2 = await storage.getNotesByCategory(categoryId);
      res.json(notes2);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  });
  app2.get("/api/notes/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const notes2 = await storage.getNotesByUser(userId);
      res.json(notes2);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  });
  app2.get("/api/notes/:id", async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      if (isNaN(noteId)) {
        return res.status(400).json({ message: "Invalid note ID" });
      }
      const note = await storage.getNote(noteId);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      await storage.incrementNoteViews(noteId);
      res.json(note);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  });
  app2.post("/api/notes", isAuthenticated, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const parsedData = insertNoteSchema.parse({
        ...req.body,
        userId: req.user.id,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        fileName: req.file.originalname,
        categoryId: parseInt(req.body.categoryId)
      });
      const note = await storage.createNote(parsedData);
      await storage.saveFile(req.file, note.id);
      res.status(201).json(note);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  app2.get("/api/notes/:id/download", async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      if (isNaN(noteId)) {
        return res.status(400).json({ message: "Invalid note ID" });
      }
      const note = await storage.getNote(noteId);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      const filePath = await storage.getFilePath(noteId);
      if (!filePath || !fs2.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
      }
      await storage.incrementNoteDownloads(noteId);
      res.download(filePath, note.fileName);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  });
  app2.get("/api/notes/:id/ratings", async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      if (isNaN(noteId)) {
        return res.status(400).json({ message: "Invalid note ID" });
      }
      const note = await storage.getNote(noteId);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      const ratings2 = await storage.getRatingsByNote(noteId);
      res.json(ratings2);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  });
  app2.post("/api/notes/:id/rate", isAuthenticated, async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      if (isNaN(noteId)) {
        return res.status(400).json({ message: "Invalid note ID" });
      }
      const note = await storage.getNote(noteId);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      const parsedData = insertRatingSchema.parse({
        ...req.body,
        userId: req.user.id,
        noteId
      });
      const existingRating = await storage.getUserRating(req.user.id, noteId);
      let rating;
      if (existingRating) {
        rating = await storage.updateRating(existingRating.id, {
          rating: parsedData.rating,
          comment: parsedData.comment
        });
      } else {
        rating = await storage.createRating(parsedData);
      }
      res.status(201).json(rating);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  app2.get("/api/notes/:id/myrating", isAuthenticated, async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      if (isNaN(noteId)) {
        return res.status(400).json({ message: "Invalid note ID" });
      }
      const note = await storage.getNote(noteId);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      const rating = await storage.getUserRating(req.user.id, noteId);
      if (!rating) {
        return res.status(404).json({ message: "Rating not found" });
      }
      res.json(rating);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs3 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs3.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs3.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
    log(`Server is listening at http://0.0.0.0:${port}`);
  });
})();

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import multer from "multer";
import { insertNoteSchema, insertRatingSchema } from "@shared/schema";
import path from "path";
import fs from "fs";

// Setup multer for file uploads (store in memory then save to disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Allow only PDF, DOCX, PPTX files
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.ms-powerpoint'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Word and PowerPoint files are allowed'));
    }
  }
});

// Authentication middleware
function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Get all categories
  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  });

  // Get all notes
  app.get("/api/notes", async (_req, res) => {
    try {
      const notes = await storage.getNotes();
      res.json(notes);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  });

  // Get notes by category
  app.get("/api/notes/category/:categoryId", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const category = await storage.getCategory(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      const notes = await storage.getNotesByCategory(categoryId);
      res.json(notes);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  });

  // Get notes by user
  app.get("/api/notes/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const notes = await storage.getNotesByUser(userId);
      res.json(notes);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  });

  // Get note by ID
  app.get("/api/notes/:id", async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      
      if (isNaN(noteId)) {
        return res.status(400).json({ message: "Invalid note ID" });
      }
      
      const note = await storage.getNote(noteId);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      // Increment view count
      await storage.incrementNoteViews(noteId);
      
      res.json(note);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  });

  // Create a new note with file upload
  app.post("/api/notes", isAuthenticated, upload.single('file'), async (req, res) => {
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
        categoryId: parseInt(req.body.categoryId),
      });
      
      // Create the note in the database
      const note = await storage.createNote(parsedData);
      
      // Save the file to disk
      await storage.saveFile(req.file, note.id);
      
      res.status(201).json(note);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // Download a note file
  app.get("/api/notes/:id/download", async (req, res) => {
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
      if (!filePath || !fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
      }
      
      // Increment download count
      await storage.incrementNoteDownloads(noteId);
      
      res.download(filePath, note.fileName);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  });

  // Get ratings for a note
  app.get("/api/notes/:id/ratings", async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      
      if (isNaN(noteId)) {
        return res.status(400).json({ message: "Invalid note ID" });
      }
      
      const note = await storage.getNote(noteId);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      const ratings = await storage.getRatingsByNote(noteId);
      res.json(ratings);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  });

  // Add or update a rating for a note
  app.post("/api/notes/:id/rate", isAuthenticated, async (req, res) => {
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
        noteId,
      });
      
      // Check if user already rated this note
      const existingRating = await storage.getUserRating(req.user.id, noteId);
      
      let rating;
      if (existingRating) {
        // Update existing rating
        rating = await storage.updateRating(existingRating.id, {
          rating: parsedData.rating,
          comment: parsedData.comment,
        });
      } else {
        // Create new rating
        rating = await storage.createRating(parsedData);
      }
      
      res.status(201).json(rating);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // Get current user's rating for a note
  app.get("/api/notes/:id/myrating", isAuthenticated, async (req, res) => {
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

  const httpServer = createServer(app);

  return httpServer;
}

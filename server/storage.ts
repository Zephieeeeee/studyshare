import { users, type User, type InsertUser, notes, type Note, type InsertNote, categories, type Category, type InsertCategory, ratings, type Rating, type InsertRating } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import fs from "fs";
import path from "path";

const MemoryStore = createMemoryStore(session);

// File handling utilities
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Notes
  getNotes(): Promise<Note[]>;
  getNotesByCategory(categoryId: number): Promise<Note[]>;
  getNotesByUser(userId: number): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  incrementNoteDownloads(id: number): Promise<Note | undefined>;
  incrementNoteViews(id: number): Promise<Note | undefined>;
  
  // Ratings
  getRatingsByNote(noteId: number): Promise<Rating[]>;
  getUserRating(userId: number, noteId: number): Promise<Rating | undefined>;
  createRating(rating: InsertRating): Promise<Rating>;
  updateRating(id: number, rating: Partial<Rating>): Promise<Rating | undefined>;
  
  // File handling
  saveFile(file: Express.Multer.File, noteId: number): Promise<string>;
  getFilePath(noteId: number): Promise<string | undefined>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private notes: Map<number, Note>;
  private ratings: Map<number, Rating>;
  private files: Map<number, string>; // noteId -> filePath
  
  currentUserId: number;
  currentCategoryId: number;
  currentNoteId: number;
  currentRatingId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.notes = new Map();
    this.ratings = new Map();
    this.files = new Map();
    
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentNoteId = 1;
    this.currentRatingId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Initialize with default categories
    this.initializeDefaultCategories();
  }

  private initializeDefaultCategories() {
    const defaultCategories: InsertCategory[] = [
      { name: "Computer Science", color: "blue", icon: "computer-line" },
      { name: "Mathematics", color: "green", icon: "calculator-line" },
      { name: "Business", color: "yellow", icon: "briefcase-line" },
      { name: "Engineering", color: "purple", icon: "tools-line" },
      { name: "Medicine", color: "pink", icon: "heart-pulse-line" },
      { name: "Sciences", color: "indigo", icon: "flask-line" }
    ];
    
    defaultCategories.forEach(category => {
      this.createCategory(category);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, profileImage: null };
    this.users.set(id, user);
    return user;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  // Note methods
  async getNotes(): Promise<Note[]> {
    return Array.from(this.notes.values());
  }

  async getNotesByCategory(categoryId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(
      note => note.categoryId === categoryId
    );
  }

  async getNotesByUser(userId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(
      note => note.userId === userId
    );
  }

  async getNote(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.currentNoteId++;
    const now = new Date();
    const note: Note = { 
      ...insertNote, 
      id, 
      uploadDate: now, 
      downloads: 0, 
      views: 0 
    };
    this.notes.set(id, note);
    return note;
  }

  async incrementNoteDownloads(id: number): Promise<Note | undefined> {
    const note = this.notes.get(id);
    if (!note) return undefined;
    
    const updatedNote = { ...note, downloads: note.downloads + 1 };
    this.notes.set(id, updatedNote);
    return updatedNote;
  }

  async incrementNoteViews(id: number): Promise<Note | undefined> {
    const note = this.notes.get(id);
    if (!note) return undefined;
    
    const updatedNote = { ...note, views: note.views + 1 };
    this.notes.set(id, updatedNote);
    return updatedNote;
  }

  // Rating methods
  async getRatingsByNote(noteId: number): Promise<Rating[]> {
    return Array.from(this.ratings.values()).filter(
      rating => rating.noteId === noteId
    );
  }

  async getUserRating(userId: number, noteId: number): Promise<Rating | undefined> {
    return Array.from(this.ratings.values()).find(
      rating => rating.userId === userId && rating.noteId === noteId
    );
  }

  async createRating(insertRating: InsertRating): Promise<Rating> {
    const id = this.currentRatingId++;
    const rating: Rating = { ...insertRating, id };
    this.ratings.set(id, rating);
    return rating;
  }

  async updateRating(id: number, ratingUpdate: Partial<Rating>): Promise<Rating | undefined> {
    const rating = this.ratings.get(id);
    if (!rating) return undefined;
    
    const updatedRating = { ...rating, ...ratingUpdate };
    this.ratings.set(id, updatedRating);
    return updatedRating;
  }

  // File methods
  async saveFile(file: Express.Multer.File, noteId: number): Promise<string> {
    const fileName = `${noteId}_${file.originalname}`;
    const filePath = path.join(UPLOADS_DIR, fileName);
    
    // Create a file stream
    const writeStream = fs.createWriteStream(filePath);
    
    // Write the file buffer to the stream
    writeStream.write(file.buffer);
    writeStream.end();
    
    return new Promise((resolve, reject) => {
      writeStream.on('finish', () => {
        this.files.set(noteId, filePath);
        resolve(filePath);
      });
      
      writeStream.on('error', reject);
    });
  }

  async getFilePath(noteId: number): Promise<string | undefined> {
    return this.files.get(noteId);
  }
}

export const storage = new MemStorage();

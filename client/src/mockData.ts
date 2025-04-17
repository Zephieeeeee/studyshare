// Mock data for frontend-only version

import { User, Category, Note, Rating } from '@shared/schema';

// Mock users
export const users: User[] = [
  {
    id: 1,
    username: 'johndoe',
    password: 'hashed_password', // In a real app, passwords would be hashed
    displayName: 'John Doe',
    email: 'john@university.edu',
    profileImage: null,
  },
  {
    id: 2,
    username: 'janesmith',
    password: 'hashed_password',
    displayName: 'Jane Smith',
    email: 'jane@university.edu',
    profileImage: null,
  },
];

// Mock categories
export const categories: Category[] = [
  {
    id: 1,
    name: 'Computer Science',
    color: 'blue',
    icon: 'computer',
  },
  {
    id: 2,
    name: 'Mathematics',
    color: 'green',
    icon: 'calculator',
  },
  {
    id: 3,
    name: 'Physics',
    color: 'purple',
    icon: 'atom',
  },
  {
    id: 4,
    name: 'Chemistry',
    color: 'orange',
    icon: 'flask',
  },
  {
    id: 5,
    name: 'Biology',
    color: 'red',
    icon: 'dna',
  },
  {
    id: 6,
    name: 'History',
    color: 'yellow',
    icon: 'book',
  },
];

// Mock notes
export const notes: Note[] = [
  {
    id: 1,
    title: 'Data Structures Final Notes',
    description: 'Comprehensive notes covering linked lists, trees, graphs, and algorithms for the final exam.',
    fileName: 'data_structures_notes.pdf',
    fileSize: 2500000,
    fileType: 'application/pdf',
    uploadDate: new Date('2023-12-10'),
    userId: 1,
    categoryId: 1,
    downloads: 145,
    views: 320,
  },
  {
    id: 2,
    title: 'Calculus II Formula Sheet',
    description: 'All formulas needed for integration techniques, series, and polar coordinates.',
    fileName: 'calculus_formulas.pdf',
    fileSize: 1200000,
    fileType: 'application/pdf',
    uploadDate: new Date('2023-11-05'),
    userId: 2,
    categoryId: 2,
    downloads: 210,
    views: 430,
  },
  {
    id: 3,
    title: 'Introduction to Quantum Mechanics',
    description: 'Notes from Professor Miller\'s quantum mechanics lectures covering wave functions and Schrödinger equation.',
    fileName: 'quantum_mechanics_intro.pdf',
    fileSize: 3100000,
    fileType: 'application/pdf',
    uploadDate: new Date('2023-10-22'),
    userId: 1,
    categoryId: 3,
    downloads: 89,
    views: 156,
  },
];

// Mock ratings
export const ratings: Rating[] = [
  {
    id: 1,
    userId: 2,
    noteId: 1,
    rating: 5,
    comment: 'Incredibly helpful notes, got an A on my final exam!',
  },
  {
    id: 2,
    userId: 1,
    noteId: 2,
    rating: 4,
    comment: 'Very comprehensive formula sheet, would recommend.',
  },
  {
    id: 3,
    userId: 2,
    noteId: 3,
    rating: 5,
    comment: 'Exactly what I needed to understand wave functions.',
  },
];

// Mock authentication (simulates current user)
let currentUser: User | null = null;

// Mock auth functions
export const mockAuth = {
  login: (username: string, password: string): Promise<User | null> => {
    return new Promise((resolve) => {
      const user = users.find(u => u.username === username);
      if (user) {
        // In a real app, you would check password hash
        currentUser = user;
        resolve(user);
      } else {
        resolve(null);
      }
    });
  },
  
  register: (userData: any): Promise<User> => {
    return new Promise((resolve) => {
      const newUser: User = {
        id: users.length + 1,
        username: userData.username,
        password: userData.password,
        displayName: userData.displayName,
        email: userData.email,
        profileImage: null,
      };
      
      users.push(newUser);
      currentUser = newUser;
      resolve(newUser);
    });
  },
  
  logout: (): Promise<void> => {
    return new Promise((resolve) => {
      currentUser = null;
      resolve();
    });
  },
  
  getCurrentUser: (): Promise<User | null> => {
    return Promise.resolve(currentUser);
  }
};

// Helper functions to simulate API endpoints
export const mockApi = {
  // Categories
  getCategories: () => Promise.resolve(categories),
  
  // Notes
  getNotes: () => Promise.resolve(notes),
  
  getNotesByCategory: (categoryId: number) => 
    Promise.resolve(notes.filter(note => note.categoryId === categoryId)),
  
  getNotesByUser: (userId: number) => 
    Promise.resolve(notes.filter(note => note.userId === userId)),
  
  getNote: (noteId: number) => 
    Promise.resolve(notes.find(note => note.id === noteId) || null),
  
  // Ratings
  getAllRatings: () => Promise.resolve(ratings),
  
  getRatingsByNote: (noteId: number) => 
    Promise.resolve(ratings.filter(rating => rating.noteId === noteId)),
  
  getUserRating: (userId: number, noteId: number) => 
    Promise.resolve(ratings.find(rating => rating.userId === userId && rating.noteId === noteId) || null),
  
  createRating: (ratingData: any) => {
    const newRating: Rating = {
      id: ratings.length + 1,
      ...ratingData,
    };
    ratings.push(newRating);
    return Promise.resolve(newRating);
  },
  
  updateRating: (id: number, ratingData: any) => {
    const index = ratings.findIndex(rating => rating.id === id);
    if (index !== -1) {
      ratings[index] = { ...ratings[index], ...ratingData };
      return Promise.resolve(ratings[index]);
    }
    return Promise.resolve(null);
  },
  
  // Users
  getUsers: () => Promise.resolve(users),
  
  getUser: (userId: number) =>
    Promise.resolve(users.find(user => user.id === userId) || null),
  
  updateUser: (userId: number, userData: any) => {
    const index = users.findIndex(user => user.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...userData };
      return Promise.resolve(users[index]);
    }
    return Promise.resolve(null);
  },
  
  // File operations (mock)
  uploadFile: (file: File, noteData: any) => {
    const noteId = notes.length + 1;
    const newNote = {
      id: noteId,
      title: noteData.title,
      description: noteData.description,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadDate: new Date(),
      userId: noteData.userId || 1, // Default to first user if not specified
      categoryId: noteData.categoryId,
      downloads: 0,
      views: 0
    };
    
    notes.push(newNote as Note);
    return Promise.resolve(newNote);
  },
  
  incrementNoteViews: (noteId: number) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      note.views++;
      return Promise.resolve(note);
    }
    return Promise.resolve(null);
  },
  
  incrementNoteDownloads: (noteId: number) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      note.downloads++;
      return Promise.resolve(note);
    }
    return Promise.resolve(null);
  }
};
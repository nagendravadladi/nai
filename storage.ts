import { 
  users, studyResources, gameScores, musicPlaylists, gymExercises, 
  healthData, entertainmentItems, wishlistItems, financeData, 
  documents, aiTools, shortcuts, performanceData,
  type User, type InsertUser, type StudyResource, type InsertStudyResource,
  type GameScore, type InsertGameScore, type MusicPlaylist, type InsertMusicPlaylist,
  type GymExercise, type InsertGymExercise, type HealthData, type InsertHealthData,
  type EntertainmentItem, type InsertEntertainmentItem, type WishlistItem, type InsertWishlistItem,
  type FinanceData, type InsertFinanceData, type Document, type InsertDocument,
  type AITool, type InsertAITool, type Shortcut, type InsertShortcut,
  type PerformanceData, type InsertPerformanceData 
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;

  // Study resources
  getStudyResources(userId: number): Promise<StudyResource[]>;
  createStudyResource(resource: InsertStudyResource): Promise<StudyResource>;
  deleteStudyResource(id: number): Promise<void>;

  // Game scores
  getGameScores(userId: number): Promise<GameScore[]>;
  createGameScore(score: InsertGameScore): Promise<GameScore>;

  // Music playlists
  getMusicPlaylists(userId: number): Promise<MusicPlaylist[]>;
  createMusicPlaylist(playlist: InsertMusicPlaylist): Promise<MusicPlaylist>;
  deleteMusicPlaylist(id: number): Promise<void>;

  // Gym exercises
  getGymExercises(userId: number): Promise<GymExercise[]>;
  createGymExercise(exercise: InsertGymExercise): Promise<GymExercise>;
  updateGymExercise(id: number, updates: Partial<InsertGymExercise>): Promise<GymExercise>;

  // Health data
  getHealthData(userId: number): Promise<HealthData[]>;
  createHealthData(data: InsertHealthData): Promise<HealthData>;

  // Entertainment items
  getEntertainmentItems(userId: number): Promise<EntertainmentItem[]>;
  createEntertainmentItem(item: InsertEntertainmentItem): Promise<EntertainmentItem>;
  updateEntertainmentItem(id: number, updates: Partial<InsertEntertainmentItem>): Promise<EntertainmentItem>;
  deleteEntertainmentItem(id: number): Promise<void>;

  // Wishlist items
  getWishlistItems(userId: number): Promise<WishlistItem[]>;
  createWishlistItem(item: InsertWishlistItem): Promise<WishlistItem>;
  deleteWishlistItem(id: number): Promise<void>;

  // Finance data
  getFinanceData(userId: number): Promise<FinanceData[]>;
  createFinanceData(data: InsertFinanceData): Promise<FinanceData>;

  // Documents
  getDocuments(userId: number): Promise<Document[]>;
  createDocument(doc: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<void>;

  // AI tools
  getAITools(userId: number): Promise<AITool[]>;
  createAITool(tool: InsertAITool): Promise<AITool>;
  deleteAITool(id: number): Promise<void>;

  // Shortcuts
  getShortcuts(userId: number): Promise<Shortcut[]>;
  createShortcut(shortcut: InsertShortcut): Promise<Shortcut>;
  updateShortcut(id: number, updates: Partial<InsertShortcut>): Promise<Shortcut>;
  deleteShortcut(id: number): Promise<void>;

  // Performance data
  getPerformanceData(userId: number): Promise<PerformanceData[]>;
  createPerformanceData(data: InsertPerformanceData): Promise<PerformanceData>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private studyResources: Map<number, StudyResource> = new Map();
  private gameScores: Map<number, GameScore> = new Map();
  private musicPlaylists: Map<number, MusicPlaylist> = new Map();
  private gymExercises: Map<number, GymExercise> = new Map();
  private healthData: Map<number, HealthData> = new Map();
  private entertainmentItems: Map<number, EntertainmentItem> = new Map();
  private wishlistItems: Map<number, WishlistItem> = new Map();
  private financeData: Map<number, FinanceData> = new Map();
  private documents: Map<number, Document> = new Map();
  private aiTools: Map<number, AITool> = new Map();
  private shortcuts: Map<number, Shortcut> = new Map();
  private performanceData: Map<number, PerformanceData> = new Map();
  
  private currentId = 1;

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      theme: insertUser.theme || "light",
      focusModeEnabled: insertUser.focusModeEnabled || false
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Study resources
  async getStudyResources(userId: number): Promise<StudyResource[]> {
    return Array.from(this.studyResources.values()).filter(r => r.userId === userId);
  }

  async createStudyResource(resource: InsertStudyResource): Promise<StudyResource> {
    const id = this.currentId++;
    const newResource: StudyResource = { 
      ...resource, 
      id, 
      createdAt: new Date() 
    };
    this.studyResources.set(id, newResource);
    return newResource;
  }

  async deleteStudyResource(id: number): Promise<void> {
    this.studyResources.delete(id);
  }

  // Game scores
  async getGameScores(userId: number): Promise<GameScore[]> {
    return Array.from(this.gameScores.values()).filter(s => s.userId === userId);
  }

  async createGameScore(score: InsertGameScore): Promise<GameScore> {
    const id = this.currentId++;
    const newScore: GameScore = { 
      ...score, 
      id, 
      completedAt: new Date() 
    };
    this.gameScores.set(id, newScore);
    return newScore;
  }

  // Music playlists
  async getMusicPlaylists(userId: number): Promise<MusicPlaylist[]> {
    return Array.from(this.musicPlaylists.values()).filter(p => p.userId === userId);
  }

  async createMusicPlaylist(playlist: InsertMusicPlaylist): Promise<MusicPlaylist> {
    const id = this.currentId++;
    const newPlaylist: MusicPlaylist = { 
      ...playlist, 
      id, 
      createdAt: new Date() 
    };
    this.musicPlaylists.set(id, newPlaylist);
    return newPlaylist;
  }

  async deleteMusicPlaylist(id: number): Promise<void> {
    this.musicPlaylists.delete(id);
  }

  // Gym exercises
  async getGymExercises(userId: number): Promise<GymExercise[]> {
    return Array.from(this.gymExercises.values()).filter(e => e.userId === userId);
  }

  async createGymExercise(exercise: InsertGymExercise): Promise<GymExercise> {
    const id = this.currentId++;
    const newExercise: GymExercise = { 
      ...exercise, 
      id, 
      date: new Date() 
    };
    this.gymExercises.set(id, newExercise);
    return newExercise;
  }

  async updateGymExercise(id: number, updates: Partial<InsertGymExercise>): Promise<GymExercise> {
    const exercise = this.gymExercises.get(id);
    if (!exercise) throw new Error("Exercise not found");
    const updatedExercise = { ...exercise, ...updates };
    this.gymExercises.set(id, updatedExercise);
    return updatedExercise;
  }

  // Health data
  async getHealthData(userId: number): Promise<HealthData[]> {
    return Array.from(this.healthData.values()).filter(h => h.userId === userId);
  }

  async createHealthData(data: InsertHealthData): Promise<HealthData> {
    const id = this.currentId++;
    const newData: HealthData = { 
      ...data, 
      id, 
      createdAt: new Date() 
    };
    this.healthData.set(id, newData);
    return newData;
  }

  // Entertainment items
  async getEntertainmentItems(userId: number): Promise<EntertainmentItem[]> {
    return Array.from(this.entertainmentItems.values()).filter(e => e.userId === userId);
  }

  async createEntertainmentItem(item: InsertEntertainmentItem): Promise<EntertainmentItem> {
    const id = this.currentId++;
    const newItem: EntertainmentItem = { 
      ...item, 
      id, 
      createdAt: new Date() 
    };
    this.entertainmentItems.set(id, newItem);
    return newItem;
  }

  async updateEntertainmentItem(id: number, updates: Partial<InsertEntertainmentItem>): Promise<EntertainmentItem> {
    const item = this.entertainmentItems.get(id);
    if (!item) throw new Error("Entertainment item not found");
    const updatedItem = { ...item, ...updates };
    this.entertainmentItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteEntertainmentItem(id: number): Promise<void> {
    this.entertainmentItems.delete(id);
  }

  // Wishlist items
  async getWishlistItems(userId: number): Promise<WishlistItem[]> {
    return Array.from(this.wishlistItems.values()).filter(w => w.userId === userId);
  }

  async createWishlistItem(item: InsertWishlistItem): Promise<WishlistItem> {
    const id = this.currentId++;
    const newItem: WishlistItem = { 
      ...item, 
      id, 
      createdAt: new Date() 
    };
    this.wishlistItems.set(id, newItem);
    return newItem;
  }

  async deleteWishlistItem(id: number): Promise<void> {
    this.wishlistItems.delete(id);
  }

  // Finance data
  async getFinanceData(userId: number): Promise<FinanceData[]> {
    return Array.from(this.financeData.values()).filter(f => f.userId === userId);
  }

  async createFinanceData(data: InsertFinanceData): Promise<FinanceData> {
    const id = this.currentId++;
    const newData: FinanceData = { 
      ...data, 
      id, 
      createdAt: new Date() 
    };
    this.financeData.set(id, newData);
    return newData;
  }

  // Documents
  async getDocuments(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(d => d.userId === userId);
  }

  async createDocument(doc: InsertDocument): Promise<Document> {
    const id = this.currentId++;
    const newDoc: Document = { 
      ...doc, 
      id, 
      createdAt: new Date() 
    };
    this.documents.set(id, newDoc);
    return newDoc;
  }

  async deleteDocument(id: number): Promise<void> {
    this.documents.delete(id);
  }

  // AI tools
  async getAITools(userId: number): Promise<AITool[]> {
    return Array.from(this.aiTools.values()).filter(a => a.userId === userId);
  }

  async createAITool(tool: InsertAITool): Promise<AITool> {
    const id = this.currentId++;
    const newTool: AITool = { 
      ...tool, 
      id, 
      createdAt: new Date() 
    };
    this.aiTools.set(id, newTool);
    return newTool;
  }

  async deleteAITool(id: number): Promise<void> {
    this.aiTools.delete(id);
  }

  // Shortcuts
  async getShortcuts(userId: number): Promise<Shortcut[]> {
    return Array.from(this.shortcuts.values()).filter(s => s.userId === userId);
  }

  async createShortcut(shortcut: InsertShortcut): Promise<Shortcut> {
    const id = this.currentId++;
    const newShortcut: Shortcut = { 
      ...shortcut, 
      id, 
      createdAt: new Date() 
    };
    this.shortcuts.set(id, newShortcut);
    return newShortcut;
  }

  async updateShortcut(id: number, updates: Partial<InsertShortcut>): Promise<Shortcut> {
    const shortcut = this.shortcuts.get(id);
    if (!shortcut) throw new Error("Shortcut not found");
    const updatedShortcut = { ...shortcut, ...updates };
    this.shortcuts.set(id, updatedShortcut);
    return updatedShortcut;
  }

  async deleteShortcut(id: number): Promise<void> {
    this.shortcuts.delete(id);
  }

  // Performance data
  async getPerformanceData(userId: number): Promise<PerformanceData[]> {
    return Array.from(this.performanceData.values()).filter(p => p.userId === userId);
  }

  async createPerformanceData(data: InsertPerformanceData): Promise<PerformanceData> {
    const id = this.currentId++;
    const newData: PerformanceData = { 
      ...data, 
      id, 
      date: new Date() 
    };
    this.performanceData.set(id, newData);
    return newData;
  }
}

export const storage = new MemStorage();

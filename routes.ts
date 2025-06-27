import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, insertStudyResourceSchema, insertGameScoreSchema,
  insertMusicPlaylistSchema, insertGymExerciseSchema, insertHealthDataSchema,
  insertEntertainmentItemSchema, insertWishlistItemSchema, insertFinanceDataSchema,
  insertDocumentSchema, insertAIToolSchema, insertShortcutSchema, insertPerformanceDataSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email } = z.object({ email: z.string().email() }).parse(req.body);
      
      let user = await storage.getUserByEmail(email);
      if (!user) {
        // Create new user with email
        user = await storage.createUser({ 
          email, 
          name: "",
          profilePicture: null,
          dailyQuote: null,
          portfolioLink: null
        });
      }
      
      res.json({ user });
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  // User profile
  app.get("/api/user/:id", async (req, res) => {
    const user = await storage.getUser(parseInt(req.params.id));
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });

  app.patch("/api/user/:id", async (req, res) => {
    try {
      const updates = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(parseInt(req.params.id), updates);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  // Study resources
  app.get("/api/study-resources/:userId", async (req, res) => {
    const resources = await storage.getStudyResources(parseInt(req.params.userId));
    res.json(resources);
  });

  app.post("/api/study-resources", async (req, res) => {
    try {
      const resource = insertStudyResourceSchema.parse(req.body);
      const newResource = await storage.createStudyResource(resource);
      res.json(newResource);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.delete("/api/study-resources/:id", async (req, res) => {
    await storage.deleteStudyResource(parseInt(req.params.id));
    res.json({ success: true });
  });

  // Game scores
  app.get("/api/game-scores/:userId", async (req, res) => {
    const scores = await storage.getGameScores(parseInt(req.params.userId));
    res.json(scores);
  });

  app.post("/api/game-scores", async (req, res) => {
    try {
      const score = insertGameScoreSchema.parse(req.body);
      const newScore = await storage.createGameScore(score);
      res.json(newScore);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  // Music playlists
  app.get("/api/playlists/:userId", async (req, res) => {
    const playlists = await storage.getMusicPlaylists(parseInt(req.params.userId));
    res.json(playlists);
  });

  app.post("/api/playlists", async (req, res) => {
    try {
      const playlist = insertMusicPlaylistSchema.parse(req.body);
      const newPlaylist = await storage.createMusicPlaylist(playlist);
      res.json(newPlaylist);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.delete("/api/playlists/:id", async (req, res) => {
    await storage.deleteMusicPlaylist(parseInt(req.params.id));
    res.json({ success: true });
  });

  // Gym exercises
  app.get("/api/gym-exercises/:userId", async (req, res) => {
    const exercises = await storage.getGymExercises(parseInt(req.params.userId));
    res.json(exercises);
  });

  app.post("/api/gym-exercises", async (req, res) => {
    try {
      const exercise = insertGymExerciseSchema.parse(req.body);
      const newExercise = await storage.createGymExercise(exercise);
      res.json(newExercise);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.patch("/api/gym-exercises/:id", async (req, res) => {
    try {
      const updates = insertGymExerciseSchema.partial().parse(req.body);
      const exercise = await storage.updateGymExercise(parseInt(req.params.id), updates);
      res.json(exercise);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  // Health data
  app.get("/api/health-data/:userId", async (req, res) => {
    const data = await storage.getHealthData(parseInt(req.params.userId));
    res.json(data);
  });

  app.post("/api/health-data", async (req, res) => {
    try {
      const data = insertHealthDataSchema.parse(req.body);
      const newData = await storage.createHealthData(data);
      res.json(newData);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  // Entertainment items
  app.get("/api/entertainment/:userId", async (req, res) => {
    const items = await storage.getEntertainmentItems(parseInt(req.params.userId));
    res.json(items);
  });

  app.post("/api/entertainment", async (req, res) => {
    try {
      const item = insertEntertainmentItemSchema.parse(req.body);
      const newItem = await storage.createEntertainmentItem(item);
      res.json(newItem);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.patch("/api/entertainment/:id", async (req, res) => {
    try {
      const updates = insertEntertainmentItemSchema.partial().parse(req.body);
      const item = await storage.updateEntertainmentItem(parseInt(req.params.id), updates);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.delete("/api/entertainment/:id", async (req, res) => {
    await storage.deleteEntertainmentItem(parseInt(req.params.id));
    res.json({ success: true });
  });

  // Wishlist items
  app.get("/api/wishlist/:userId", async (req, res) => {
    const items = await storage.getWishlistItems(parseInt(req.params.userId));
    res.json(items);
  });

  app.post("/api/wishlist", async (req, res) => {
    try {
      const item = insertWishlistItemSchema.parse(req.body);
      const newItem = await storage.createWishlistItem(item);
      res.json(newItem);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.delete("/api/wishlist/:id", async (req, res) => {
    await storage.deleteWishlistItem(parseInt(req.params.id));
    res.json({ success: true });
  });

  // Finance data
  app.get("/api/finance/:userId", async (req, res) => {
    const data = await storage.getFinanceData(parseInt(req.params.userId));
    res.json(data);
  });

  app.post("/api/finance", async (req, res) => {
    try {
      const data = insertFinanceDataSchema.parse(req.body);
      const newData = await storage.createFinanceData(data);
      res.json(newData);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  // Documents
  app.get("/api/documents/:userId", async (req, res) => {
    const docs = await storage.getDocuments(parseInt(req.params.userId));
    res.json(docs);
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const doc = insertDocumentSchema.parse(req.body);
      const newDoc = await storage.createDocument(doc);
      res.json(newDoc);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    await storage.deleteDocument(parseInt(req.params.id));
    res.json({ success: true });
  });

  // AI tools
  app.get("/api/ai-tools/:userId", async (req, res) => {
    const tools = await storage.getAITools(parseInt(req.params.userId));
    res.json(tools);
  });

  app.post("/api/ai-tools", async (req, res) => {
    try {
      const tool = insertAIToolSchema.parse(req.body);
      const newTool = await storage.createAITool(tool);
      res.json(newTool);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.delete("/api/ai-tools/:id", async (req, res) => {
    await storage.deleteAITool(parseInt(req.params.id));
    res.json({ success: true });
  });

  // Shortcuts
  app.get("/api/shortcuts/:userId", async (req, res) => {
    const shortcuts = await storage.getShortcuts(parseInt(req.params.userId));
    res.json(shortcuts);
  });

  app.post("/api/shortcuts", async (req, res) => {
    try {
      const shortcut = insertShortcutSchema.parse(req.body);
      const newShortcut = await storage.createShortcut(shortcut);
      res.json(newShortcut);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.patch("/api/shortcuts/:id", async (req, res) => {
    try {
      const updates = insertShortcutSchema.partial().parse(req.body);
      const shortcut = await storage.updateShortcut(parseInt(req.params.id), updates);
      res.json(shortcut);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.delete("/api/shortcuts/:id", async (req, res) => {
    await storage.deleteShortcut(parseInt(req.params.id));
    res.json({ success: true });
  });

  // Performance data
  app.get("/api/performance/:userId", async (req, res) => {
    const data = await storage.getPerformanceData(parseInt(req.params.userId));
    res.json(data);
  });

  app.post("/api/performance", async (req, res) => {
    try {
      const data = insertPerformanceDataSchema.parse(req.body);
      const newData = await storage.createPerformanceData(data);
      res.json(newData);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

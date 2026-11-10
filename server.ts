import express from "express";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// Safe directory resolution for ESM (dev) and CJS (prod)
const getDirname = () => {
  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch (e) {
    // Falls back to global __dirname in CommonJS context
    return typeof __dirname !== "undefined" ? __dirname : ".";
  }
};

const CURRENT_DIR = getDirname();
const DATA_FILE_PATH = path.join(process.cwd(), "dorm_data.json");
const STATE_DOC_PATH = "dormitory/state";

// Initialize Firebase
let db: any = null;

try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const firebaseApp = initializeApp({
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId,
    });
    db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId || undefined);
    console.log("Firebase initialized successfully on server. Project ID:", firebaseConfig.projectId);
  } else {
    console.log("firebase-applet-config.json not found, running with local file only.");
  }
} catch (err) {
  console.error("Failed to initialize Firebase:", err);
}

// Load state helper
async function loadState(): Promise<any> {
  // First, try loading from Firestore if available
  if (db) {
    try {
      const [colName, docId] = STATE_DOC_PATH.split("/");
      const docRef = doc(db, colName, docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const state = docSnap.data();
        // Sync to local file as backup
        try {
          fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(state, null, 2), "utf-8");
        } catch (e) {
          console.error("Failed to write local backup file:", e);
        }
        return state;
      } else {
        console.log("No state document found in Firestore. Seeding from local file...");
      }
    } catch (err) {
      console.error("Error reading from Firestore, falling back to local file:", err);
    }
  }

  // Fallback to local file
  if (fs.existsSync(DATA_FILE_PATH)) {
    try {
      const fileContent = fs.readFileSync(DATA_FILE_PATH, "utf-8");
      const state = JSON.parse(fileContent);

      // If Firestore is available but empty, seed it
      if (db && state) {
        try {
          const [colName, docId] = STATE_DOC_PATH.split("/");
          const docRef = doc(db, colName, docId);
          await setDoc(docRef, state);
          console.log("Successfully seeded Firestore with local state.");
        } catch (err) {
          console.error("Failed to seed Firestore during loadState:", err);
        }
      }
      return state;
    } catch (e) {
      console.error("Error parsing local state file:", e);
    }
  }

  return null;
}

// Save state helper
async function saveState(state: any): Promise<void> {
  // Always write locally first
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write local state file:", err);
  }

  // Write to Firestore if available
  if (db) {
    try {
      const [colName, docId] = STATE_DOC_PATH.split("/");
      const docRef = doc(db, colName, docId);
      await setDoc(docRef, state);
    } catch (err) {
      console.error("Failed to save state to Firestore:", err);
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support JSON request bodies
  app.use(express.json({ limit: "50mb" }));

  // API Endpoints
  app.get("/api/dorm-state", async (req, res) => {
    try {
      const state = await loadState();
      if (state) {
        return res.json({ success: true, state });
      }
      return res.json({ success: false, state: null });
    } catch (err) {
      console.error("Error reading state file:", err);
      return res.status(500).json({ success: false, error: "Failed to read state" });
    }
  });

  let writeQueue = Promise.resolve();

  app.post("/api/dorm-state", (req, res) => {
    writeQueue = writeQueue.then(async () => {
      try {
        let currentState = await loadState() || {};

        // Merge new fields into state
        const newState = { ...currentState, ...req.body };
        await saveState(newState);

        res.json({ success: true, state: newState });
      } catch (err) {
        console.error("Error writing state:", err);
        res.status(500).json({ success: false, error: "Failed to write state" });
      }
    });
  });

  // Source code download endpoint
  app.get("/api/download-source-zip", (req, res) => {
    try {
      const zipName = "camp-camp-dormitory-source.zip";
      const zipPath = path.join(process.cwd(), zipName);
      execSync(`python3 scripts/export_zip.py "${zipPath}"`, { timeout: 30000 });

      res.setHeader("Content-Disposition", `attachment; filename="${zipName}"`);
      res.setHeader("Content-Type", "application/zip");
      res.download(zipPath, zipName, (err) => {
        try {
          if (fs.existsSync(zipPath)) {
            fs.unlinkSync(zipPath);
          }
        } catch (cleanupErr) {
          console.error("Cleanup error:", cleanupErr);
        }
      });
    } catch (err) {
      console.error("Failed to generate source zip:", err);
      res.status(500).json({ success: false, error: "Failed to create source zip" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Running in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Running in production mode, serving static build...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});

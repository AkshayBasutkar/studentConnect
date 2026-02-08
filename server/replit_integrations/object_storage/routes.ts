import type { Express } from "express";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { randomUUID } from "crypto";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { pipeline } from "stream/promises";

/**
 * Register object storage routes for file uploads.
 *
 * This provides example routes for the presigned URL upload flow:
 * 1. POST /api/uploads/request-url - Get a presigned URL for uploading
 * 2. The client then uploads directly to the presigned URL
 *
 * IMPORTANT: These are example routes. Customize based on your use case:
 * - Add authentication middleware for protected uploads
 * - Add file metadata storage (save to database after upload)
 * - Add ACL policies for access control
 */
export function registerObjectStorageRoutes(app: Express): void {
  const objectStorageService = new ObjectStorageService();
  const localUploadDir = path.join(process.cwd(), "uploads");

  async function ensureLocalUploadDir() {
    await fsp.mkdir(localUploadDir, { recursive: true });
  }

  function buildLocalUploadUrl(req: any, id: string) {
    const host = req.get("host");
    const protocol = req.protocol;
    return `${protocol}://${host}/api/uploads/local/${id}`;
  }

  /**
   * Request a presigned URL for file upload.
   *
   * Request body (JSON):
   * {
   *   "name": "filename.jpg",
   *   "size": 12345,
   *   "contentType": "image/jpeg"
   * }
   *
   * Response:
   * {
   *   "uploadURL": "https://storage.googleapis.com/...",
   *   "objectPath": "/objects/uploads/uuid"
   * }
   *
   * IMPORTANT: The client should NOT send the file to this endpoint.
   * Send JSON metadata only, then upload the file directly to uploadURL.
   */
  app.post("/api/uploads/request-url", async (req, res) => {
    try {
      const { name, size, contentType } = req.body;

      if (!name) {
        return res.status(400).json({
          error: "Missing required field: name",
        });
      }

      let uploadURL: string;
      let objectPath: string;

      try {
        uploadURL = await objectStorageService.getObjectEntityUploadURL();
        // Extract object path from the presigned URL for later reference
        objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);
      } catch (error) {
        // Fallback to local uploads when object storage is not configured
        await ensureLocalUploadDir();
        const id = randomUUID();
        uploadURL = buildLocalUploadUrl(req, id);
        objectPath = `/api/uploads/local/${id}`;
      }

      res.json({
        uploadURL,
        objectPath,
        // Echo back the metadata for client convenience
        metadata: { name, size, contentType },
      });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  /**
   * Serve uploaded objects.
   *
   * GET /objects/:objectPath(*)
   *
   * This serves files from object storage. For public files, no auth needed.
   * For protected files, add authentication middleware and ACL checks.
   */
  app.get(/^\/objects\/(.*)/, async (req, res) => {
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      await objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ error: "Object not found" });
      }
      return res.status(500).json({ error: "Failed to serve object" });
    }
  });

  // Local upload fallback (development)
  app.put("/api/uploads/local/:id", async (req, res) => {
    try {
      await ensureLocalUploadDir();
      const id = req.params.id;
      const filePath = path.join(localUploadDir, id);
      const metaPath = `${filePath}.meta.json`;

      await pipeline(req, fs.createWriteStream(filePath));

      const meta = {
        contentType: req.headers["content-type"] || "application/octet-stream",
      };
      await fsp.writeFile(metaPath, JSON.stringify(meta), "utf-8");

      res.status(200).json({ ok: true });
    } catch (error) {
      console.error("Error saving local upload:", error);
      res.status(500).json({ error: "Failed to save upload" });
    }
  });

  app.get("/api/uploads/local/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const filePath = path.join(localUploadDir, id);
      const metaPath = `${filePath}.meta.json`;

      const exists = await fsp
        .stat(filePath)
        .then(() => true)
        .catch(() => false);
      if (!exists) {
        return res.status(404).json({ error: "File not found" });
      }

      const meta = await fsp
        .readFile(metaPath, "utf-8")
        .then((text) => JSON.parse(text))
        .catch(() => ({}));

      res.setHeader(
        "Content-Type",
        meta.contentType || "application/octet-stream"
      );
      res.sendFile(filePath);
    } catch (error) {
      console.error("Error serving local upload:", error);
      res.status(500).json({ error: "Failed to serve upload" });
    }
  });
}

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface SharedFile {
  code: string;
  originalName: string;
  mimeType: string;
  size: number;
  filePath?: string;
  buffer?: Buffer;
  createdAt: number;
  expiresAt: number;
  downloadsCount: number;
  maxDownloads: number;
  isP2POnly: boolean;
  senderSocketId?: string;
}

class StorageManager {
  private files: Map<string, SharedFile> = new Map();
  private uploadDir: string;
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.uploadDir = path.resolve(__dirname, '../uploads_temp');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    // Run cleanup every 30 seconds
    this.cleanupInterval = setInterval(() => this.purgeExpiredFiles(), 30000);
  }

  // Generate unique 6-character uppercase alphanumeric code (avoiding confusing chars like 0, O, 1, I)
  public generateCode(): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.files.has(code));
    return code;
  }

  public addFile(fileData: Omit<SharedFile, 'code' | 'createdAt' | 'downloadsCount'>): SharedFile {
    const code = this.generateCode();
    const sharedFile: SharedFile = {
      ...fileData,
      code,
      createdAt: Date.now(),
      downloadsCount: 0,
    };

    this.files.set(code, sharedFile);
    return sharedFile;
  }

  public registerP2PRoom(code: string, meta: { originalName: string; mimeType: string; size: number; socketId: string }): SharedFile {
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins for live session
    const sharedFile: SharedFile = {
      code,
      originalName: meta.originalName,
      mimeType: meta.mimeType,
      size: meta.size,
      createdAt: Date.now(),
      expiresAt,
      downloadsCount: 0,
      maxDownloads: 10,
      isP2POnly: true,
      senderSocketId: meta.socketId
    };
    this.files.set(code, sharedFile);
    return sharedFile;
  }

  public getFile(code: string): SharedFile | undefined {
    const file = this.files.get(code.toUpperCase());
    if (!file) return undefined;

    if (Date.now() > file.expiresAt) {
      this.deleteFile(code);
      return undefined;
    }

    return file;
  }

  public incrementDownload(code: string): void {
    const file = this.getFile(code);
    if (file) {
      file.downloadsCount += 1;
      if (file.maxDownloads && file.downloadsCount >= file.maxDownloads) {
        setTimeout(() => this.deleteFile(code), 2000);
      }
    }
  }

  public deleteFile(code: string): boolean {
    const file = this.files.get(code.toUpperCase());
    if (file) {
      if (file.filePath && fs.existsSync(file.filePath)) {
        try {
          fs.unlinkSync(file.filePath);
        } catch (e) {
          console.error(`Failed to delete temp file at ${file.filePath}:`, e);
        }
      }
      this.files.delete(code.toUpperCase());
      return true;
    }
    return false;
  }

  private purgeExpiredFiles(): void {
    const now = Date.now();
    for (const [code, file] of this.files.entries()) {
      if (now > file.expiresAt) {
        console.log(`Auto-expiring file code [${code}] (${file.originalName})`);
        this.deleteFile(code);
      }
    }
  }
}

export const storageManager = new StorageManager();

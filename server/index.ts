import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { storageManager } from './storageManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup multer temporary storage
const uploadDir = path.resolve(__dirname, '../uploads_temp');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_'));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 250 * 1024 * 1024 } // 250MB temp file limit
});

// Serve frontend static assets in production if built
const publicPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
}

// Get primary local network IP address
function getLocalNetworkIp(): string {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    if (!iface) continue;
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && !alias.internal && alias.address !== '127.0.0.1') {
        return alias.address;
      }
    }
  }
  return '127.0.0.1';
}

// REST APIs
// Network Info API for dynamic host resolution
app.get('/api/network-info', (req, res) => {
  const localIp = getLocalNetworkIp();
  const host = req.get('host') || `${localIp}:4000`;
  const protocol = req.protocol || 'http';

  res.json({
    localIp,
    host,
    protocol,
    baseUrl: `${protocol}://${localIp}:3000`
  });
});

// 1. Upload API
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const ttlMinutes = parseInt(req.body.ttlMinutes || '10', 10);
    const expiresAt = Date.now() + ttlMinutes * 60 * 1000;

    const sharedFile = storageManager.addFile({
      originalName: req.file.originalname,
      mimeType: req.file.mimetype || 'application/octet-stream',
      size: req.file.size,
      filePath: req.file.path,
      expiresAt,
      maxDownloads: parseInt(req.body.maxDownloads || '10', 10),
      isP2POnly: false
    });

    console.log(`[Upload] File registered [${sharedFile.code}] (${sharedFile.originalName}, ${sharedFile.size} bytes, TTL: ${ttlMinutes}m)`);

    res.json({
      success: true,
      code: sharedFile.code,
      fileName: sharedFile.originalName,
      fileSize: sharedFile.size,
      mimeType: sharedFile.mimeType,
      expiresAt: sharedFile.expiresAt
    });
  } catch (error: any) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// 2. Register P2P Transfer Room Code API
app.post('/api/register-p2p', (req, res) => {
  const { originalName, mimeType, size, socketId, customCode } = req.body;
  if (!originalName || !size || !socketId) {
    return res.status(400).json({ error: 'Missing required file details' });
  }

  const code = customCode ? customCode.toUpperCase() : storageManager.generateCode();
  const file = storageManager.registerP2PRoom(code, {
    originalName,
    mimeType: mimeType || 'application/octet-stream',
    size,
    socketId
  });

  res.json({
    success: true,
    code: file.code,
    expiresAt: file.expiresAt
  });
});

// 3. Get File Metadata by Code
app.get('/api/file/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const file = storageManager.getFile(code);

  if (!file) {
    return res.status(404).json({ error: 'File not found or expired' });
  }

  res.json({
    code: file.code,
    fileName: file.originalName,
    mimeType: file.mimeType,
    size: file.size,
    expiresAt: file.expiresAt,
    isP2POnly: file.isP2POnly,
    senderSocketId: file.senderSocketId
  });
});

// 4. Download / Stream Endpoint
app.get('/api/download/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const file = storageManager.getFile(code);

  if (!file || !file.filePath) {
    return res.status(404).send('File not found or expired.');
  }

  if (!fs.existsSync(file.filePath)) {
    storageManager.deleteFile(code);
    return res.status(404).send('File storage missing.');
  }

  storageManager.incrementDownload(code);

  const isInline = req.query.inline === 'true';
  const disposition = isInline ? 'inline' : `attachment; filename="${encodeURIComponent(file.originalName)}"`;

  res.setHeader('Content-Type', file.mimeType);
  res.setHeader('Content-Length', file.size.toString());
  res.setHeader('Content-Disposition', disposition);
  res.setHeader('Cache-Control', 'no-cache');

  const stream = fs.createReadStream(file.filePath);
  stream.pipe(res);
});

// Socket.IO WebRTC & Real-time Room Signaling
io.on('connection', (socket) => {
  console.log(`[Socket] Peer connected: ${socket.id}`);

  socket.on('join-room', (data: { code: string; role: 'sender' | 'receiver' }) => {
    const code = data.code.toUpperCase();
    socket.join(code);
    console.log(`[Socket] ${socket.id} (${data.role}) joined room [${code}]`);

    socket.to(code).emit('peer-joined', { socketId: socket.id, role: data.role });
  });

  socket.on('signal', (data: { room: string; targetSocketId?: string; signal: any }) => {
    const room = data.room.toUpperCase();
    if (data.targetSocketId) {
      io.to(data.targetSocketId).emit('signal', { senderSocketId: socket.id, signal: data.signal });
    } else {
      socket.to(room).emit('signal', { senderSocketId: socket.id, signal: data.signal });
    }
  });

  socket.on('transfer-progress', (data: { room: string; progress: number; speed?: string }) => {
    socket.to(data.room.toUpperCase()).emit('transfer-progress', data);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Peer disconnected: ${socket.id}`);
  });
});

// Fallback to React index.html for SPA routes in production
app.get('*', (req, res) => {
  const indexPath = path.resolve(publicPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('DropX Backend Server running.');
  }
});

const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  const localIp = getLocalNetworkIp();
  console.log(`🚀 DropX Server running on http://${HOST}:${PORT}`);
  console.log(`📡 Local Network Access IP: http://${localIp}:${PORT}`);
});

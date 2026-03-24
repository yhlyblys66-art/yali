/**
 * @moltstream/avatar
 * Live2D Avatar renderer with lip sync
 *
 * Architecture:
 * - Runs an Electron or headless browser window with Live2D model
 * - Receives audio events and extracts amplitude for lip sync
 * - Exposes the rendered window as a virtual camera / window capture for OBS
 *
 * For MVP: serves an HTML page with Live2D that OBS captures via Browser Source
 */

import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

export interface AvatarConfig {
  /** Port for the avatar HTTP server */
  port?: number;
  /** Path to Live2D model directory */
  modelPath?: string;
  /** Background color (hex) */
  backgroundColor?: string;
  /** Avatar scale */
  scale?: number;
}

export class MoltAvatar {
  private config: Required<AvatarConfig>;
  private httpServer: ReturnType<typeof createServer> | null = null;
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();

  constructor(config: AvatarConfig = {}) {
    this.config = {
      port: config.port ?? 3939,
      modelPath: config.modelPath ?? '',
      backgroundColor: config.backgroundColor ?? '#00FF00', // green screen
      scale: config.scale ?? 1.0,
    };
  }

  /** Start the avatar server (OBS Browser Source) */
  async start(): Promise<void> {
    this.httpServer = createServer(async (req, res) => {
      if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(this.generateAvatarHTML());
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    this.wss = new WebSocketServer({ server: this.httpServer });

    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.add(ws);
      console.log(`  🎭 Avatar client connected (${this.clients.size} total)`);

      ws.on('close', () => {
        this.clients.delete(ws);
      });
    });

    return new Promise((resolve) => {
      this.httpServer!.listen(this.config.port, () => {
        console.log(`\n  🎭 Avatar server running on http://localhost:${this.config.port}`);
        console.log(`  Add as OBS Browser Source: http://localhost:${this.config.port}\n`);
        resolve();
      });
    });
  }

  /** Stop the avatar server */
  stop(): void {
    for (const ws of this.clients) ws.close();
    this.clients.clear();
    this.wss?.close();
    this.httpServer?.close();
  }

  /** Send lip sync data (mouth open amount 0-1) */
  setMouthOpen(value: number): void {
    const msg = JSON.stringify({ type: 'mouth', value: Math.max(0, Math.min(1, value)) });
    for (const ws of this.clients) {
      if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    }
  }

  /** Send expression change */
  setExpression(expression: string): void {
    const msg = JSON.stringify({ type: 'expression', value: expression });
    for (const ws of this.clients) {
      if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    }
  }

  /** Send chat message to overlay */
  showChat(username: string, message: string): void {
    const msg = JSON.stringify({ type: 'chat', username, message });
    for (const ws of this.clients) {
      if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    }
  }

  /** Send bot response to overlay */
  showResponse(text: string): void {
    const msg = JSON.stringify({ type: 'response', text });
    for (const ws of this.clients) {
      if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    }
  }

  /** Send TTS audio (base64 encoded) to browser for playback */
  playAudio(audioBase64: string, mimeType: string = 'audio/mp3'): void {
    const msg = JSON.stringify({ type: 'audio', data: audioBase64, mime: mimeType });
    for (const ws of this.clients) {
      if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    }
  }

  /** Trigger speaking animation (auto lip sync from duration) */
  async speak(durationMs: number): Promise<void> {
    const fps = 30;
    const frames = Math.ceil((durationMs / 1000) * fps);

    for (let i = 0; i < frames; i++) {
      // Simulate natural mouth movement
      const t = i / frames;
      const base = Math.sin(t * Math.PI); // overall envelope
      const detail = Math.sin(i * 0.8) * 0.3 + Math.sin(i * 1.3) * 0.2; // mouth variation
      const mouth = Math.max(0, Math.min(1, base * 0.6 + detail * base));

      this.setMouthOpen(mouth);
      await sleep(1000 / fps);
    }

    this.setMouthOpen(0);
  }

  // --- Private ---

  private generateAvatarHTML(): string {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>MoltStream Avatar</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: #0a0a0a;
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    color: white;
  }

  /* --- Layout --- */
  .stream-layout {
    display: grid;
    grid-template-columns: 1fr 360px;
    grid-template-rows: 1fr auto;
    height: 100vh;
    gap: 0;
  }

  /* --- Avatar area (left) --- */
  .avatar-area {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background: radial-gradient(circle at 50% 40%, #1a1040 0%, #0a0a0a 70%);
  }
  #avatar {
    width: 300px;
    height: 450px;
    position: relative;
  }
  .avatar-body {
    width: 100%;
    height: 100%;
    background: radial-gradient(ellipse at 50% 30%, #6366f1 0%, #4338ca 100%);
    border-radius: 50% 50% 45% 45%;
    position: relative;
    animation: idle 3s ease-in-out infinite;
    box-shadow: 0 0 60px rgba(99, 102, 241, 0.3);
  }
  .eyes {
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 40px;
  }
  .eye {
    width: 24px;
    height: 24px;
    background: white;
    border-radius: 50%;
    position: relative;
    animation: blink 4s ease-in-out infinite;
  }
  .eye::after {
    content: '';
    width: 12px;
    height: 12px;
    background: #1e1b4b;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .mouth {
    position: absolute;
    top: 55%;
    left: 50%;
    transform: translateX(-50%);
    width: 30px;
    height: 4px;
    background: #1e1b4b;
    border-radius: 10px;
    transition: height 0.05s ease, width 0.05s ease, border-radius 0.05s ease;
  }
  .mouth.open {
    height: 20px;
    width: 25px;
    border-radius: 50%;
  }
  @keyframes idle {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  @keyframes blink {
    0%, 45%, 55%, 100% { transform: scaleY(1); }
    50% { transform: scaleY(0.1); }
  }

  /* --- Response bubble (below avatar) --- */
  .response-area {
    grid-column: 1;
    padding: 16px 24px;
    min-height: 80px;
    max-height: 120px;
    display: flex;
    align-items: center;
    background: linear-gradient(180deg, transparent 0%, rgba(99, 102, 241, 0.1) 100%);
    border-top: 1px solid rgba(99, 102, 241, 0.2);
  }
  .response-bubble {
    background: rgba(99, 102, 241, 0.15);
    border: 1px solid rgba(99, 102, 241, 0.3);
    border-radius: 12px;
    padding: 12px 18px;
    font-size: 16px;
    line-height: 1.4;
    color: #e0e7ff;
    width: 100%;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.3s, transform 0.3s;
    max-height: 90px;
    overflow: hidden;
  }
  .response-bubble.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .response-bubble .label {
    font-size: 11px;
    font-weight: 700;
    color: #818cf8;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 4px;
  }

  /* --- Chat panel (right) --- */
  .chat-panel {
    grid-row: 1 / 3;
    grid-column: 2;
    background: rgba(15, 15, 20, 0.95);
    border-left: 1px solid rgba(255,255,255,0.08);
    display: flex;
    flex-direction: column;
  }
  .chat-header {
    padding: 14px 18px;
    font-size: 13px;
    font-weight: 700;
    color: rgba(255,255,255,0.5);
    text-transform: uppercase;
    letter-spacing: 2px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .chat-messages::-webkit-scrollbar { width: 4px; }
  .chat-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

  .chat-msg {
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.3;
    animation: chatIn 0.3s ease-out;
    background: rgba(255,255,255,0.04);
  }
  .chat-msg .user {
    font-weight: 700;
    margin-right: 6px;
  }
  .chat-msg.viewer .user { color: #22c55e; }
  .chat-msg.bot {
    background: rgba(99, 102, 241, 0.12);
    border-left: 3px solid #6366f1;
  }
  .chat-msg.bot .user { color: #818cf8; }
  .chat-msg .text { color: rgba(255,255,255,0.85); }

  @keyframes chatIn {
    from { opacity: 0; transform: translateX(10px); }
    to { opacity: 1; transform: translateX(0); }
  }

  /* --- LIVE badge --- */
  .live-badge {
    position: fixed;
    top: 16px;
    left: 16px;
    background: #ef4444;
    color: white;
    font-size: 12px;
    font-weight: 800;
    padding: 4px 12px;
    border-radius: 4px;
    letter-spacing: 2px;
    animation: livePulse 2s ease-in-out infinite;
    z-index: 100;
  }
  @keyframes livePulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  /* --- Agent name --- */
  .agent-name {
    position: absolute;
    bottom: -40px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 18px;
    font-weight: 700;
    color: rgba(255,255,255,0.7);
    letter-spacing: 3px;
    text-transform: uppercase;
  }
</style>
</head>
<body>
  <div class="live-badge">● LIVE</div>

  <div class="stream-layout">
    <div class="avatar-area">
      <div id="avatar">
        <div class="avatar-body">
          <div class="eyes">
            <div class="eye"></div>
            <div class="eye"></div>
          </div>
          <div class="mouth" id="mouth"></div>
        </div>
        <div class="agent-name">MoltBot</div>
      </div>
    </div>

    <div class="response-area">
      <div class="response-bubble" id="response">
        <div class="label">🤖 MoltBot</div>
        <div class="response-text" id="responseText"></div>
      </div>
    </div>

    <div class="chat-panel">
      <div class="chat-header">💬 Live Chat</div>
      <div class="chat-messages" id="chatMessages"></div>
    </div>
  </div>

  <script>
    const mouth = document.getElementById('mouth');
    const chatMessages = document.getElementById('chatMessages');
    const responseBubble = document.getElementById('response');
    const responseText = document.getElementById('responseText');
    let ws;
    let responseTimeout;

    function addChatMessage(username, message, isBot) {
      const el = document.createElement('div');
      el.className = 'chat-msg ' + (isBot ? 'bot' : 'viewer');
      el.innerHTML = '<span class="user">' + escapeHtml(username) + '</span><span class="text">' + escapeHtml(message) + '</span>';
      chatMessages.appendChild(el);
      // Keep max 50 messages
      while (chatMessages.children.length > 50) chatMessages.removeChild(chatMessages.firstChild);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showResponse(text) {
      responseText.textContent = text;
      responseBubble.classList.add('visible');
      clearTimeout(responseTimeout);
      responseTimeout = setTimeout(() => {
        responseBubble.classList.remove('visible');
      }, 15000);
    }

    function escapeHtml(s) {
      return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    function connect() {
      ws = new WebSocket('ws://' + location.host);

      ws.onopen = () => {};

      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);

        if (data.type === 'mouth') {
          const v = data.value;
          if (v > 0.1) {
            mouth.classList.add('open');
            mouth.style.height = (4 + v * 20) + 'px';
            mouth.style.width = (20 + v * 10) + 'px';
          } else {
            mouth.classList.remove('open');
            mouth.style.height = '4px';
            mouth.style.width = '30px';
          }
        }

        if (data.type === 'chat') {
          addChatMessage(data.username, data.message, false);
        }

        if (data.type === 'response') {
          addChatMessage('MoltBot', data.text, true);
          showResponse(data.text);
        }

        if (data.type === 'audio') {
          const audio = new Audio('data:' + data.mime + ';base64,' + data.data);
          audio.play().catch(() => {});
        }
      };

      ws.onclose = () => {
        setTimeout(connect, 2000);
      };
    }

    connect();
  </script>
</body>
</html>`;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default MoltAvatar;

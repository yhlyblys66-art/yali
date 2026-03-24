/**
 * @moltstream/tts
 * Text-to-Speech with multiple provider support
 *
 * Providers:
 * - Fish Audio (free tier, high quality)
 * - ElevenLabs (free tier, 10K chars/mo)
 * - OpenAI TTS (pay-per-use, simplest)
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { EventEmitter } from 'events';

export interface TTSConfig {
  provider: 'fish' | 'elevenlabs' | 'openai';
  apiKey: string;
  /** Voice/model ID */
  voice?: string;
  /** Output directory for audio files */
  outputDir?: string;
  /** Audio format */
  format?: 'mp3' | 'wav' | 'opus';
}

export interface TTSResult {
  /** Path to the generated audio file */
  filePath: string;
  /** Audio duration estimate in seconds */
  durationEstimate: number;
  /** Text that was spoken */
  text: string;
}

export class MoltTTS extends EventEmitter {
  private config: Required<TTSConfig>;

  constructor(config: TTSConfig) {
    super();
    this.config = {
      provider: config.provider,
      apiKey: config.apiKey,
      voice: config.voice ?? this.defaultVoice(config.provider),
      outputDir: config.outputDir ?? '/tmp/moltstream-audio',
      format: config.format ?? 'mp3',
    };
  }

  /** Generate speech from text */
  async speak(text: string): Promise<TTSResult> {
    await mkdir(this.config.outputDir, { recursive: true });
    const filename = `tts-${Date.now()}.${this.config.format}`;
    const filePath = join(this.config.outputDir, filename);

    this.emit('generating', { text, provider: this.config.provider });

    let audioBuffer: Buffer;

    switch (this.config.provider) {
      case 'fish':
        audioBuffer = await this.fishAudioTTS(text);
        break;
      case 'elevenlabs':
        audioBuffer = await this.elevenLabsTTS(text);
        break;
      case 'openai':
        audioBuffer = await this.openaiTTS(text);
        break;
      default:
        throw new Error(`Unknown TTS provider: ${this.config.provider}`);
    }

    await writeFile(filePath, audioBuffer);

    // Rough duration estimate: ~150 words per minute, avg 5 chars per word
    const wordCount = text.split(/\s+/).length;
    const durationEstimate = (wordCount / 150) * 60;

    const result: TTSResult = { filePath, durationEstimate, text };
    this.emit('generated', result);
    return result;
  }

  /** Stream TTS audio chunks (for low-latency playback) */
  async *speakStream(text: string): AsyncGenerator<Buffer> {
    // For now, generate full audio and yield as single chunk
    // TODO: implement true streaming for each provider
    const { fetch } = await import('undici');

    if (this.config.provider === 'fish') {
      const res = await fetch('https://api.fish.audio/v1/tts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'model': 's2-pro',
        },
        body: JSON.stringify({
          text,
          reference_id: this.config.voice,
          format: this.config.format,
          streaming: true,
        }),
      });

      if (!res.ok) throw new Error(`Fish Audio TTS error: ${res.status}`);
      if (!res.body) throw new Error('No response body');

      for await (const chunk of res.body) {
        yield Buffer.from(chunk);
      }
    } else {
      // Fallback: generate full file then yield
      const result = await this.speak(text);
      const { readFile } = await import('fs/promises');
      yield await readFile(result.filePath);
    }
  }

  // --- Provider implementations ---

  private async fishAudioTTS(text: string): Promise<Buffer> {
    const { fetch } = await import('undici');
    const res = await fetch('https://api.fish.audio/v1/tts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'model': 's2-pro',
      },
      body: JSON.stringify({
        text,
        reference_id: this.config.voice,
        format: this.config.format,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Fish Audio TTS error ${res.status}: ${err}`);
    }

    return Buffer.from(await res.arrayBuffer());
  }

  private async elevenLabsTTS(text: string): Promise<Buffer> {
    const { fetch } = await import('undici');
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${this.config.voice}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': this.config.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`ElevenLabs TTS error ${res.status}: ${err}`);
    }

    return Buffer.from(await res.arrayBuffer());
  }

  private async openaiTTS(text: string): Promise<Buffer> {
    const { fetch } = await import('undici');
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: this.config.voice,
        input: text,
        response_format: this.config.format,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI TTS error ${res.status}: ${err}`);
    }

    return Buffer.from(await res.arrayBuffer());
  }

  private defaultVoice(provider: string): string {
    switch (provider) {
      case 'fish': return '7f92f8afb8ec43bf81429cc1c9199cb1'; // Default Fish Audio voice
      case 'elevenlabs': return 'EXAVITQu4vr4xnSDxMaL'; // Sarah
      case 'openai': return 'nova';
      default: return '';
    }
  }
}

export default MoltTTS;

import { Readable } from 'stream';

export abstract class StorageService {
  abstract saveStream(key: string, stream: Readable): Promise<{ url: string }>;
  abstract saveBuffer(key: string, buffer: Buffer): Promise<{ url: string }>;
  abstract saveText(key: string, text: string): Promise<{ url: string }>;
  abstract removeFile(key: string): Promise<void>;
}

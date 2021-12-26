import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { promisify } from 'util';
import { LOCAL_TEMPORARY_FILES_PATH } from '../local-temporary-files/local-temporary-files-path';
import { StorageService } from './storage.service';

const writeFile = promisify(fs.writeFile);
const removeFile = promisify(fs.rm);

export class DevStorageService implements StorageService {
  async saveStream(key: string, stream: Readable) {
    const fsKey = key.split('/').join('_');

    const fsStream = fs.createWriteStream(
      path.resolve(LOCAL_TEMPORARY_FILES_PATH, 'storage', fsKey),
    );

    await new Promise((resolve, reject) => {
      stream.pipe(fsStream);
      fsStream.on('error', reject);
      fsStream.on('finish', resolve);
    });

    return {
      url: `http://localhost:3000/tmp/storage/${fsKey}`,
    };
  }

  async saveBuffer(key: string, buffer: Buffer) {
    const fsKey = key.split('/').join('_');

    await writeFile(
      path.resolve(LOCAL_TEMPORARY_FILES_PATH, 'storage', fsKey),
      buffer,
    );

    return {
      url: `http://localhost:3000/tmp/storage/${fsKey}`,
    };
  }

  async saveText(key: string, text: string): Promise<{ url: string }> {
    const fsKey = key.split('/').join('_');
    const filePath = path.resolve(LOCAL_TEMPORARY_FILES_PATH, 'storage', fsKey);

    await writeFile(filePath, text);

    return {
      url: `http://localhost:3000/tmp/storage/${fsKey}`,
    };
  }

  async removeFile(key: string): Promise<void> {
    const fsKey = key.split('/').join('_');
    const filePath = path.resolve(LOCAL_TEMPORARY_FILES_PATH, 'storage', fsKey);

    await removeFile(filePath);
  }
}

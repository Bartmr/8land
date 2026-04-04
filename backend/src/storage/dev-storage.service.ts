import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { promisify } from 'util';
import { LOCAL_TEMPORARY_FILES_PATH } from '../temporary-files/temporary-files';
import { StorageService } from './storage.service';
import { EnvironmentVariables } from 'src/environment/environment-variables';

const writeFile = promisify(fs.writeFile);
const removeFile = promisify(fs.rm);

const mkdir = promisify(fs.mkdir);

export class DevStorageService implements StorageService {
  async createDirectory(key: string) {
    const directoryFragments = key.split('/');
    directoryFragments.pop();

    await mkdir(
      path.join(LOCAL_TEMPORARY_FILES_PATH, 'storage', ...directoryFragments),
      {
        recursive: true,
      },
    );
  }
  async saveStream(key: string, stream: Readable) {
    await this.createDirectory(key);

    const fsStream = fs.createWriteStream(
      path.resolve(LOCAL_TEMPORARY_FILES_PATH, 'storage', key),
    );

    await new Promise<void>((resolve, reject) => {
      stream.pipe(fsStream);
      fsStream.on('error', reject);
      fsStream.on('finish', () => resolve());
    });
  }

  async saveBuffer(key: string, buffer: Buffer) {
    await this.createDirectory(key);

    const data = new Uint8Array(buffer)

    await writeFile(
      path.resolve(LOCAL_TEMPORARY_FILES_PATH, 'storage', key),
      data,
    );
  }

  async saveText(key: string, text: string) {
    await this.createDirectory(key);

    const filePath = path.resolve(LOCAL_TEMPORARY_FILES_PATH, 'storage', key);

    await writeFile(filePath, text);
  }

  async removeFile(key: string): Promise<void> {
    const filePath = path.resolve(LOCAL_TEMPORARY_FILES_PATH, 'storage', key);

    await removeFile(filePath);
  }

  getHostUrl() {
    return `http://localhost:${EnvironmentVariables.API_PORT}/tmp/storage`;
  }
}

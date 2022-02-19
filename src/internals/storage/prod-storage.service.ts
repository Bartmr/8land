import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Readable } from 'typeorm/platform/PlatformTools';
import { EnvironmentVariablesService } from '../environment/environment-variables.service';
import { throwError } from '../utils/throw-error';
import { StorageService } from './storage.service';

export class ProdStorageService extends StorageService {
  constructor(private s3Client: S3Client) {
    super();
  }

  private parseKey(key: string) {
    if (!key) {
      throw new Error();
    }

    if (key.endsWith('/')) {
      throw new Error();
    }

    const split = key.split('/');
    const filename = split.pop();
    const path = split.join('/');

    if (!filename) {
      throw new Error();
    }

    if (filename.indexOf('/') !== -1) {
      throw new Error();
    }

    return {
      path,
      filename,
    };
  }

  async saveAnything(
    key: string,
    stream: Readable | Buffer | string,
  ): Promise<void> {
    const parsedKey = this.parseKey(key);

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: `${
          EnvironmentVariablesService.variables.S3_BUCKET_NAME || throwError()
        }`,
        Key: `${parsedKey.path}/${parsedKey.filename}`,
        Body: stream,
        ACL: 'public-read',
      }),
    );
  }

  async saveStream(key: string, stream: Readable): Promise<void> {
    return this.saveAnything(key, stream);
  }
  saveBuffer(key: string, buffer: Buffer): Promise<void> {
    return this.saveAnything(key, buffer);
  }
  saveText(key: string, text: string): Promise<void> {
    return this.saveAnything(key, text);
  }
  async removeFile(key: string): Promise<void> {
    const parsedKey = this.parseKey(key);

    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: `${
          EnvironmentVariablesService.variables.S3_BUCKET_NAME || throwError()
        }`,
        Key: `${parsedKey.path}/${parsedKey.filename}`,
      }),
    );
  }

  getHostUrl(): string {
    return `https://${
      EnvironmentVariablesService.variables.S3_BUCKET_NAME || throwError()
    }.${EnvironmentVariablesService.variables.AWS_ENDPOINT || throwError()}`;
  }
}

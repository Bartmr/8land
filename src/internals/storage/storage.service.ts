export abstract class StorageService {
  abstract saveFile(path: string, file: unknown): { url: string };
}

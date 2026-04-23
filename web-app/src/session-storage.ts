import z from "zod";

class SessionStorage {
  getItem<S extends z.ZodType<unknown>>(schema: S, key: string): z.infer<S> {
    const data = window.sessionStorage.getItem(key);

    const validationResult = schema.parse(
      data ? JSON.parse(data) : undefined,
    );

    return validationResult
  }

  setItem(key: string, value: unknown): void {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  }

  wipeAll(): void {
    window.sessionStorage.clear();
  }
}

export function useSessionStorage() {
  return new SessionStorage();
}

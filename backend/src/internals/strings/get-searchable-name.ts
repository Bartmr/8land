export function getSearchableName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

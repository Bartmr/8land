export type AppContext = {
  url: string;
  user: { appId: string } | undefined;
  land: { id: string; name: string };
  territory?: { id: string } | undefined;
};

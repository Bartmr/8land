export enum ProcessType {
  WebServer = 'web-server',
  Job = 'job',
  Script = 'script',
  Testing = 'testing',
}

export class ProcessContext {
  id: string;
  isMasterWorker: boolean;

  constructor(params: { type: ProcessType; name: string; workerId: string }) {
    this.id = `${params.type}:${params.name}:${params.workerId}`;

    this.isMasterWorker = true;
  }
}

import { ConnectionManager } from 'typeorm';
import { AuthTokensRepository } from './auth-token.repository';
import { AppDataSourceOptions } from 'src/database/data-source';

export async function cleanExpiredAuthTokens() {
  const connectionManager = new ConnectionManager();

  const connection = connectionManager.create(AppDataSourceOptions);

  await connection.connect();

  const tokensRepository = connection.getCustomRepository(AuthTokensRepository);

  await tokensRepository.deleteExpired();

  await connection.close();
}

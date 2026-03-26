import { ConnectionManager } from 'typeorm';
import { AuthTokensRepository } from './auth-token.repository';
import { TYPEORM_ORMCONFIG } from 'src/databases/ormconfig';

export async function cleanExpiredAuthTokens() {
  const connectionManager = new ConnectionManager();

  const connection = connectionManager.create(TYPEORM_ORMCONFIG);

  await connection.connect();

  const tokensRepository = connection.getCustomRepository(AuthTokensRepository);

  await tokensRepository.deleteExpired();

  await connection.close();
}

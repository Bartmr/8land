import { Body, Controller, Get, HttpCode, Patch } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { AuthContext } from 'src/auth/auth-context';
import { WithAuthContext } from 'src/auth/auth-context.decorator';
import { AuditContext } from 'src/internals/auditing/audit-context';
import { WithAuditContext } from 'src/internals/auditing/audit.decorator';
import { Connection } from 'typeorm';
import { UsersRepository } from './users.repository';
import { GetUserWalletNonce } from 'libs/shared/src/users/me/get-user-wallet-nonce.dto';
import { ReceiveSignedUserNonceRequestDTO } from 'libs/shared/src/users/me/receive-signed-user-nonce.dto';
import * as ethUtil from 'ethereumjs-util';
import { generateRandomUUID } from 'src/internals/utils/generate-random-uuid';
import { getWalletSignMessage } from 'libs/shared/src/users/me/receive-signed-user-nonce.utils';

@Controller('users')
export class UsersController {
  constructor(@InjectConnection() private connection: Connection) {}

  @Get('/me/walletNonce')
  getWalletNonce(
    @WithAuthContext() authContext: AuthContext,
  ): GetUserWalletNonce {
    return {
      walletNonce: authContext.user.walletNonce,
    };
  }

  @Patch('/me/walletNonce')
  @HttpCode(204)
  async receiveSignedWalletNonce(
    @WithAuditContext() auditContext: AuditContext,
    @WithAuthContext() authContext: AuthContext,
    @Body() body: ReceiveSignedUserNonceRequestDTO,
  ): Promise<void> {
    let nonce = authContext.user.walletNonce;

    const message = getWalletSignMessage(nonce);
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    nonce = '\x19Ethereum Signed Message:\n' + message.length + message;

    const nonceBuffer = ethUtil.keccak(Buffer.from(nonce, 'utf-8'));
    const { v, r, s } = ethUtil.fromRpcSig(body.signedNonce);

    const pubKey = ethUtil.ecrecover(ethUtil.toBuffer(nonceBuffer), v, r, s);

    const addrBuf = ethUtil.pubToAddress(pubKey);

    const addr = ethUtil.bufferToHex(addrBuf);

    authContext.user.walletAddress = addr;
    authContext.user.walletNonce = generateRandomUUID();

    const usersRepository =
      this.connection.getCustomRepository(UsersRepository);

    await usersRepository.save(authContext.user, auditContext);
  }
}

import { Body, Controller, Get, HttpCode, Patch, UseGuards } from '@nestjs/common';
import { AuthContext } from 'src/users/auth/auth-context';
import { WithAuthContext } from 'src/users/auth/auth-context.decorator';
import { AuthGuard } from 'src/users/auth/auth.guard';
import { DataSource } from 'typeorm';
import { UsersRepository } from './users.repository';
import { GetUserWalletNonce } from '@shared/src/users/me/get-user-wallet-nonce.dto';
import { ReceiveSignedUserNonceRequestDTO } from '@shared/src/users/me/receive-signed-user-nonce.dto';
import * as ethUtil from 'ethereumjs-util';
import { generateRandomUUID } from 'src/uuids/generate-random-uuid';
import { getWalletSignMessage } from '@shared/src/users/me/receive-signed-user-nonce.utils';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private dataSource: DataSource) {}

  
}

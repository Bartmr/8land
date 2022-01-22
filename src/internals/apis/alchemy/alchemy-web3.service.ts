import { AlchemyWeb3 } from '@alch/alchemy-web3';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AlchemyWeb3Service {
  constructor(private alchemyWeb3: AlchemyWeb3) {}

  getAlchemyWeb3() {
    return this.alchemyWeb3;
  }
}

import { createAlchemyWeb3 } from '@alch/alchemy-web3';
import { Module } from '@nestjs/common';
import { EnvironmentVariablesService } from 'src/internals/environment/environment-variables.service';
import { AlchemyWeb3Service } from './alchemy-web3.service';

@Module({
  providers: [
    {
      provide: AlchemyWeb3Service,
      useFactory: () => {
        const alchemyWeb3 = createAlchemyWeb3(
          EnvironmentVariablesService.variables.ALCHEMY_URL,
        );
        return new AlchemyWeb3Service(alchemyWeb3);
      },
    },
  ],
  exports: [AlchemyWeb3Service],
})
export class AlchemyModule {}

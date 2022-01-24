import Moralis from 'moralis/node';
import { Module } from '@nestjs/common';
import { EnvironmentVariablesService } from 'src/internals/environment/environment-variables.service';
import { MoralisService } from './moralis.service';

@Module({
  providers: [
    {
      provide: MoralisService,
      useFactory: async () => {
        await Moralis.start({
          serverUrl: EnvironmentVariablesService.variables.MORALIS_SERVER_URL,
          appId: EnvironmentVariablesService.variables.MORALIS_APP_ID,
        });

        return new MoralisService(Moralis);
      },
    },
  ],
  exports: [MoralisService],
})
export class MoralisModule {}

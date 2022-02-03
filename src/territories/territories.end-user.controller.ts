import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { AuthContext } from 'src/auth/auth-context';
import { WithAuthContext } from 'src/auth/auth-context.decorator';
import { MoralisService } from 'src/internals/smart-contracts/moralis/moralis.service';
import { Connection } from 'typeorm';
import { EnvironmentVariablesService } from 'src/internals/environment/environment-variables.service';
import { TerritoryFromIndex } from 'libs/shared/src/territories/index/index-territories.dto';
import { throwError } from 'src/internals/utils/throw-error';
import { ItselfStorageApi } from 'src/internals/apis/itself/itself-storage.api';
import superagent from 'superagent';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { array } from 'not-me/lib/schemas/array/array-schema';
import { string } from 'not-me/lib/schemas/string/string-schema';

@Controller('territories')
export class TerritoriesEndUserController {
  constructor(
    @InjectConnection() private connection: Connection,
    private moralisService: MoralisService,
    private itselfStorageApi: ItselfStorageApi,
  ) {}

  @Get()
  async getTerritories(
    @WithAuthContext() authContext: AuthContext,
  ): Promise<TerritoryFromIndex[]> {
    const moralis = this.moralisService.getMoralis();
    const walletAddress = authContext.user.walletAddress;

    if (!walletAddress) {
      return [];
    }

    const nfts = await moralis.Web3API.account.getNFTsForContract({
      address: walletAddress,
      chain: EnvironmentVariablesService.variables.WEB3_CHAIN,
      token_address:
        EnvironmentVariablesService.variables.TERRITORY_NFT_CONTRACT_ADDRESS,
    });

    if ((nfts.total || throwError()) > (nfts.page_size || throwError())) {
      throw new Error();
    }

    const territoriesAndTheirData = await Promise.all(
      (nfts.result || throwError()).map(async (n) => {
        const res = await superagent
          .get(n.token_uri || throwError())
          .ok((r) => r.status < 500)
          .send();

        if (
          res.statusCode === 404 &&
          EnvironmentVariablesService.variables.WEB3_CHAIN === 'mumbai'
        ) {
          return undefined;
        }

        if (res.statusCode !== 200) {
          throw new Error(
            `Url: ${n.token_uri || ''}; Status: ${res.statusCode}`,
          );
        }

        const validation = object({
          body: object({
            image: string().required(),
            name: string().required(),
            attributes: array(
              object({
                trait_type: string().required(),
                value: string().required(),
              }).required(),
            )
              .required()
              .transform((s) =>
                s.filter((c) => c.trait_type === 'Territory ID'),
              )
              .transform((s) => {
                const territoryId = s.find(
                  (c) => c.trait_type === 'Territory ID',
                );

                return territoryId ? territoryId.value : 'error';
              })
              .test((s) => (s === 'error' ? s : null)),
          }).required(),
        })
          .required()
          .validate({
            body: res.body as unknown,
          });

        if (validation.errors) {
          throw new Error(JSON.stringify(validation.messagesTree));
        } else {
          return {
            name: validation.value.body.name,
            thumbnailUrl: validation.value.body.image,
            id: validation.value.body.attributes,
          };
        }
      }),
    );

    return territoriesAndTheirData.filter((n): n is TerritoryFromIndex => !!n);
  }
}

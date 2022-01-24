import Moralis from 'moralis';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MoralisService {
  constructor(private moralis: Moralis) {}

  getMoralis() {
    return this.moralis;
  }
}

export function getWalletSignMessage(nonce: string) {
  return `In order to prove you own this wallet, we need you to sign this message. Nonce: ${nonce}`;
}

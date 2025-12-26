declare module "elliptic" {
  export interface KeyPair {
    getPublic(format: string): string;
    sign(hash: string, format: string): any;
  }

  export interface PublicKey {
    verify(hash: string, signature: string): boolean;
  }

  export class EC {
    constructor(curve: string);
    keyFromPrivate(privateKey: string): KeyPair;
    keyFromPublic(publicKey: string, format: string): PublicKey;
  }

  export interface ECStatic {
    ec: new (curve: string) => EC;
  }

  const elliptic: {
    ec: new (curve: string) => EC;
  };
  export default elliptic;
}

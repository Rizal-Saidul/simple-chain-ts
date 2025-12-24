import CryptoJS from "crypto-js";

export class Block {
  public index: number;
  public timestamp: string;
  public data: any;
  public previousHash: string;
  public hash: string;
  public nonce: number; // <-- 1. Tambahan properti Non

  constructor(
    index: number,
    timestamp: string,
    data: any,
    previousHash: string = ""
  ) {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.nonce = 0; // <-- 1. Tambahan properti Non
    this.hash = this.calculateHash();
  }

  calculateHash(): string {
    return CryptoJS.SHA256(
      this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.data) +
        this.nonce // <-- 3. Nonce harus ikut di-hash
    ).toString();
  }

  mineBlock(difficulty: number): void {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce++; // Coba angka baru
      this.hash = this.calculateHash(); // Hitung ulang hash
    }
    console.log("Block mined: " + this.hash);
  }
}

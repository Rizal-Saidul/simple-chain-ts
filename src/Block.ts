import CryptoJS from "crypto-js";
import { Transaction } from "./Blockchain.js";

export class Block {
  public timestamp: string;
  public transactions: Transaction[];
  public previousHash: string;
  public hash: string;
  public nonce: number; // <-- 1. Tambahan properti Non

  constructor(
    timestamp: string,
    transaction: Transaction[],
    previousHash: string = ""
  ) {
    this.timestamp = timestamp;
    this.transactions = transaction;
    this.previousHash = previousHash;
    this.nonce = 0; // <-- 1. Tambahan properti Non
    this.hash = this.calculateHash();
  }

  calculateHash(): string {
    return CryptoJS.SHA256(
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.transactions) +
        this.nonce
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

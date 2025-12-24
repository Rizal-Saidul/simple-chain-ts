import { Block } from "./Block.js";

export class Blockchain {
  public chain: Block[];
  public difficulty: number; // <-- 1. Setting Difficulty
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 4;
  }

  // Block pertama dalam blockchain selalu dibuat manual (Genesis Block)
  private createGenesisBlock(): Block {
    return new Block(0, "22/12/2025", "Genesis Block", "0");
  }

  // mengambil blok terakhir untuk mendapatkan previous Hash
  getLatestBlock(): Block {
    const lastBlock = this.chain[this.chain.length - 1];
    if (!lastBlock) throw new Error("Chain is empty");
    return lastBlock;
  }

  //   menambahkan blok baru

  addBlock(newBlock: Block): void {
    newBlock.previousHash = this.getLatestBlock().hash; // link ke Block sebelumnya

    // <-- 2. Sebelum push, kita harus mining dulu!
    newBlock.mineBlock(this.difficulty);

    this.chain.push(newBlock);
  }

  // memastikan chain tidak dimanipulassi
  isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (!currentBlock || !previousBlock) {
        console.error(`[!] Block is undefined at index ${i}`);
        return false;
      }

      // cek 1 : apakah data block berupa? (hash tidak sesuai kalkulasi ulang)
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        console.error(`[!] Hash mismatch at block ${i}`);
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        console.error(`[!] Link broken at block ${i}`);
        return false;
      }
    }
    return true;
  }
}

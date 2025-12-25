import { Block } from "./Block.js";

export class Transaction {
  constructor(
    public fromAddress: string | null, // null jika ini adalah mining reward
    public toAddress: string,
    public amount: number
  ) {}
}

export class Blockchain {
  public chain: Block[];
  public difficulty: number; // <-- 1. Setting Difficulty
  public pendingTransactions: Transaction[]; // <-- Ruang tunggu transaksi
  public miningReward: number; // <-- Hadiah buat miner

  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 100; // Dapat 100 koin jika berhasil nambang
  }

  // Block pertama dalam blockchain selalu dibuat manual (Genesis Block)
  private createGenesisBlock(): Block {
    return new Block("22/12/2025", [], "0");
  }

  // mengambil blok terakhir untuk mendapatkan previous Hash
  getLatestBlock(): Block {
    const lastBlock = this.chain[this.chain.length - 1];
    if (!lastBlock) throw new Error("Chain is empty");
    return lastBlock;
  }

  // LOGIKA BARU: Mining Transaksi Pending
  minePendingTransactions(miningRewardAddress: string): void {
    // 1. Buat blok baru berisi semua transaksi yang pending
    // (Di dunia nyata, miner memilih transaksi mana yang mau dimasukkan, tidak semua)
    const block = new Block(
      Date.now().toString(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );

    // 2. Lakukan kerja keras (mining)
    block.mineBlock(this.difficulty);

    // 3. Masukkan blok ke rantai
    console.log("Block successfully mined!");
    this.chain.push(block);

    // 4. Reset pending transactions dan berikan reward ke miner
    // (Reward baru bisa dibelanjakan di blok BERIKUTNYA)
    this.pendingTransactions = [
      new Transaction(null, miningRewardAddress, this.miningReward),
    ];
  }
  createTransaction(transaction: Transaction): void {
    this.pendingTransactions.push(transaction);
  }

  // cek saldo dompet
  getBalanceOfAddress(address: string): number {
    let balance = 0;

    for (const block of this.chain) {
      for (const trans of block.transactions) {
        // Jika alamat adalah PENGIRIM, kurangi saldo
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }

        // Jika alamat adalah PENERIMA, tambah saldo
        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }

    return balance;
  }
}

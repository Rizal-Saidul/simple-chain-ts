import { Block } from './Block'; // Hapus .js agar aman
import SHA256 from 'crypto-js/sha256'; // Wajib import ini untuk hash transaksi
import elliptic from 'elliptic';
const EC = elliptic.ec;

const ec = new EC('secp256k1');

export class Transaction {
  public fromAddress: string | null;
  public toAddress: string;
  public amount: number;
  public signature: string; // <-- Properti baru untuk keamanan

  constructor(fromAddress: string | null, toAddress: string, amount: number) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.signature = ''; // Default kosong
  }

  // Menghitung hash dari transaksi ini saja
  calculateHash(): string {
    return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
  }

  // Menandatangani transaksi dengan Private Key (Signing)
  signTransaction(signingKey: EC.KeyPair): void {
    // Validasi: Anda hanya boleh menandatangani dompet Anda sendiri
    if (signingKey.getPublic('hex') !== this.fromAddress) {
      throw new Error('Anda tidak bisa menandatangani transaksi untuk dompet orang lain!');
    }

    const hashTx = this.calculateHash();
    const sig = signingKey.sign(hashTx, 'base64');
    this.signature = sig.toDER('hex');
  }

  // Validasi: Apakah tanda tangan ini asli?
  isValid(): boolean {
    // Transaksi dari sistem (Mining Reward) tidak butuh tanda tangan
    if (this.fromAddress === null) return true;

    if (!this.signature || this.signature.length === 0) {
      throw new Error('Transaksi ini tidak memiliki tanda tangan!');
    }

    // Verifikasi menggunakan Public Key pengirim
    const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
    return publicKey.verify(this.calculateHash(), this.signature);
  }
}

export class Blockchain {
  public chain: Block[];
  public difficulty: number;
  public pendingTransactions: Transaction[];
  public miningReward: number;

  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 100;
  }

  private createGenesisBlock(): Block {
    return new Block('22/12/2025', [], '0');
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress: string): void {
    const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
    this.pendingTransactions.push(rewardTx);

    // Di dunia nyata, miner memilih transaksi. Di sini kita ambil semua.
    const block = new Block(Date.now().toString(), this.pendingTransactions, this.getLatestBlock().hash);
    block.mineBlock(this.difficulty);

    console.log('Block successfully mined!');
    this.chain.push(block);

    this.pendingTransactions = [];
  }

  // --- FUNGSI PENTING: Menambahkan transaksi dengan Validasi ---
  addTransaction(transaction: Transaction): void {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('Transaksi harus memiliki alamat pengirim dan penerima');
    }

    // Cek apakah transaksi valid sebelum dimasukkan ke antrian
    if (!transaction.isValid()) {
      throw new Error('Transaksi tidak valid (Gagal verifikasi signature)!');
    }

    this.pendingTransactions.push(transaction);
  }

  getBalanceOfAddress(address: string): number {
    let balance = 0;

    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }

        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }

    return balance;
  }
  
  // Validasi seluruh rantai (termasuk signature di dalamnya)
  isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Cek apakah semua transaksi di blok ini valid?
      if (!currentBlock.hasValidTransactions()) {
        return false;
      }

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
}
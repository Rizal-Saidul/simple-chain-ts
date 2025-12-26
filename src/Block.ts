/**
 * @fileoverview Block class untuk Blockchain
 * Setiap block menyimpan data transaksi dan terhubung ke block sebelumnya
 * melalui cryptographic hash, memastikan integritas data.
 */

import CryptoJS from "crypto-js";
import { Transaction } from "./Blockchain.js";

/**
 * Representasi satu blok dalam blockchain.
 * 
 * Setiap blok memiliki:
 * - Timestamp: kapan blok dibuat
 * - Transactions: daftar transaksi dalam blok
 * - previousHash: hash blok sebelumnya (untuk linking)
 * - hash: hash unik blok ini (untuk immutability)
 * - nonce: angka untuk Proof of Work (mining)
 * 
 * @class Block
 * @example
 * const block = new Block("2025-12-26", [tx1, tx2], "0xabc123");
 * block.mineBlock(2); // Lakukan mining dengan difficulty 2
 */
export class Block {
  /** Waktu pembuatan blok (dalam format timestamp atau string) */
  public timestamp: string;

  /** Array dari transaksi yang ada di blok ini */
  public transactions: Transaction[];

  /** Hash dari blok sebelumnya - menciptakan chain linking */
  public previousHash: string;

  /** Hash unik blok saat ini berdasarkan konten blok */
  public hash: string;

  /** Angka untuk Proof of Work - dinaikkan saat mining hingga menemukan valid hash */
  public nonce: number;

  /**
   * Membuat instance blok baru
   * 
   * @param {string} timestamp - Waktu pembuatan blok
   * @param {Transaction[]} transactions - Daftar transaksi dalam blok
   * @param {string} [previousHash=""] - Hash blok sebelumnya (default: "" untuk Genesis Block)
   */
  constructor(
    timestamp: string,
    transactions: Transaction[],
    previousHash: string = ""
  ) {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0; // Dimulai dari 0, akan di-increment saat mining
    this.hash = this.calculateHash(); // Hitung hash awal
  }

  /**
   * Menghitung SHA-256 hash dari blok berdasarkan kontennya.
   * 
   * Jika ada perubahan kecil pada data blok (transaksi, timestamp, nonce),
   * hash akan berbeda sepenuhnya (avalanche effect).
   * 
   * Formula: SHA256(previousHash + timestamp + transactions + nonce)
   * 
   * @returns {string} Hash hexadecimal dari blok
   * 
   * @example
   * const hash = block.calculateHash();
   * console.log(hash); // "0x1a2b3c4d..."
   */
  calculateHash(): string {
    return CryptoJS.SHA256(
      this.previousHash +
        this.timestamp +
        JSON.stringify(this.transactions) +
        this.nonce
    ).toString();
  }

  /**
   * Melakukan Proof of Work mining untuk blok.
   * 
   * Mining adalah proses mencari nonce yang membuat hash block dimulai dengan
   * sejumlah "0" (zeros) sebanyak difficulty. Semakin tinggi difficulty,
   * semakin sulit mining (butuh komputasi lebih banyak).
   * 
   * Proses:
   * 1. Increment nonce
   * 2. Hitung hash baru dengan nonce baru
   * 3. Cek apakah hash dimulai dengan required zeros
   * 4. Jika belum, kembali ke step 1
   * 
   * @param {number} difficulty - Jumlah leading zeros yang diperlukan
   *                              (difficulty = 2 berarti "00...")
   * 
   * @example
   * // Mining dengan difficulty 3 (hash harus dimulai dengan "000")
   * block.mineBlock(3);
   * // Output: Block mined: 0001a2b3c4d5e6f7...
   */
  mineBlock(difficulty: number): void {
    // Target string: jumlah "0" sesuai difficulty
    // Contoh difficulty=2 -> target="00"
    // Contoh difficulty=3 -> target="000"
    const target = Array(difficulty + 1).join("0");

    // Loop hingga menemukan hash yang sesuai
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++; // Coba angka berbeda
      this.hash = this.calculateHash(); // Hitung hash baru
    }

    console.log("Block mined: " + this.hash);
  }

  /**
   * Memvalidasi bahwa semua transaksi dalam blok valid.
   * 
   * Setiap transaksi harus memiliki:
   * - Signature yang valid (signed dengan private key pengirim)
   * - Jika mining reward (fromAddress = null), otomatis valid
   * 
   * @returns {boolean} true jika semua transaksi valid, false jika ada yang tidak valid
   * 
   * @example
   * if (block.hasValidTransactions()) {
   *   console.log("Blok ini aman, semua transaksi terverifikasi");
   * } else {
   *   console.log("⚠️ Ada transaksi yang korup atau tidak valid!");
   * }
   */
  hasValidTransactions(): boolean {
    for (const tx of this.transactions) {
      if (!tx.isValid()) {
        return false; // Ada transaksi yang tidak valid
      }
    }
    return true; // Semua transaksi valid
  }
}

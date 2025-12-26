/**
 * @fileoverview Blockchain dan Transaction classes
 * Implementasi blockchain dengan Proof of Work, digital signatures,
 * dan chain validation untuk mencegah manipulasi data.
 */

import { Block } from "./Block.js";
import CryptoJS from "crypto-js";
// @ts-ignore
import elliptic from "elliptic";

/** Elliptic Curve Digital Signature Algorithm menggunakan secp256k1 */
const ec = new elliptic.ec("secp256k1");

/**
 * Representasi satu transaksi dalam blockchain.
 * 
 * Setiap transaksi mencatat transfer nilai dari satu alamat ke alamat lain.
 * Untuk keamanan, transaksi harus ditandatangani dengan private key pengirim.
 * 
 * Fitur:
 * - Digital signature: membuktikan pengirim adalah pemilik wallet
 * - Mining reward: transaksi spesial tanpa pengirim (fromAddress = null)
 * - Hash transaksi: identitas unik setiap transaksi
 * 
 * @class Transaction
 * @example
 * // Membuat transaksi biasa
 * const tx = new Transaction(senderPublicKey, receiverPublicKey, 50);
 * tx.signTransaction(senderPrivateKey);
 * 
 * // Mining reward (tanpa pengirim)
 * const rewardTx = new Transaction(null, minerAddress, 100);
 */
export class Transaction {
  /** Public key pengirim, atau null jika ini mining reward */
  public fromAddress: string | null;

  /** Public key penerima */
  public toAddress: string;

  /** Jumlah nilai yang ditransfer */
  public amount: number;

  /** Digital signature - bukti bahwa pengirim authorized transaksi ini */
  public signature: string;

  /**
   * Membuat instance transaksi baru
   * 
   * @param {string | null} fromAddress - Public key pengirim (null untuk mining reward)
   * @param {string} toAddress - Public key penerima
   * @param {number} amount - Jumlah yang ditransfer
   */
  constructor(fromAddress: string | null, toAddress: string, amount: number) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.signature = ""; // Belum ditandatangani
  }

  /**
   * Menghitung hash unik dari transaksi.
   * 
   * Hash ini adalah identitas transaksi yang tidak dapat diubah
   * tanpa mengubah hash.
   * 
   * @returns {string} SHA-256 hash dari transaksi
   */
  calculateHash(): string {
    return CryptoJS.SHA256(this.fromAddress + this.toAddress + this.amount).toString();
  }

  /**
   * Menandatangani transaksi dengan private key pengirim.
   * 
   * Proses:
   * 1. Hitung hash transaksi
   * 2. Sign hash menggunakan private key
   * 3. Simpan signature sebagai bukti
   * 
   * Hanya pengirim (yang punya private key) yang bisa sign transaksinya.
   * Jika private key tidak match dengan public key, akan error.
   * 
   * @param {any} signingKey - Private key dari pengirim (dari elliptic)
   * @throws {Error} Jika public key dari signingKey != fromAddress
   * 
   * @example
   * const myKey = ec.keyFromPrivate("private_key_hex");
   * const tx = new Transaction(myKey.getPublic("hex"), receiverAddress, 10);
   * tx.signTransaction(myKey); // ✅ Sukses
   * 
   * // Atau error jika mencoba sign dengan key orang lain:
   * tx.signTransaction(otherPersonKey); // ❌ Error: "Anda tidak bisa menandatangani transaksi untuk dompet orang lain!"
   */
  signTransaction(signingKey: any): void {
    // Validasi: key yang digunakan harus match dengan fromAddress
    if (signingKey.getPublic("hex") !== this.fromAddress) {
      throw new Error(
        "Anda tidak bisa menandatangani transaksi untuk dompet orang lain!"
      );
    }

    // Hitung hash transaksi dan sign-nya dengan private key
    const hashTx = this.calculateHash();
    const sig = signingKey.sign(hashTx, "base64");
    this.signature = sig.toDER("hex"); // Simpan signature dalam format DER
  }

  /**
   * Memvalidasi bahwa transaksi memiliki signature yang valid.
   * 
   * Proses validasi:
   * 1. Jika mining reward (fromAddress = null), otomatis valid
   * 2. Cek apakah signature ada
   * 3. Gunakan public key untuk verify bahwa signature sesuai dengan data transaksi
   * 
   * Jika ada orang mengubah amount atau alamat, signature verification akan gagal.
   * Ini membuktikan bahwa transaksi belum dimanipulasi.
   * 
   * @returns {boolean} true jika signature valid, false jika tidak
   * @throws {Error} Jika transaksi tidak memiliki signature
   * 
   * @example
   * if (tx.isValid()) {
   *   console.log("✅ Transaksi ini valid dan belum dimanipulasi");
   * } else {
   *   console.log("❌ Signature tidak cocok - transaksi telah diubah!");
   * }
   */
  isValid(): boolean {
    // Mining reward otomatis valid (tidak perlu signature)
    if (this.fromAddress === null) return true;

    // Transaksi biasa harus memiliki signature
    if (!this.signature || this.signature.length === 0) {
      throw new Error("Transaksi ini tidak memiliki tanda tangan!");
    }

    // Ambil public key dan verify signature
    const publicKey = ec.keyFromPublic(this.fromAddress, "hex");
    return publicKey.verify(this.calculateHash(), this.signature);
  }
}

/**
 * Representasi blockchain lengkap.
 * 
 * Blockchain adalah rantai blok yang saling terhubung secara kriptografis.
 * Setiap blok berisi transaksi, dan setiap blok terhubung ke blok sebelumnya
 * melalui previousHash, menciptakan rantai yang tidak dapat dipalsukan.
 * 
 * Fitur:
 * - Proof of Work (Mining): mencegah spam, mengamankan blockchain
 * - Difficulty adjustment: kontrol kecepatan mining
 * - Transaction validation: memverifikasi signature transaksi
 * - Chain validation: deteksi manipulasi
 * - Consensus: mengganti chain dengan yang lebih panjang (longest chain rule)
 * - Balance calculation: hitung saldo per wallet
 * 
 * @class Blockchain
 * @example
 * const blockchain = new Blockchain();
 * const tx = new Transaction(sender, receiver, 50);
 * tx.signTransaction(senderKey);
 * blockchain.addTransaction(tx);
 * blockchain.minePendingTransactions(minerAddress);
 */
export class Blockchain {
  /** Array semua blok dalam blockchain */
  public chain: Block[];

  /** Difficulty untuk Proof of Work (jumlah leading zeros yang diperlukan) */
  public difficulty: number;

  /** Transaksi yang belum dimasukkan ke blok (mempool/pending) */
  public pendingTransactions: Transaction[];

  /** Reward yang diberikan ke miner untuk setiap blok yang berhasil ditambang */
  public miningReward: number;

  /**
   * Membuat blockchain baru dengan Genesis Block
   */
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2; // Require 2 leading zeros (00...)
    this.pendingTransactions = [];
    this.miningReward = 100; // Setiap mining reward 100 koin
  }

  /**
   * Membuat Genesis Block - blok pertama dalam blockchain.
   * 
   * Genesis Block adalah blok khusus tanpa previousHash yang meaningful,
   * dan selalu kosong transaksi. Ini adalah fondasi blockchain.
   * 
   * @returns {Block} Genesis Block
   */
  public createGenesisBlock(): Block {
    return new Block("22/12/2025", [], "0");
  }

  /**
   * Mendapatkan blok terakhir dalam blockchain.
   * 
   * Fungsi ini penting untuk:
   * - Mengetahui hash terakhir (untuk linking blok baru)
   * - Mengetahui berapa panjang blockchain
   * - Validasi blockchain
   * 
   * @returns {Block} Blok paling akhir di chain
   * @throws {Error} Jika blockchain kosong (tidak boleh terjadi)
   */
  getLatestBlock(): Block {
    const lastBlock = this.chain[this.chain.length - 1];
    if (!lastBlock) throw new Error("Chain is empty");
    return lastBlock;
  }

  /**
   * Melakukan mining transaksi pending dan membuat blok baru.
   * 
   * Proses mining:
   * 1. Tambahkan mining reward ke pending transactions
   * 2. Buat blok baru dengan semua pending transactions
   * 3. Link blok ke blok sebelumnya
   * 4. Lakukan Proof of Work (mining)
   * 5. Tambahkan blok ke chain
   * 6. Reset pending transactions
   * 
   * Catatan: Reward baru diterima di blok BERIKUTNYA (sebagai pending),
   * bukan blok yang sedang dimining.
   * 
   * @param {string} miningRewardAddress - Public key wallet miner
   * 
   * @example
   * blockchain.minePendingTransactions("0x123abc...");
   * // Output:
   * // Block mined: 0041c1df8aa439afc28d186d5a645c90ff6302b855beb28d2ef2b3f8ee6e24d9
   * // Block successfully mined!
   */
  minePendingTransactions(miningRewardAddress: string): void {
    // 1. Buat transaksi reward untuk miner
    const rewardTx = new Transaction(
      null, // Mining reward, tidak ada pengirim
      miningRewardAddress,
      this.miningReward
    );
    this.pendingTransactions.push(rewardTx);

    // 2. Buat blok baru dengan pending transactions
    const block = new Block(
      Date.now().toString(),
      this.pendingTransactions,
      this.getLatestBlock().hash // Link ke blok sebelumnya
    );

    // 3. Lakukan mining (Proof of Work)
    block.mineBlock(this.difficulty);

    // 4. Tambahkan blok ke chain
    console.log("Block successfully mined!");
    this.chain.push(block);

    // 5. Reset pending transactions untuk blok berikutnya
    // Reward baru akan masuk sebagai pending di blok selanjutnya
    this.pendingTransactions = [];
  }

  /**
   * Menambahkan transaksi baru ke pending transactions (mempool).
   * 
   * Validasi sebelum menambahkan:
   * 1. Transaksi harus memiliki fromAddress dan toAddress
   * 2. Transaksi harus memiliki signature yang valid
   * 3. Signature harus cocok dengan public key pengirim
   * 
   * Transaksi yang berhasil disimpan di mempool dan akan dimasukkan
   * ke blok berikutnya saat mining.
   * 
   * @param {Transaction} transaction - Transaksi yang akan ditambahkan
   * @throws {Error} Jika alamat tidak lengkap atau signature tidak valid
   * 
   * @example
   * const tx = new Transaction(senderKey.getPublic("hex"), receiverAddress, 50);
   * tx.signTransaction(senderKey);
   * 
   * try {
   *   blockchain.addTransaction(tx);
   *   console.log("✅ Transaksi berhasil ditambahkan ke mempool");
   * } catch (error) {
   *   console.error("❌ Transaksi ditolak:", error.message);
   * }
   */
  addTransaction(transaction: Transaction): void {
    // Validasi: harus ada pengirim dan penerima
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error("Transaksi harus memiliki alamat pengirim dan penerima");
    }

    // Validasi: signature harus valid
    if (!transaction.isValid()) {
      throw new Error("Transaksi tidak valid (Gagal verifikasi signature)!");
    }

    this.pendingTransactions.push(transaction);
  }

  /**
   * Menghitung saldo total dari suatu wallet address.
   * 
   * Proses:
   * 1. Iterasi semua blok dalam blockchain
   * 2. Iterasi semua transaksi dalam setiap blok
   * 3. Jika address = pengirim, kurangi saldo (output)
   * 4. Jika address = penerima, tambah saldo (input)
   * 
   * Catatan: Jangan hitung pending transactions di sini,
   * karena reward belum confirmed sampai blok berikutnya dimining.
   * 
   * @param {string} address - Public key wallet yang dicari saldonya
   * @returns {number} Total saldo (bisa negatif jika spend lebih dari yang diterima)
   * 
   * @example
   * const balance = blockchain.getBalanceOfAddress(myPublicKey);
   * console.log("Saldo saya:", balance); // 150 koin
   */
  getBalanceOfAddress(address: string): number {
    let balance = 0;

    // Scan semua blok
    for (const block of this.chain) {
      // Scan semua transaksi dalam blok
      for (const trans of block.transactions) {
        // Jika saya adalah pengirim, kurangi saldo
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }

        // Jika saya adalah penerima, tambah saldo
        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }

    return balance;
  }

  /**
   * Memvalidasi bahwa blockchain saat ini tidak dimanipulasi.
   * 
   * Validasi yang dilakukan:
   * 1. Untuk setiap blok, cek apakah semua transaksinya valid
   * 2. Cek apakah hash blok cocok dengan kalkulasi ulang (data tidak diubah)
   * 3. Cek apakah previousHash sesuai dengan hash blok sebelumnya (chain tidak putus)
   * 
   * Jika ada yang tidak cocok, blockchain tidak valid dan mungkin sudah dimanipulasi.
   * 
   * @returns {boolean} true jika blockchain valid, false jika ada yang tidak cocok
   * 
   * @example
   * if (blockchain.isChainValid()) {
   *   console.log("✅ Blockchain aman, belum dimanipulasi");
   * } else {
   *   console.log("⚠️ Blockchain tidak valid!");
   * }
   */
  isChainValid(): boolean {
    // Mulai dari blok ke-1 (skip Genesis Block)
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      
      // Safety check
      if (!currentBlock || !previousBlock) {
        return false;
      }
      
      // Cek 1: Semua transaksi dalam blok harus valid
      if (!currentBlock.hasValidTransactions()) {
        return false;
      }

      // Cek 2: Hash blok harus cocok (data tidak diubah)
      // Jika hash !== calculateHash(), berarti data sudah diubah
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      // Cek 3: Chain linking harus valid
      // previousHash harus cocok dengan hash blok sebelumnya
      // Jika berbeda, berarti blok sebelumnya atau link sudah diubah
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true; // Semua validasi passed
  }

  /**
   * Mengganti blockchain dengan chain baru jika chain baru lebih panjang dan valid.
   * 
   * Ini mengimplementasikan "Longest Chain Rule" - consensus rule di blockchain.
   * 
   * Validasi:
   * 1. Chain baru harus lebih panjang dari chain saat ini
   * 2. Chain baru harus valid (tidak ada manipulasi)
   * 3. Chain baru harus kompatibel (Genesis Block sama)
   * 
   * Jika semua kondisi terpenuhi, chain saat ini diganti dengan chain baru.
   * Ini penting untuk P2P network agar semua node punya blockchain yang sama.
   * 
   * @param {Block[]} newChain - Blockchain baru dari node lain
   * 
   * @example
   * // Menerima blockchain dari peer, coba replace
   * blockchain.replaceChain(receivedChain);
   * // Output:
   * // "Rantai saat ini diganti dengan rantai baru yang lebih panjang"
   * // atau
   * // "Rantai baru tidak lebih panjang dari rantai saat ini"
   * // atau
   * // "rantai baru tidak valid"
   */
  replaceChain(newChain: Block[]): void {
    // Cek 1: Apakah chain baru lebih panjang?
    if (newChain.length <= this.chain.length) {
      console.log("Rantai baru tidak lebih panjang dari rantai saat ini");
      return;
    }

    // Cek 2: Apakah chain baru valid?
    if (!this.isValidChain(newChain)) {
      console.log("rantai baru tidak valid");
      return;
    }

    // Jika semua kondisi terpenuhi, ganti blockchain
    console.log(
      "Rantai saat ini diganti dengan rantai baru yang lebih panjang"
    );
    this.chain = newChain;
  }

  /**
   * Memvalidasi blockchain asing (dari node lain).
   * 
   * Lebih strict dari isChainValid() karena:
   * 1. Cek Genesis Block - harus identik dengan Genesis Block kita
   * 2. Reconstruct setiap blok - pastikan data tidak korup saat transfer
   * 3. Validasi transaksi - periksa signature
   * 4. Validasi hash - pastikan tidak ada manipulasi
   * 5. Validasi chain linking - pastikan chain tidak putus
   * 
   * Proses:
   * 1. Parse JSON block data menjadi object Block yang proper
   * 2. Restore signature dari transaksi
   * 3. Hitung ulang hash dan validasi
   * 
   * @param {Block[]} chainToValidate - Blockchain yang akan divalidasi
   * @returns {boolean} true jika valid, false jika ada yang tidak cocok
   * 
   * @example
   * const isValid = blockchain.isValidChain(receivedChain);
   * if (isValid) {
   *   console.log("✅ Chain dari peer valid, bisa di-sync");
   * }
   */
  isValidChain(chainToValidate: Block[]): boolean {
    const realGenesis = JSON.stringify(this.createGenesisBlock());
    
    // Genesis Block tidak boleh kosong
    if (chainToValidate.length === 0) {
      return false;
    }
    
    // Cek Genesis Block harus identik
    if (JSON.stringify(chainToValidate[0]) !== realGenesis) {
      if (chainToValidate[0]?.previousHash !== "0") return false;
    }

    // Validasi sisa chain
    for (let i = 1; i < chainToValidate.length; i++) {
      const currentBlockData = chainToValidate[i];
      const previousBlockData = chainToValidate[i - 1];

      if (!currentBlockData || !previousBlockData) {
        return false;
      }

      // Reconstruct transaksi dengan signature asli
      const reconstructedTx = currentBlockData.transactions.map(
        (txData: any) => {
          const tx = new Transaction(
            txData.fromAddress,
            txData.toAddress,
            txData.amount
          );
          tx.signature = txData.signature; // Restore signature
          return tx;
        }
      );

      // Reconstruct blok
      const currentBlock = new Block(
        currentBlockData.timestamp,
        reconstructedTx,
        currentBlockData.previousHash
      );
      currentBlock.nonce = currentBlockData.nonce;
      currentBlock.hash = currentBlockData.hash;

      // Cek 1: Transaksi harus valid
      if (!currentBlock.hasValidTransactions()) {
        console.log("Chain invalid: Transaksi korup ditemukan.");
        return false;
      }

      // Cek 2: Hash harus cocok
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        console.log("Chain invalid: Hash blok tidak cocok.");
        return false;
      }

      // Cek 3: Chain linking harus valid
      if (currentBlock.previousHash !== previousBlockData.hash) {
        console.log("Chain invalid: Rantai terputus.");
        return false;
      }
    }
    return true;
  }
}

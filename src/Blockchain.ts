import { Block } from "./Block.js";
import CryptoJS from "crypto-js";
// @ts-ignore
import elliptic from "elliptic";
const ec = new elliptic.ec("secp256k1");

export class Transaction {
  public fromAddress: string | null;
  public toAddress: string;
  public amount: number;
  public signature: string;
  constructor(fromAddress: string | null, toAddress: string, amount: number) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.signature = "";
  }

  calculateHash(): string {
    return CryptoJS.SHA256(this.fromAddress + this.toAddress + this.amount).toString();
  }
  signTransaction(signingKey: any): void {
    if (signingKey.getPublic("hex") !== this.fromAddress) {
      throw new Error(
        "Anda tidak bisa menandatangani transaksi untuk dompet orang lain!"
      );
    }

    const hashTx = this.calculateHash();
    const sig = signingKey.sign(hashTx, "base64");
    this.signature = sig.toDER("hex");
  }
  isValid(): boolean {
    if (this.fromAddress === null) return true;

    if (!this.signature || this.signature.length === 0) {
      throw new Error("Transaksi ini tidak memiliki tanda tangan!");
    }

    const publicKey = ec.keyFromPublic(this.fromAddress, "hex");
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

  public createGenesisBlock(): Block {
    return new Block("22/12/2025", [], "0");
  }

  getLatestBlock(): Block {
    const lastBlock = this.chain[this.chain.length - 1];
    if (!lastBlock) throw new Error("Chain is empty");
    return lastBlock;
  }

  minePendingTransactions(miningRewardAddress: string): void {
    const rewardTx = new Transaction(
      null,
      miningRewardAddress,
      this.miningReward
    );
    this.pendingTransactions.push(rewardTx);

    const block = new Block(
      Date.now().toString(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );
    block.mineBlock(this.difficulty);

    console.log("Block successfully mined!");
    this.chain.push(block);

    this.pendingTransactions = [];
  }

  addTransaction(transaction: Transaction): void {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error("Transaksi harus memiliki alamat pengirim dan penerima");
    }
    if (!transaction.isValid()) {
      throw new Error("Transaksi tidak valid (Gagal verifikasi signature)!");
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

  isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      
      if (!currentBlock || !previousBlock) {
        return false;
      }
      
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

  // mengganti rantai saat ini dengan rantai baru jika rantai baru lebih panjang dan valid
  replaceChain(newChain: Block[]): void {
    if (newChain.length <= this.chain.length) {
      console.log("Rantai baru tidak lebih panjang dari rantai saat ini");
      return;
    }

    if (!this.isValidChain(newChain)) {
      console.log("rantai baru tidak valid");
      return;
    }

    console.log(
      "Rantai saat ini diganti dengan rantai baru yang lebih panjang"
    );
    this.chain = newChain;
  }

  //  Helper statis unutk mengecek validitas rantai asing
  isValidChain(chainToValidate: Block[]): boolean {
    const realGenesis = JSON.stringify(this.createGenesisBlock());
    // cek geneis block
    if (chainToValidate.length === 0) {
      return false;
    }
    
    if (JSON.stringify(chainToValidate[0]) !== realGenesis) {
      if (chainToValidate[0]?.previousHash !== "0") return false;
    }

    // cek sisa rantai
    for (let i = 1; i < chainToValidate.length; i++) {
      const currentBlockData = chainToValidate[i];
      const previousBlockData = chainToValidate[i - 1];

      if (!currentBlockData || !previousBlockData) {
        return false;
      }

      const reconstructedTx = currentBlockData.transactions.map(
        (txData: any) => {
          const tx = new Transaction(
            txData.fromAddress,
            txData.toAddress,
            txData.amount
          );
          tx.signature = txData.signature; // Kembalikan signature asli
          return tx;
        }
      );

      const currentBlock = new Block(
        currentBlockData.timestamp,
        reconstructedTx,
        currentBlockData.previousHash
      );
      currentBlock.nonce = currentBlockData.nonce;
      currentBlock.hash = currentBlockData.hash;

      if (!currentBlock.hasValidTransactions()) {
        console.log("Chain invalid: Transaksi korup ditemukan.");
        return false;
      }

      // Cek apakah data blok diubah? (Hash tidak cocok)
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        console.log("Chain invalid: Hash blok tidak cocok.");
        return false;
      }

      // Cek apakah rantai putus?
      if (currentBlock.previousHash !== previousBlockData.hash) {
        console.log("Chain invalid: Rantai terputus.");
        return false;
      }
    }
    return true;
  }
}

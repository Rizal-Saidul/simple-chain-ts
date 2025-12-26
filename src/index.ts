import { Blockchain, Transaction } from "./Blockchain.js";
// @ts-ignore
import elliptic from "elliptic";
const EC = elliptic.ec;

const ec = new EC("secp256k1");

const myKey = ec.keyFromPrivate(
  "e565d5baf07498ca41612fd70360d1af5b5981003bd32cfbe0233c310e7e6d22"
);

const myWalletAddress = myKey.getPublic("hex");

console.log("Dompet Saya:", myWalletAddress);
const myCoin = new Blockchain();

const tx1 = new Transaction(myWalletAddress, "Public-Key-Penerima-Bebas", 10);

tx1.signTransaction(myKey);

console.log("\nMenambahkan transaksi ke mempool...");
myCoin.addTransaction(tx1);

console.log("\nMemulai mining...");
myCoin.minePendingTransactions(myWalletAddress);

console.log(
  "\nSaldo saya adalah: " + myCoin.getBalanceOfAddress(myWalletAddress)
);

console.log("\nMining blok kedua...");
myCoin.minePendingTransactions(myWalletAddress);

console.log(
  "\nSaldo saya adalah: " + myCoin.getBalanceOfAddress(myWalletAddress)
);

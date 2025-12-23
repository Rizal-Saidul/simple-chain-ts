import { Blockchain } from "./Blockchain.js";
import { Block } from "./Block.js";

// Inisialisasi Coin
let myCoin = new Blockchain();

console.log("Menambang blok 1...");
myCoin.addBlock(new Block(1, "22/12/2025", { amount: 10 }));

console.log("Menambang blok 2...");
myCoin.addBlock(new Block(2, "22/12/2025", { amount: 25 }));

// Tes 1: Blockchain Valid
console.log("Apakah blockchain valid? " + myCoin.isChainValid()); // true

console.log("--- Percobaan Meretas ---");

// Skenario Hacker: Mengubah data transaksi di blok 1
const targetBlock = myCoin.chain[1];
if (targetBlock) {
  targetBlock.data = { amount: 1000 };
  // (Hacker mencoba mengubah jumlah transfer dari 10 menjadi 1000)
}

// Tes 2: Blockchain Invalid setelah diubah
console.log("Apakah blockchain valid setelah diubah? " + myCoin.isChainValid()); // false

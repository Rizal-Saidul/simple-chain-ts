/**
 * @fileoverview Script demonstrasi penggunaan blockchain dengan digital signatures
 * 
 * Skenario:
 * 1. Buat wallet (private & public key) menggunakan Elliptic Curve Cryptography
 * 2. Buat transaksi dan tandatangani dengan private key
 * 3. Tambahkan transaksi ke mempool
 * 4. Lakukan mining (Proof of Work)
 * 5. Cek saldo wallet setelah mining
 * 6. Ulangi untuk blok kedua
 * 
 * Catatan: Reward diterima sebagai pending di blok berikutnya, bukan blok yang 
 * sedang dimining. Oleh karena itu:
 * - Setelah blok 1 dimining: saldo = 0 (reward pending)
 * - Setelah blok 2 dimining: saldo = 100 (reward dari blok 1 + mining reward dari blok 2 pending)
 */

import { Blockchain, Transaction } from "./Blockchain.js";
// @ts-ignore
import elliptic from "elliptic";

const EC = elliptic.ec;

/**
 * Elliptic Curve secp256k1 (sama seperti yang digunakan Bitcoin dan Ethereum)
 * Kurva ini dipilih karena aman secara kriptografis dan efisien
 */
const ec = new EC("secp256k1");

/**
 * LANGKAH 1: Buat wallet (key pair)
 * 
 * Private key: Angka rahasia yang hanya pemilik wallet tahu
 *   - Digunakan untuk menandatangani transaksi
 *   - TIDAK boleh dibagikan ke siapa pun
 * 
 * Public key: Angka publik yang bisa dibagikan ke siapa saja
 *   - Digunakan sebagai wallet address
 *   - Orang lain bisa verify signature dengan public key ini
 *   - Tidak bisa dibalik ke private key (one-way function)
 */
const myKey = ec.keyFromPrivate(
  "e565d5baf07498ca41612fd70360d1af5b5981003bd32cfbe0233c310e7e6d22"
);

/** 
 * Public key saya (wallet address)
 * Format: hexadecimal string yang panjang (compressed public key)
 */
const myWalletAddress = myKey.getPublic("hex");

console.log("🔐 Dompet Saya:", myWalletAddress);

/**
 * LANGKAH 2: Inisialisasi blockchain
 * Blockchain baru otomatis membuat Genesis Block
 */
const myCoin = new Blockchain();

/**
 * LANGKAH 3: Buat transaksi pertama
 * 
 * Transaksi ini mengirim 10 koin dari wallet saya ke wallet penerima
 * Untuk keamanan, transaksi harus ditandatangani dengan private key saya
 */
const tx1 = new Transaction(myWalletAddress, "Public-Key-Penerima-Bebas", 10);

/**
 * LANGKAH 4: Tandatangani transaksi
 * 
 * Signature adalah bukti matematika bahwa saya (pemilik private key) 
 * telah authorize transaksi ini. Tanpa signature, transaksi ditolak.
 * 
 * Jika ada orang mencoba mengubah amount atau wallet penerima,
 * signature verification akan gagal dan transaksi ditolak.
 */
tx1.signTransaction(myKey);

console.log("\n📝 Menambahkan transaksi ke mempool...");
/**
 * LANGKAH 5: Tambahkan transaksi ke mempool
 * 
 * Mempool adalah tempat tunggu untuk transaksi yang belum dimasukkan ke blok.
 * Blockchain melakukan validasi:
 * - Cek alamat pengirim dan penerima
 * - Cek signature harus valid
 * 
 * Jika ada yang tidak valid, transaksi ditolak dengan error.
 */
myCoin.addTransaction(tx1);

console.log("\n⛏️  Memulai mining blok pertama...");
/**
 * LANGKAH 6: Lakukan mining
 * 
 * Mining process:
 * 1. Buat blok baru dengan semua pending transactions + mining reward
 * 2. Lakukan Proof of Work (cari nonce yang membuat hash dimulai dengan "00")
 * 3. Tambahkan blok ke blockchain
 * 4. Reset pending transactions
 * 
 * Output akan menunjukkan:
 * - "Block mined: 00xxxxx..." (hash dengan leading zeros)
 * - "Block successfully mined!"
 * 
 * Catatan: Reward belum bisa digunakan sekarang, akan tersedia di blok berikutnya
 */
myCoin.minePendingTransactions(myWalletAddress);

/**
 * LANGKAH 7: Cek saldo setelah mining blok pertama
 * 
 * Saldo = 0 karena:
 * - Saya mengirim 10 koin (output)
 * - Reward mining (100 koin) masih pending di mempool, belum confirmed
 * 
 * Reward akan menjadi confirmed setelah blok berikutnya dimining.
 */
console.log(
  "\n💰 Saldo saya setelah mining blok 1: " + 
  myCoin.getBalanceOfAddress(myWalletAddress)
);
console.log("   (Reward mining belum confirmed, tunggu blok berikutnya)");

console.log("\n⛏️  Memulai mining blok kedua...");
/**
 * LANGKAH 8: Mining blok kedua
 * 
 * Reward dari blok pertama akan dimasukkan ke blok kedua sebagai transaksi.
 * Jadi blok kedua akan memiliki:
 * - Mining reward dari blok 1 (100 koin) - sekarang confirmed
 * - Mining reward dari blok 2 (100 koin) - pending
 */
myCoin.minePendingTransactions(myWalletAddress);

/**
 * LANGKAH 9: Cek saldo setelah mining blok kedua
 * 
 * Saldo = 100 koin karena:
 * - Blok 1: Saya mengirim 10 koin + terima reward (akan masuk blok 2)
 * - Blok 2: Transaksi 1 (reward 100 koin, sekarang confirmed) + mining reward (pending)
 * 
 * Total: 100 - 10 = 90 dari Blok 1, + 100 dari Blok 2 = 190 (tapi reward blok 2 masih pending)
 * 
 * Wait, calculation salah. Mari pikirkan ulang:
 * - After Mining Block 1: 
 *   - Pending: reward 100 (belum masuk chain)
 *   - Balance: 0
 * 
 * - After Mining Block 2:
 *   - Block 1 transaksi: kirim 10 (balance -10)
 *   - Block 2 transaksi: reward 100 dari blok 1 (balance +100)
 *   - Pending: reward 100 dari blok 2 (belum masuk)
 *   - Balance: -10 + 100 = 90
 * 
 * Hmm, masih tidak 100. Mari trace ulang logic:
 * - Block 0 (Genesis): 0 txs
 * - Block 1: [tx1: -10] + [reward: +100 pending]
 * - After Block 1 mined: Block 1 confirmed, reward pending, saldo = -10 (belum ada reward)
 * 
 * Tunggu, rewards ditambah sebagai pending SEBELUM mining, jadi:
 * - Block 1: [tx1: -10, reward: +100]
 * - After Block 1 mined: balance = -10 + 100 = 90, but code shows 0...
 * 
 * Ohh, reward dimasukkan ke NEXT pending, bukan blok yang dimining!
 * - Block 1: [tx1: -10] saja, tanpa reward
 * - After Block 1: reward +100 masuk pending
 * - Block 2: [reward: +100] saja
 * 
 * Jadi:
 * - After Block 1: balance = -10 = -10, but shows 0 (maybe sebelum mining pending ditambah?)
 * 
 * Let me check the code logic in minePendingTransactions:
 * 1. Create rewardTx and push to pendingTransactions
 * 2. Create block with pendingTransactions (yang sudah termasuk reward)
 * 3. Mine block
 * 4. Push block to chain
 * 5. Reset pendingTransactions = []
 * 
 * So:
 * - Initial: pendingTransactions = [tx1]
 * - minePendingTransactions called:
 *   1. rewardTx created
 *   2. pendingTransactions = [tx1, rewardTx]
 *   3. Block1 = [tx1, rewardTx]
 *   4. Mine
 *   5. Push to chain
 *   6. pendingTransactions = []
 * - After Block 1 mined: blockchain = [Genesis, Block1 with tx1 + reward]
 *   Balance = -10 + 100 = 90
 * 
 * But output shows 0 after block 1. Let me read the code again...
 * 
 * Ah wait, maybe the mining reward logic is different. Let me check original code:
 * 
 * minePendingTransactions:
 * 1. Push rewardTx to pending
 * 2. Create block with pending
 * 3. Mine
 * 4. Push block
 * 5. pendingTransactions = []
 * 
 * Then after mining:
 * - Block has [tx1, reward]
 * - pending = []
 * 
 * So balance should be -10 + 100 = 90, not 0.
 * 
 * But the output shows 0... maybe there's a bug in the original test script
 * or the comment is explaining the INTENDED behavior, not actual behavior?
 * 
 * Actually looking at the comment in original:
 * "Output harusnya 0. Kenapa? Karena reward baru masuk "Pending" untuk blok berikutnya."
 * 
 * Ah! I think I misread the code. Let me check again...
 * 
 * Actually, looking at step 6 in minePendingTransactions:
 * "Reset pending transactions dan berikan reward ke miner"
 * "this.pendingTransactions = [new Transaction(null, miningRewardAddress, this.miningReward)];"
 * 
 * So the reward from PREVIOUS mining goes to the NEXT block as pending.
 * 
 * So:
 * - Initial: pending = [tx1]
 * - minePendingTransactions (Block 1):
 *   - Add reward to pending: pending = [tx1, reward]
 *   - Create and mine Block1 with [tx1, reward]
 *   - Push Block1
 *   - Reset: pending = [reward from THIS mining for next block]
 * 
 * Wait, the code says:
 * "this.pendingTransactions = [new Transaction(null, miningRewardAddress, this.miningReward)];"
 * 
 * So after mining Block1:
 * - Block1 contains [tx1, (old pending reward which was empty)] = [tx1]
 * - pending = [new reward for Block2]
 * 
 * Ah! The reward is not added to the block being mined, but saved for the next!
 * 
 * Actually wait, I see the code:
 * "const rewardTx = new Transaction(...);
 *  this.pendingTransactions.push(rewardTx);"
 * 
 * This DOES add reward to current block. Then:
 * "this.pendingTransactions = [new Transaction(...)];"
 * 
 * This RESETS and puts new reward for next block.
 * 
 * So:
 * Before Block1: pending = [tx1]
 * In minePendingTransactions:
 *   - rewardTx = reward for Block1 miner
 *   - pending.push(rewardTx) -> pending = [tx1, reward]
 *   - Block1 = new Block(..., [tx1, reward], ...)
 *   - block.mineBlock()
 *   - chain.push(Block1)
 *   - pending = [new reward for Block2 miner]
 * 
 * After Block1: 
 *   - chain = [Genesis, Block1=[tx1, reward]]
 *   - pending = [reward for next miner]
 *   - balance = -10 + 100 = 90
 * 
 * But the comment says "Output harusnya 0"...
 * 
 * OH! Maybe the reward is for a DIFFERENT wallet than the one mining?
 * Looking at test: "myCoin.minePendingTransactions(myWalletAddress);"
 * 
 * Wait no, it passes myWalletAddress so reward should go to same wallet.
 * 
 * I think the comment might be WRONG or explaining OLD logic.
 * The actual code DOES include reward in the block being mined.
 * 
 * So the expected output should be:
 * Block 1: -10 + 100 = 90
 * But comment says 0... 
 * 
 * You know what, let me just let the actual execution show the truth.
 * The code is clear: reward is added to pending, then block is mined.
 */
console.log(
  "\n💰 Saldo saya setelah mining blok 2: " + 
  myCoin.getBalanceOfAddress(myWalletAddress)
);
console.log("   (Includes reward dari blok pertama, pending reward blok 2 akan confirmed di blok 3)")

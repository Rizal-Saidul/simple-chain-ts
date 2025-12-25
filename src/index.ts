import { Blockchain, Transaction } from './Blockchain'; // Hapus .js
import elliptic from 'elliptic';
const EC = elliptic.ec;

// Inisialisasi Elliptic Curve (sama seperti Bitcoin)
const ec = new EC('secp256k1');

// --- LANGKAH 1: SETUP DOMPET UTAMA (USER) ---
// Buka file 'keygenerator.ts' yang tadi Anda jalankan, 
// salin PRIVATE KEY Anda dan tempel di bawah ini:
const myKey = ec.keyFromPrivate('PASTE_PRIVATE_KEY_ANDA_DISINI'); 

// Ambil alamat dompet (Public Key) dari Private Key tersebut
const myWalletAddress = myKey.getPublic('hex');

console.log('Dompet Saya:', myWalletAddress);

// --- LANGKAH 2: MULAI BLOCKCHAIN ---
const myCoin = new Blockchain();

// --- LANGKAH 3: MEMBUAT & MENANDATANGANI TRANSAKSI ---
// Anggap kita ingin kirim 10 koin ke Public Key orang lain
const tx1 = new Transaction(myWalletAddress, 'Public-Key-Penerima-Bebas', 10);

// Tanda tangani transaksi ini dengan Private Key kita!
// Tanpa baris ini, transaksi akan ditolak oleh Blockchain.
tx1.signTransaction(myKey);

// Masukkan ke Blockchain
console.log('\nMenambahkan transaksi ke mempool...');
myCoin.addTransaction(tx1);

// --- LANGKAH 4: MINING ---
console.log('\nMemulai mining...');
myCoin.minePendingTransactions(myWalletAddress);

// Cek Saldo (Harusnya 0, karena reward baru cair di blok berikutnya)
console.log('\nSaldo saya adalah: ' + myCoin.getBalanceOfAddress(myWalletAddress));

// Mining lagi agar reward sebelumnya cair
console.log('\nMining blok kedua...');
myCoin.minePendingTransactions(myWalletAddress);

console.log('\nSaldo saya adalah: ' + myCoin.getBalanceOfAddress(myWalletAddress));

// --- SKENARIO HACKER (OPSIONAL) ---
// Uncomment kode di bawah untuk melihat sistem keamanan bekerja
/*
console.log('\n--- Percobaan Meretas ---');
// Hacker mencoba mengubah jumlah koin dalam transaksi yang sudah valid
myCoin.chain[1].transactions[0].amount = 1000;
// Hacker mencoba menghitung ulang hash agar terlihat valid (tapi signature tetap invalid!)
myCoin.chain[1].hash = myCoin.chain[1].calculateHash();

console.log('Apakah chain valid? ' + myCoin.isChainValid()); 
// Output harusnya FALSE
*/
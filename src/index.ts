import { Blockchain, Transaction } from './Blockchain.js';

const myCoin = new Blockchain();

console.log('Membuat transaksi...');
myCoin.createTransaction(new Transaction('Alamat-Budi', 'Alamat-Andi', 50));
myCoin.createTransaction(new Transaction('Alamat-Andi', 'Alamat-Budi', 10));

console.log('\nMemulai mining (Miner: Saidul)...');
myCoin.minePendingTransactions('Alamat-Saidul');

console.log('\nSaldo Saidul sekarang: ' + myCoin.getBalanceOfAddress('Alamat-Saidul'));
// Output harusnya 0. Kenapa? Karena reward baru masuk "Pending" untuk blok berikutnya.

console.log('\nMemulai mining lagi (Miner: Saidul)...');
myCoin.minePendingTransactions('Alamat-Saidul');

console.log('\nSaldo Saidul sekarang: ' + myCoin.getBalanceOfAddress('Alamat-Saidul'));
// Output harusnya 100.
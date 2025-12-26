# 📖 API Documentation

Dokumentasi lengkap semua class, method, dan property dalam Simple Chain TS.

## Table of Contents

- [Block Class](#block-class)
- [Transaction Class](#transaction-class)
- [Blockchain Class](#blockchain-class)
- [Examples](#examples)

---

## Block Class

### Overview

Representasi satu blok dalam blockchain yang berisi list transaksi.

### Constructor

```typescript
new Block(timestamp: string, transactions: Transaction[], previousHash?: string)
```

**Parameters:**
- `timestamp` (string) - Waktu pembuatan blok
- `transactions` (Transaction[]) - Array transaksi dalam blok
- `previousHash` (string, optional) - Hash blok sebelumnya. Default: `""`

**Example:**
```typescript
import { Block } from "./Block";
import { Transaction } from "./Blockchain";

const tx = new Transaction("sender", "receiver", 10);
const block = new Block("2025-12-26", [tx], "0xabc123...");
```

---

### Properties

#### timestamp
```typescript
public timestamp: string
```
Waktu pembuatan blok (format string atau timestamp).

#### transactions
```typescript
public transactions: Transaction[]
```
Array transaksi yang ada di blok ini.

#### previousHash
```typescript
public previousHash: string
```
Hash dari blok sebelumnya. Ini yang membuat blockchain "linked".

#### hash
```typescript
public hash: string
```
Hash unik dari blok ini. Dihitung otomatis saat konstruktor atau mining.

#### nonce
```typescript
public nonce: number
```
Number Only Used Once - angka untuk Proof of Work. Di-increment saat mining.

---

### Methods

#### calculateHash()

```typescript
calculateHash(): string
```

Menghitung SHA-256 hash dari konten blok.

**Returns:** Hexadecimal string hash

**Example:**
```typescript
const block = new Block("2025-12-26", [], "0xabc123...");
const hash = block.calculateHash();
console.log(hash); // "0x1a2b3c4d..."
```

**Note:** Hash akan berbeda setiap kali jika nonce atau transaksi berubah.

---

#### mineBlock()

```typescript
mineBlock(difficulty: number): void
```

Melakukan Proof of Work mining sampai menemukan hash valid.

**Parameters:**
- `difficulty` (number) - Jumlah leading zeros yang diperlukan

**Example:**
```typescript
const block = new Block("2025-12-26", [], "0xabc123...");
block.mineBlock(2); // Cari hash dimulai dengan "00"
// Output: Block mined: 00a1b2c3d4e5f6...
```

**How it works:**
1. Loop increment `nonce`
2. Hitung `hash` baru dengan nonce baru
3. Cek apakah hash dimulai dengan required zeros
4. Stop jika found, else repeat

**Difficulty Guide:**
- Difficulty 2: ~100-150 iterations (sangat cepat)
- Difficulty 3: ~1000 iterations (< 1 detik)
- Difficulty 4: ~10000 iterations (beberapa detik)
- Difficulty 5: ~100000 iterations (puluhan detik)

---

#### hasValidTransactions()

```typescript
hasValidTransactions(): boolean
```

Memvalidasi bahwa semua transaksi dalam blok valid (signature terverifikasi).

**Returns:** `true` jika semua valid, `false` jika ada yang tidak valid

**Example:**
```typescript
const block = new Block("2025-12-26", [tx1, tx2], "0xabc123...");

if (block.hasValidTransactions()) {
  console.log("✅ Semua transaksi dalam blok valid");
} else {
  console.log("❌ Ada transaksi yang tidak valid!");
}
```

---

## Transaction Class

### Overview

Representasi transaksi dalam blockchain. Transaksi harus ditandatangani dengan private key pengirim untuk validity.

### Constructor

```typescript
new Transaction(
  fromAddress: string | null,
  toAddress: string,
  amount: number
)
```

**Parameters:**
- `fromAddress` (string | null) - Public key pengirim. `null` untuk mining reward
- `toAddress` (string) - Public key penerima
- `amount` (number) - Jumlah yang ditransfer

**Example:**
```typescript
import { Transaction } from "./Blockchain";

// Transaksi biasa
const tx = new Transaction(
  "0x123abc...", // Sender public key
  "0xdef456...", // Receiver public key
  50             // 50 koin
);

// Mining reward (tidak ada pengirim)
const reward = new Transaction(
  null,          // Tidak ada pengirim
  "0x789ghi...", // Miner address
  100            // Reward 100 koin
);
```

---

### Properties

#### fromAddress
```typescript
public fromAddress: string | null
```
Public key pengirim. `null` jika transaksi adalah mining reward.

#### toAddress
```typescript
public toAddress: string
```
Public key penerima.

#### amount
```typescript
public amount: number
```
Jumlah yang ditransfer.

#### signature
```typescript
public signature: string
```
Tanda tangan digital dari transaksi. Kosong (`""`) sampai `signTransaction()` dipanggil.

---

### Methods

#### calculateHash()

```typescript
calculateHash(): string
```

Menghitung hash transaksi berdasarkan dari, ke, dan amount.

**Returns:** Hexadecimal string hash

**Example:**
```typescript
const tx = new Transaction("sender", "receiver", 10);
const txHash = tx.calculateHash();
console.log(txHash); // "0x1a2b3c4d..."
```

---

#### signTransaction()

```typescript
signTransaction(signingKey: any): void
```

Menandatangani transaksi dengan private key pengirim.

**Parameters:**
- `signingKey` - Elliptic private key object (dari `ec.keyFromPrivate()`)

**Example:**
```typescript
import elliptic from "elliptic";

const ec = new elliptic.ec("secp256k1");
const myKey = ec.keyFromPrivate("private_key_hex...");

const tx = new Transaction(
  myKey.getPublic("hex"),  // Public key saya
  "0xdef456...",           // Receiver
  50
);

tx.signTransaction(myKey); // Sign dengan private key saya
```

**Throws:**
- `Error` - Jika `signingKey.getPublic()` != `fromAddress`

**Note:** Mining reward (`fromAddress = null`) tidak perlu di-sign.

---

#### isValid()

```typescript
isValid(): boolean
```

Memvalidasi bahwa transaksi memiliki signature yang sah.

**Returns:** `true` jika valid, `false` jika tidak

**Example:**
```typescript
const tx = new Transaction(senderKey.getPublic("hex"), receiver, 50);
tx.signTransaction(senderKey);

if (tx.isValid()) {
  console.log("✅ Transaksi valid");
} else {
  console.log("❌ Signature tidak valid");
}
```

**Throws:**
- `Error` - Jika transaksi tidak memiliki signature

**How it works:**
1. Mining reward otomatis return `true`
2. Untuk transaksi biasa, extract public key dari signature
3. Verify bahwa signature sesuai dengan konten transaksi
4. Jika ada perubahan pada data, signature verification gagal

---

## Blockchain Class

### Overview

Blockchain utama yang berisi chain blok-blok, management transaksi, mining, dan validasi.

### Constructor

```typescript
new Blockchain()
```

Otomatis membuat Genesis Block dan inisialisasi properties.

**Example:**
```typescript
import { Blockchain } from "./Blockchain";

const blockchain = new Blockchain();
// Chain: [Genesis Block]
// Difficulty: 2
// Pending Transactions: []
// Mining Reward: 100
```

---

### Properties

#### chain
```typescript
public chain: Block[]
```
Array semua blok dalam blockchain, dimulai dari Genesis Block.

#### difficulty
```typescript
public difficulty: number
```
Difficulty untuk Proof of Work. Default: `2` (leading zeros required).

#### pendingTransactions
```typescript
public pendingTransactions: Transaction[]
```
Array transaksi yang belum dimasukkan ke blok (mempool).

#### miningReward
```typescript
public miningReward: number
```
Reward untuk setiap blok yang berhasil ditambang. Default: `100` koin.

---

### Methods

#### createGenesisBlock()

```typescript
public createGenesisBlock(): Block
```

Membuat Genesis Block (blok pertama dalam blockchain).

**Returns:** Block dengan timestamp "22/12/2025" dan transaksi kosong

**Note:** Dipanggil otomatis di constructor.

---

#### getLatestBlock()

```typescript
getLatestBlock(): Block
```

Mendapatkan blok terakhir dalam blockchain.

**Returns:** Blok paling akhir di chain

**Example:**
```typescript
const blockchain = new Blockchain();
const latest = blockchain.getLatestBlock();
console.log(latest.hash);
```

**Throws:**
- `Error` - Jika blockchain kosong

---

#### minePendingTransactions()

```typescript
minePendingTransactions(miningRewardAddress: string): void
```

Mining semua transaksi pending dan membuat blok baru.

**Parameters:**
- `miningRewardAddress` (string) - Wallet address miner untuk menerima reward

**Process:**
1. Tambahkan mining reward ke pending transactions
2. Buat blok baru dengan semua pending transaksi
3. Link ke blok sebelumnya
4. Lakukan Proof of Work mining
5. Tambahkan blok ke chain
6. Reset pending transactions

**Example:**
```typescript
const blockchain = new Blockchain();

// Setup transaksi...
blockchain.addTransaction(tx);

// Mining
blockchain.minePendingTransactions("0xmineraddress...");
// Output: Block mined: 00a1b2c3d...
//         Block successfully mined!

// Sekarang transaksi confirmed
const balance = blockchain.getBalanceOfAddress("0xmineraddress...");
console.log(balance); // 100 (mining reward untuk blok pertama)
```

---

#### addTransaction()

```typescript
addTransaction(transaction: Transaction): void
```

Menambahkan transaksi ke mempool (pending transactions).

**Parameters:**
- `transaction` (Transaction) - Transaksi yang akan ditambahkan

**Validation:**
1. Harus memiliki `fromAddress` dan `toAddress`
2. Signature harus valid

**Throws:**
- `Error` - Jika alamat tidak lengkap atau signature tidak valid

**Example:**
```typescript
const blockchain = new Blockchain();
const tx = new Transaction(sender, receiver, 50);
tx.signTransaction(senderKey);

try {
  blockchain.addTransaction(tx);
  console.log("✅ Transaksi ditambahkan ke mempool");
} catch (error) {
  console.error("❌ Error:", error.message);
}
```

---

#### getBalanceOfAddress()

```typescript
getBalanceOfAddress(address: string): number
```

Menghitung total saldo wallet dari suatu address.

**Parameters:**
- `address` (string) - Wallet address

**Returns:** Number (saldo total, bisa negatif)

**Calculation:**
```
Balance = 0
For each block in blockchain:
  For each transaction in block:
    if (tx.from == address) balance -= tx.amount
    if (tx.to == address)   balance += tx.amount
```

**Example:**
```typescript
const balance = blockchain.getBalanceOfAddress(myAddress);
console.log("Saldo saya:", balance); // 150
```

**Note:** Tidak termasuk pending transactions.

---

#### isChainValid()

```typescript
isChainValid(): boolean
```

Memvalidasi bahwa blockchain saat ini tidak dimanipulasi.

**Returns:** `true` jika valid, `false` jika ada manipulasi

**Validation:**
1. Semua transaksi dalam setiap blok harus valid
2. Hash setiap blok harus match dengan calculateHash()
3. previousHash setiap blok harus match dengan hash blok sebelumnya

**Example:**
```typescript
// Blockchain normal
if (blockchain.isChainValid()) {
  console.log("✅ Blockchain aman");
}

// Jika ada yang ubah data
blockchain.chain[1].transactions[0].amount = 1000; // Ubah data

if (!blockchain.isChainValid()) {
  console.log("❌ Blockchain sudah dimanipulasi!");
}
```

---

#### replaceChain()

```typescript
replaceChain(newChain: Block[]): void
```

Mengganti blockchain saat ini dengan chain baru jika lebih panjang dan valid.

Ini mengimplementasikan Longest Chain Rule untuk konsensus P2P.

**Parameters:**
- `newChain` (Block[]) - Blockchain baru dari peer

**Validation:**
1. Harus lebih panjang dari chain saat ini
2. Harus valid (gunakan `isValidChain()`)

**Example:**
```typescript
// Receive blockchain dari peer
const receivedChain = receivedMessage.data;

blockchain.replaceChain(receivedChain);
// Output: "Rantai saat ini diganti dengan rantai baru yang lebih panjang"
// atau
// "Rantai baru tidak lebih panjang dari rantai saat ini"
// atau
// "rantai baru tidak valid"
```

---

#### isValidChain()

```typescript
isValidChain(chainToValidate: Block[]): boolean
```

Memvalidasi blockchain asing (dari peer lain).

Lebih strict dari `isChainValid()` karena reconstruct setiap blok dari JSON.

**Parameters:**
- `chainToValidate` (Block[]) - Blockchain yang akan divalidasi

**Returns:** `true` jika valid, `false` jika tidak

**Validation:**
1. Genesis Block harus identik
2. Reconstruct setiap blok dari JSON
3. Validasi semua transaksi
4. Cek hash integrity
5. Cek chain linking

**Example:**
```typescript
const receivedChain = message.data;
const isValid = blockchain.isValidChain(receivedChain);

if (isValid) {
  console.log("✅ Chain dari peer valid");
  blockchain.replaceChain(receivedChain);
}
```

---

## Examples

### Example 1: Basic Blockchain

```typescript
import { Blockchain, Transaction } from "./Blockchain";

// Create blockchain
const bc = new Blockchain();

// Add transaction
const tx = new Transaction("sender", "receiver", 50);
// Note: tanpa signature, jadi akan error. Lihat contoh dengan signature.

bc.minePendingTransactions("miner");
```

### Example 2: Transaksi dengan Signature

```typescript
import { Blockchain, Transaction } from "./Blockchain";
import elliptic from "elliptic";

const ec = new elliptic.ec("secp256k1");

// Create wallet
const myKey = ec.keyFromPrivate("e565d5baf07498ca41612fd70360d1af5b5981003bd32cfbe0233c310e7e6d22");
const myAddress = myKey.getPublic("hex");

// Create blockchain
const bc = new Blockchain();

// Create & sign transaction
const tx = new Transaction(myAddress, "0xreceiveraddress...", 50);
tx.signTransaction(myKey);

// Add to blockchain
bc.addTransaction(tx);

// Mining
bc.minePendingTransactions(myAddress);

// Check balance
const balance = bc.getBalanceOfAddress(myAddress);
console.log("Balance:", balance);
```

### Example 3: Validasi Blockchain

```typescript
const bc = new Blockchain();

// Setup transaksi & mining...

// Validate blockchain
console.log("Valid?", bc.isChainValid()); // true

// Hacker ubah data
bc.chain[1].transactions[0].amount = 9999;

console.log("Valid setelah ubah?", bc.isChainValid()); // false ✓
```

### Example 4: P2P Sinkronisasi

```typescript
const node1 = new Blockchain();
const node2 = new Blockchain();

// Node 1 mining blok
node1.minePendingTransactions("miner1");

// Node 2 terima blockchain dari node 1
const receivedChain = node1.chain;

// Cek validity
if (node2.isValidChain(receivedChain)) {
  // Replace blockchain jika lebih panjang
  node2.replaceChain(receivedChain);
  console.log("✅ Node 2 updated dengan blockchain dari Node 1");
}
```

---

## Type Definitions

### MessageType Enum

```typescript
enum MessageType {
  CHAIN = "CHAIN",
  REQUEST_CHAIN = "REQUEST_CHAIN"
}
```

Tipe pesan untuk P2P network communication.

### Message Interface

```typescript
interface Message {
  type: MessageType;
  data: any;
}
```

Format pesan yang dikirim antar node.

---

## Best Practices

1. **Selalu sign transaksi** sebelum add ke blockchain
2. **Validasi signature** sebelum accept transaksi
3. **Cek chain validity** sebelum update blockchain
4. **Simpan private key** dengan aman, jangan di-hardcode
5. **Adjust difficulty** sesuai kebutuhan keamanan

---

**Last Updated**: 26 Dec 2025

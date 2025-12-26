# 🏗️ Arsitektur Simple Chain TS

Dokumentasi lengkap tentang struktur, desain, dan cara kerja blockchain ini.

## 📚 Daftar Isi

1. [Overview](#overview)
2. [Struktur Direktori](#struktur-direktori)
3. [Komponen Utama](#komponen-utama)
4. [Alur Kerja](#alur-kerja)
5. [Konsep Kriptografi](#konsep-kriptografi)
6. [Konsensus & Mining](#konsensus--mining)
7. [P2P Network](#p2p-network)

---

## Overview

**Simple Chain TS** adalah simulasi blockchain sederhana yang mengimplementasikan:

✅ **Cryptographic Hashing** - SHA-256 untuk integritas data  
✅ **Digital Signatures** - Elliptic Curve (secp256k1) untuk otorisasi transaksi  
✅ **Proof of Work** - Mining untuk keamanan blockchain  
✅ **Chain Validation** - Deteksi manipulasi data  
✅ **P2P Network** - Sinkronisasi blockchain antar node  
✅ **Consensus** - Longest Chain Rule untuk konvergensi  

---

## Struktur Direktori

```
simple-chain-ts/
├── src/
│   ├── Block.ts          # Definisi class Block (satu blok dalam blockchain)
│   ├── Blockchain.ts     # Class Blockchain + Transaction (rantai + transaksi)
│   ├── index.ts          # Script demo - transaksi + mining lokal
│   ├── p2p.ts            # P2P network node dengan WebSocket
│   └── elliptic.d.ts     # Type definitions untuk library elliptic
├── package.json          # Dependencies & scripts
├── tsconfig.json         # TypeScript configuration
├── README.md             # Quick start guide
└── ARCHITECTURE.md       # File ini - dokumentasi lengkap
```

---

## Komponen Utama

### 1. Block.ts - Struktur Blok

```
┌─────────────────────────────────────────┐
│              BLOCK                      │
├─────────────────────────────────────────┤
│ timestamp: string                       │  Waktu pembuatan
│ transactions: Transaction[]             │  Daftar transaksi
│ previousHash: string                    │  Hash blok sebelumnya
│ hash: string                            │  Hash blok ini
│ nonce: number                           │  Angka untuk Proof of Work
├─────────────────────────────────────────┤
│ calculateHash()                         │  Hitung SHA-256 hash
│ mineBlock(difficulty)                   │  Lakukan Proof of Work
│ hasValidTransactions()                  │  Validasi semua transaksi
└─────────────────────────────────────────┘
```

**Diagram Hash Chain:**
```
Block 0 (Genesis)
├─ timestamp: "22/12/2025"
├─ previousHash: "0"
├─ hash: 0xabc123...
│
└─> Block 1
    ├─ timestamp: "22/12/2025 10:00"
    ├─ previousHash: 0xabc123... (← linked dari Block 0)
    ├─ hash: 0xdef456...
    │
    └─> Block 2
        ├─ previousHash: 0xdef456... (← linked dari Block 1)
        ├─ hash: 0xghi789...
```

### 2. Blockchain.ts - Rantai & Transaksi

#### Transaction Class

```
┌──────────────────────────────────┐
│       TRANSACTION                │
├──────────────────────────────────┤
│ fromAddress: string | null       │  Public key pengirim
│ toAddress: string                │  Public key penerima
│ amount: number                   │  Jumlah yang dikirim
│ signature: string                │  Tanda tangan digital
├──────────────────────────────────┤
│ calculateHash()                  │  Hash transaksi
│ signTransaction(key)             │  Tanda tangan dengan private key
│ isValid()                        │  Verifikasi signature
└──────────────────────────────────┘
```

**Alur Transaksi:**
```
1. Buat Transaksi
   tx = new Transaction(senderAddress, receiverAddress, amount)

2. Tanda Tangan (Sign)
   tx.signTransaction(senderPrivateKey)
   
   Proses:
   - Hash transaksi: SHA256(from + to + amount)
   - Sign hash dengan private key
   - Simpan signature (bukti)

3. Validasi Signature
   if (tx.isValid()) ✅ Valid
   
   Proses:
   - Ekstrak public key dari signature
   - Verify signature match dengan data transaksi
   - Jika data berubah, signature gagal

4. Tambahkan ke Mempool
   blockchain.addTransaction(tx)
   
   Validasi:
   - Cek alamat lengkap
   - Cek signature valid
   - Masukkan ke pending transactions

5. Mining - Masuk ke Blok
   blockchain.minePendingTransactions(minerAddress)
   
   Transaksi sekarang confirmed dalam blockchain
```

#### Blockchain Class

```
┌──────────────────────────────────────────┐
│       BLOCKCHAIN                         │
├──────────────────────────────────────────┤
│ chain: Block[]                           │  Array blok
│ difficulty: number                       │  Mining difficulty (default: 2)
│ pendingTransactions: Transaction[]       │  Mempool transaksi
│ miningReward: number                     │  Reward per blok (default: 100)
├──────────────────────────────────────────┤
│ createGenesisBlock()                     │  Buat blok pertama
│ getLatestBlock()                         │  Ambil blok terakhir
│ minePendingTransactions(address)         │  Mining & add blok
│ addTransaction(tx)                       │  Validasi & queue transaksi
│ getBalanceOfAddress(address)             │  Hitung saldo wallet
│ isChainValid()                           │  Validasi blockchain
│ replaceChain(newChain)                   │  Update blockchain (P2P)
│ isValidChain(chain)                      │  Validasi chain asing
└──────────────────────────────────────────┘
```

---

## Alur Kerja

### A. Membuat & Mining Transaksi

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: Generate Wallet (Key Pair)                      │
├─────────────────────────────────────────────────────────┤

const myKey = ec.keyFromPrivate("...private_key_hex...");
const myAddress = myKey.getPublic("hex");

  myKey ─┬─> Public Key (wallet address)
         └─> Private Key (untuk sign transaksi)

┌─────────────────────────────────────────────────────────┐
│ STEP 2: Buat Transaksi                                  │
├─────────────────────────────────────────────────────────┤

const tx = new Transaction(
  senderAddress,      // Public key saya
  receiverAddress,    // Public key penerima
  amount              // Jumlah
);

Belum valid! Butuh signature.

┌─────────────────────────────────────────────────────────┐
│ STEP 3: Tanda Tangan Transaksi (Sign)                   │
├─────────────────────────────────────────────────────────┤

tx.signTransaction(myKey);

Proses:
1. Hash = SHA256("sender" + "receiver" + "amount")
2. Signature = SIGN(Hash, myPrivateKey)
3. Sekarang tx.signature berisi tanda tangan

Signature = bukti bahwa pemilik private key authorize transaksi ini

┌─────────────────────────────────────────────────────────┐
│ STEP 4: Tambahkan ke Mempool                            │
├─────────────────────────────────────────────────────────┤

blockchain.addTransaction(tx);

Validasi dalam addTransaction():
✓ Cek fromAddress & toAddress ada
✓ Cek tx.isValid() - verify signature
✓ Jika OK, masukkan ke pendingTransactions array

Jika ada yang tidak valid:
✗ Throw error, transaksi ditolak

┌─────────────────────────────────────────────────────────┐
│ STEP 5: Mining                                          │
├─────────────────────────────────────────────────────────┤

blockchain.minePendingTransactions(minerAddress);

Proses:
1. Buat mining reward transaksi (from=null, to=miner, amount=100)
2. Tambahkan ke pending
3. Buat Block baru dengan semua pending transaksi
4. Lakukan Proof of Work (mining):
   - Loop: increment nonce, hitung hash
   - Stop: jika hash dimulai dengan "00" (difficulty=2)
5. Add block ke chain
6. Reset pending untuk blok berikutnya

Result:
- Blok baru ada di blockchain, permanent
- Transaksi sekarang "confirmed"
- Miner dapat reward 100 koin (pending untuk blok berikutnya)

┌─────────────────────────────────────────────────────────┐
│ STEP 6: Cek Saldo                                       │
├─────────────────────────────────────────────────────────┤

balance = blockchain.getBalanceOfAddress(myAddress);

Menghitung:
for each block in blockchain:
    for each transaction in block:
        if (tx.from == myAddress) balance -= tx.amount
        if (tx.to == myAddress)   balance += tx.amount

Total = output yang saya buat + input yang saya terima
```

### B. Validasi Blockchain

```
┌──────────────────────────────────────────────────────┐
│ Skenario: Data diubah (Hacker mencoba manipulasi)    │
└──────────────────────────────────────────────────────┘

1. Original Data
   Block 1: {amount: 10, hash: "0x123abc..."}

2. Hacker ubah data
   Block 1: {amount: 1000, hash: "0x123abc..."} ← hash tidak update

3. Validasi isChainValid()
   ✓ Cek hash:
     - calculateHash() dengan amount baru = "0xdef456..."
     - Original hash = "0x123abc..."
     - ❌ Tidak cocok! Manipulasi terdeteksi

   ✓ Cek chain linking:
     - Jika Block 2 punya previousHash = "0x123abc..."
     - Tapi Block 1 hash sekarang = "0xdef456..."
     - ❌ Chain putus! Manipulasi terdeteksi

Result: isChainValid() returns FALSE
Blockchain tidak valid, perubahan terdeteksi!
```

---

## Konsep Kriptografi

### 1. SHA-256 Hashing

```
Input: "Hello World"
↓ (SHA-256)
Output: a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146

Properti:
✓ Deterministic: Input sama → Output sama
✓ One-way: Hash → Input TIDAK BISA
✓ Avalanche: Ubah 1 bit input → Hash berubah drastis
✓ Fast: Cepat dihitung
✓ Collision-resistant: Sangat sulit cari 2 input dengan hash sama

Penggunaan:
- Block hash: SHA256(previousHash + timestamp + transactions + nonce)
- Transaction hash: SHA256(from + to + amount)
```

### 2. Digital Signature (ECDSA - secp256k1)

```
┌──────────────────────────────────┐
│ KEY GENERATION                   │
├──────────────────────────────────┤

Private Key: Random 256-bit number
  "e565d5baf07498ca41612fd70360d1af5b5981003bd32cfbe0233c310e7e6d22"

Public Key: Generated dari private key (Elliptic Curve math)
  "0425b698c82981b38de8b98a22f919e3dc60e0ba0250c57903bc2af6234389a6..."

Properti:
✓ Private Key → Public Key (one-way, tidak bisa reverse)
✓ Public Key dapat dibagikan (wallet address)
✓ Private Key RAHASIA (jangan bagikan!)
✓ Dengan private key, bisa sign apa saja
✓ Dengan public key, bisa verify signature

┌──────────────────────────────────┐
│ SIGNING (dengan Private Key)     │
├──────────────────────────────────┤

1. Hash data: H = SHA256(data)
2. Sign: Signature = SIGN(H, privateKey)
3. Result: Signature (asimetris, unique untuk data+key)

Contoh:
  Data: "Transfer 10 koin"
  Signature: SIGN(SHA256(data), myPrivateKey)
            = "304402207a9f..."
  
  Hanya pemilik private key yang bisa buat signature ini

┌──────────────────────────────────┐
│ VERIFYING (dengan Public Key)    │
├──────────────────────────────────┤

1. Receiver punya: data, signature, myPublicKey
2. Verify: VERIFY(data, signature, myPublicKey)
3. Result: true/false

Jika data berubah sedikit saja:
  - Hash baru berbeda
  - Signature verification GAGAL
  - Proof data sudah dimanipulasi

Contoh:
  Data: "Transfer 10 koin"
  Signature: "304402207a9f..."
  Public Key: "0425b698..."
  
  VERIFY(data, signature, publicKey) = TRUE ✓
  
  Tapi jika data berubah:
  Data: "Transfer 1000 koin" ← ubah
  VERIFY(data, signature, publicKey) = FALSE ✗
```

---

## Konsensus & Mining

### Proof of Work (Mining)

```
┌─────────────────────────────────────────────┐
│ MINING PROCESS - Cari Hash dengan Zeros     │
└─────────────────────────────────────────────┘

Difficulty = 2 (require 2 leading zeros = "00...")

Block Data:
├─ previousHash: "0x123abc..."
├─ timestamp: "2025-12-26"
├─ transactions: [tx1, tx2]
└─ nonce: 0

Round 1:
  nonce = 1
  hash = SHA256(previousHash + timestamp + txs + 1)
       = "0x3f4d6e8..." ← Tidak dimulai dengan "00"
  ✗ Coba lagi

Round 2:
  nonce = 2
  hash = SHA256(previousHash + timestamp + txs + 2)
       = "0x7a9d2e1..." ← Tidak dimulai dengan "00"
  ✗ Coba lagi

...

Round 156:
  nonce = 156
  hash = SHA256(previousHash + timestamp + txs + 156)
       = "0x0042e5f..." ← Dimulai dengan "00" ✓
  ✓ MINED! Simpan block dengan hash ini

Statistik:
- Difficulty 2: ~100-150 attempts rata-rata
- Difficulty 3: ~1000-1500 attempts
- Difficulty 4: ~10000-15000 attempts
- Bitcoin (difficulty ~67 million): Komputasi massive!

Keuntungan:
✓ Proses mining butuh kerja komputasi → costly to attack
✓ Semakin tinggi difficulty, semakin aman
✓ Kontrol kecepatan block creation dengan difficulty
```

### Longest Chain Rule

```
Skenario: Node menerima blockchain dari peer lain

Node A blockchain:
  Block 0 → Block 1 → Block 2 (length = 3)

Node B broadcast blockchain:
  Block 0 → Block 1 → Block 2 → Block 3 → Block 4 (length = 5)

Keputusan di Node A:
  if (B.length > A.length AND B.isValid()) {
    A.chain = B.chain  // Replace dengan chain lebih panjang
  }

Alasan:
✓ Chain lebih panjang = lebih banyak work dilakukan
✓ Valid = tidak ada manipulasi
✓ Jadi paling aman untuk adopt
✓ Semua node konverge ke versi yang sama
```

---

## P2P Network

### Arsitektur P2P

```
┌──────────────────────────────────────────────────────┐
│                  P2P NETWORK                         │
├──────────────────────────────────────────────────────┤

    ┌─────────────┐         ┌─────────────┐
    │  Node 1     │         │  Node 2     │
    │ Port: 5001  │◄──────► │ Port: 5002  │
    └─────────────┘         └─────────────┘
         ▲                        ▲
         │                        │
         │   WebSocket Conn.      │
         │                        │
         └────────────┬───────────┘
                      │
                      ▼
              ┌─────────────────┐
              │  Node 3         │
              │  Port: 5003     │
              └─────────────────┘

Komunikasi:
- Node connect satu sama lain via WebSocket
- Setiap node = server (terima koneksi) + client (inisiasi koneksi)
- Decentralized: tidak ada central server
```

### Message Flow

```
┌─────────────────────────────────────────────────────┐
│ REQUEST_CHAIN MESSAGE                               │
├─────────────────────────────────────────────────────┤

Node A → Node B: "Kirim blockchain mu!"

{
  "type": "REQUEST_CHAIN",
  "data": null
}

Tujuan: Sinkronisasi awal, minta blockchain terbaru

┌─────────────────────────────────────────────────────┐
│ CHAIN MESSAGE                                       │
├─────────────────────────────────────────────────────┤

Node B → Node A: "Ini blockchain ku"

{
  "type": "CHAIN",
  "data": [
    {blocks...},
    {blocks...},
    {blocks...}
  ]
}

Tujuan: Share blockchain untuk sinkronisasi + update
```

### Mining & Broadcasting

```
Setiap 10 detik di setiap node:

┌───────────────────────────────────┐
│ Node X melakukan mining           │
├───────────────────────────────────┤

1. minePendingTransactions()
   - Buat block baru
   - Lakukan Proof of Work
   - Add ke chain

2. Broadcasting
   Kirim blockchain terbaru ke SEMUA peers

   Node X → Node Y: CHAIN msg dengan blockchain terbaru
   Node X → Node Z: CHAIN msg dengan blockchain terbaru

3. Peers menerima & update
   Node Y: Terima blockchain dari X
           if (X.length > Y.length && X.isValid()) {
             Y.chain = X.chain  // Update
           }

Hasilnya:
✓ Semua node punya blockchain yang sama (eventually)
✓ Blockchain terus berkembang dengan blok baru
✓ Mining reward distributed antar nodes
✓ Decentralized, tidak ada single point of failure
```

---

## Keamanan

### Proteksi terhadap Serangan

| Serangan | Perlindungan | Mekanisme |
|----------|-------------|-----------|
| **Data Tampering** | ✓ Deteksi | Hash mismatch, chain validation |
| **Signature Forgery** | ✓ Deteksi | ECDSA verification |
| **Chain Rewrite** | ✓ Deteksi | previousHash linking, Proof of Work |
| **Double Spend** | ~ Partial | Transaction ordering (bisa improve) |
| **51% Attack** | ~ Vulnerable | Difficulty dapat di-increase |
| **Network Partitioning** | ~ Vulnerable | Longest chain rule helps recovery |

### Best Practices

1. **Private Key** - JANGAN PERNAH BAGIKAN
2. **Signature Validation** - Selalu cek sebelum accept transaksi
3. **Chain Validation** - Validasi sebelum adopting blockchain baru
4. **Difficulty Setting** - Adjust sesuai keamanan yang diinginkan

---

## Referensi & Konsep Lanjutan

- **SHA-256**: Cryptographic hash function
- **ECDSA**: Elliptic Curve Digital Signature Algorithm
- **secp256k1**: Kurva elliptic yang digunakan Bitcoin
- **Merkle Tree**: Bisa implement untuk efisiensi (belum di project ini)
- **Smart Contracts**: Bisa add untuk programmable transactions
- **Sharding**: Untuk scalability (future enhancement)

---

## Cara Menjalankan

### Local Demo
```bash
npm install
npm start
# Output: Blockchain dengan mining, transaksi signed, balance calculation
```

### P2P Network
```bash
# Terminal 1
npx ts-node src/p2p.ts

# Terminal 2  
P2P_PORT=5002 PEERS=ws://localhost:5001 npx ts-node src/p2p.ts

# Terminal 3
P2P_PORT=5003 PEERS=ws://localhost:5001,ws://localhost:5002 npx ts-node src/p2p.ts
```

---

**Author**: Saidul Rizal  
**License**: ISC  
**Last Updated**: 26 Dec 2025

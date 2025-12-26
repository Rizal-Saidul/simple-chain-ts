# Simple Chain TS 🔗

> A fundamental Blockchain simulation written in TypeScript to demonstrate cryptographic security, digital signatures, Proof of Work, and P2P network synchronization.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Blockchain](https://img.shields.io/badge/Blockchain-0052CC?style=for-the-badge&logo=blockchain&logoColor=white)

## 📖 About The Project

**Simple Chain TS** adalah simulasi blockchain edukatif yang mengimplementasikan konsep-konsep fundamental blockchain tanpa library eksternal. Perfect untuk belajar cara kerja cryptocurrency dan blockchain dari ground up.

### 🎯 Core Features

| Feature | Status | Description |
|---------|--------|-------------|
| **SHA-256 Hashing** | ✅ | Cryptographic hash untuk immutability |
| **Digital Signatures** | ✅ | ECDSA (secp256k1) untuk otorisasi transaksi |
| **Proof of Work** | ✅ | Mining dengan difficulty adjustment |
| **Chain Validation** | ✅ | Deteksi manipulasi & broken links |
| **Wallet System** | ✅ | Private/Public key generation |
| **Transaction Mempool** | ✅ | Pending transactions management |
| **P2P Network** | ✅ | WebSocket-based node synchronization |
| **Consensus** | ✅ | Longest Chain Rule implementation |

## 📚 Documentation

Dokumentasi lengkap tersedia dalam beberapa file:

- **[QUICK_START.md](./QUICK_START.md)** - Panduan cepat untuk memulai (⭐ Baca ini dulu!)
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Dokumentasi detail arsitektur & konsep
- **[API.md](./API.md)** - Dokumentasi lengkap semua class dan method
- **[src/Block.ts](./src/Block.ts)** - JSDoc detil untuk Block class
- **[src/Blockchain.ts](./src/Blockchain.ts)** - JSDoc detil untuk Blockchain & Transaction class
- **[src/index.ts](./src/index.ts)** - Demo script dengan dokumentasi step-by-step
- **[src/p2p.ts](./src/p2p.ts)** - P2P network implementation dengan dokumentasi

## 🚀 Quick Start

### Installation

```bash
git clone https://github.com/Rizal-Saidul/simple-chain-ts.git
cd simple-chain-ts
npm install
```

### Run Local Demo

```bash
npm start
```

**Output:**
```
🔐 Dompet Saya: 0425b698c82981b38de8b98a22f919e3...

📝 Menambahkan transaksi ke mempool...

⛏️  Memulai mining blok pertama...
Block mined: 0041c1df8aa439afc28d186d5a645c90ff6302b855b...
Block successfully mined!

💰 Saldo saya setelah mining blok 1: 90
💰 Saldo saya setelah mining blok 2: 190
```

### Run P2P Network (3 Nodes)

**Terminal 1:**
```bash
npx ts-node src/p2p.ts
```

**Terminal 2:**
```bash
P2P_PORT=5002 PEERS=ws://localhost:5001 npx ts-node src/p2p.ts
```

**Terminal 3:**
```bash
P2P_PORT=5003 PEERS=ws://localhost:5001,ws://localhost:5002 npx ts-node src/p2p.ts
```

Nodes akan saling sinkronisasi blockchain secara otomatis! ✨

## 🎓 Learning Path

### Level 1: Pemula
1. Baca [QUICK_START.md](./QUICK_START.md) ✅
2. Jalankan `npm start` dan pahami output
3. Baca dokumentasi di `index.ts`

### Level 2: Intermediate
1. Baca [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Pahami konsep: hashing, signing, mining
3. Jalankan P2P network dengan 2-3 nodes

### Level 3: Advanced
1. Baca [API.md](./API.md) untuk detail semua method
2. Modifikasi difficulty, reward, interval mining
3. Eksperimen dengan simulasi attack

## 🏗️ Project Structure

```
simple-chain-ts/
├── src/
│   ├── Block.ts              # 📦 Block class dengan mining
│   ├── Blockchain.ts         # 🔗 Blockchain & Transaction classes
│   ├── index.ts              # 🎬 Local demo script
│   ├── p2p.ts                # 🌐 P2P network node
│   └── elliptic.d.ts         # 📝 Type definitions
├── QUICK_START.md            # ⚡ Start here!
├── ARCHITECTURE.md           # 📚 Detailed architecture
├── API.md                    # 📖 API reference
├── README-OLD.md             # Original README
└── package.json              # Dependencies
```

## 🔑 Key Concepts

### 1. Wallet (Key Pair)

```typescript
// Generate private/public key pair
const myKey = ec.keyFromPrivate("...hex...");
const myAddress = myKey.getPublic("hex");

// Hanya private key bisa sign transaksi
// Public key bisa dibagikan sebagai wallet address
```

### 2. Digital Signature

```typescript
// Create & sign transaction
const tx = new Transaction(sender, receiver, 50);
tx.signTransaction(senderPrivateKey); // 🔏 Sign

// Validate signature
if (tx.isValid()) {
  blockchain.addTransaction(tx); // ✅ Accepted
}
```

### 3. Proof of Work Mining

```typescript
// Mining: cari nonce hingga hash valid
block.mineBlock(difficulty); // Difficulty = 2 (hash dimulai "00")

// Output: Block mined: 00a1b2c3d4e5f6...
```

### 4. Chain Validation

```typescript
// Detect any manipulation
if (blockchain.isChainValid()) {
  console.log("✅ Blockchain aman");
} else {
  console.log("❌ Ada manipulasi!");
}
```

## 📊 Skenario Demo

### Local Demo (index.ts)

1. Generate wallet dengan ECDSA key pair
2. Buat transaksi → tanda tangan dengan private key
3. Tambahkan ke mempool → blockchain validasi signature
4. Mining blok pertama → Proof of Work
5. Cek saldo → transaksi confirmed
6. Mining blok kedua → reward dari blok 1 confirmed
7. Cek saldo total

### P2P Network Demo

1. Node 1 mulai mining & broadcasting
2. Node 2 & 3 connect ke Node 1 → request blockchain
3. Nodes menerima blockchain → validasi & sinkronisasi
4. Setiap 10 detik semua nodes mining & broadcast
5. Semua nodes converge ke blockchain yang sama ✨

## 🔒 Security Features

| Aspek | Perlindungan | Mekanisme |
|-------|-------------|-----------|
| **Data Integrity** | ✅ | SHA-256 hash, hash linking |
| **Transaction Authenticity** | ✅ | ECDSA digital signature |
| **Chain Integrity** | ✅ | previousHash validation |
| **Proof of Work** | ✅ | Mining dengan difficulty |
| **Immutability** | ✅ | Chain validation detects tampering |

## 🛠️ Tech Stack

- **Language:** TypeScript 5.9+
- **Runtime:** Node.js 16+
- **Cryptography:** 
  - SHA-256 via `crypto-js`
  - ECDSA via `elliptic` (secp256k1)
- **Networking:** WebSocket via `ws`
- **Build:** ts-node for ESM support

## 📦 Dependencies

```json
{
  "dependencies": {
    "crypto-js": "^4.2.0",
    "elliptic": "^6.5.5",
    "ws": "^8.x"
  },
  "devDependencies": {
    "typescript": "^5.9.3",
    "ts-node": "^10.9.2",
    "@types/node": "^25.0.3",
    "@types/crypto-js": "^4.2.2"
  }
}
```

## 📖 References & Resources

- **Bitcoin Whitepaper**: https://bitcoin.org/bitcoin.pdf
- **Ethereum Yellow Paper**: https://ethereum.org/en/developers/docs/
- **Elliptic Curve Cryptography**: https://en.wikipedia.org/wiki/Elliptic-curve_cryptography
- **ECDSA**: https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm
- **WebSocket**: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket

## 🎯 Use Cases

- 🎓 **Pendidikan**: Belajar blockchain dari fundamental
- 🔬 **Research**: Testing blockchain concepts
- 🏗️ **Prototyping**: Basis untuk custom blockchain
- 🧪 **Experiment**: Simulasi attack & consensus

## 🚀 Future Enhancements

- [ ] Merkle Tree untuk efisiensi transaksi
- [ ] Smart Contracts dengan VM sederhana
- [ ] Stake Proof (PoS) sebagai alternatif PoW
- [ ] Sharding untuk scalability
- [ ] State Channels untuk off-chain transactions
- [ ] REST API & Web UI
- [ ] Transaction fee mechanism
- [ ] Difficulty adjustment algorithm

## ⚖️ License

ISC License - Free untuk educational purposes

## 👨‍💻 Author

**Saidul Rizal**  
Aspiring Web3 Backend Developer  
GitHub: [@Rizal-Saidul](https://github.com/Rizal-Saidul)

---

## 📝 Catatan Penting

Project ini **hanya untuk pembelajaran**. Jangan gunakan untuk production cryptocurrency!

Untuk blockchain production-ready, gunakan:
- **Bitcoin**: https://github.com/bitcoin/bitcoin
- **Ethereum**: https://github.com/ethereum/go-ethereum
- **Libra**: https://github.com/diem/diem

---

**Happy Learning! 🎉**

Punya pertanyaan? Baca dokumentasi di atas atau buka issue di GitHub.

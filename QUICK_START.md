# 🚀 Quick Start Guide

Panduan cepat untuk menjalankan dan memahami Simple Chain TS.

## 📋 Prerequisites

- Node.js v16+ 
- npm atau yarn
- Terminal/Command line

## ⚡ Installation

```bash
# Clone repository
git clone https://github.com/Rizal-Saidul/simple-chain-ts.git
cd simple-chain-ts

# Install dependencies
npm install

# Atau jika menggunakan yarn
yarn install
```

## 🎯 3 Cara Menjalankan

### 1️⃣ **Local Blockchain Demo** (Rekomendasi untuk Pemula)

Mendemonstrasikan blockchain dengan transaksi signed dan mining lokal.

```bash
npm start
```

**Output yang diharapkan:**
```
🔐 Dompet Saya: 0425b698c82981b38de8b98a22f919e3dc60e0ba...

📝 Menambahkan transaksi ke mempool...

⛏️  Memulai mining blok pertama...
Block mined: 0041c1df8aa439afc28d186d5a645c90ff6302b855b...
Block successfully mined!

💰 Saldo saya setelah mining blok 1: 90
   (Reward mining belum confirmed, tunggu blok berikutnya)

⛏️  Memulai mining blok kedua...
Block mined: 00b37af4912f161207a6da3d48216b5bbc396fc76...
Block successfully mined!

💰 Saldo saya setelah mining blok 2: 190
   (Includes reward dari blok pertama, pending reward blok 2 akan confirmed di blok 3)
```

**Yang terjadi:**
1. Generate wallet (private & public key)
2. Buat transaksi → tanda tangan dengan private key
3. Tambahkan ke mempool → validasi signature
4. Mining blok pertama → Proof of Work
5. Cek saldo → transaksi confirmed
6. Mining blok kedua → reward dari blok 1 sekarang confirmed
7. Cek saldo total

---

### 2️⃣ **Single P2P Node**

Jalankan satu node yang menjalankan mining otomatis.

```bash
npx ts-node src/p2p.ts
```

**Output yang diharapkan:**
```
✅ Node berjalan di port 5001
📡 Menunggu koneksi dari peer...

⛏️ Mining blok baru di node ini...
Block mined: 0041c1df8aa439afc28d186d5a645c90ff...
Block successfully mined!
📢 Broadcasting blockchain terbaru ke semua peer...
✅ Broadcast selesai
```

**Yang terjadi:**
- Server WebSocket berjalan di port 5001
- Mining otomatis setiap 10 detik
- Siap menerima koneksi dari peer lain

---

### 3️⃣ **Multi-Node P2P Network** (Advanced)

Setup jaringan 3 nodes yang saling sinkronisasi blockchain.

#### Terminal 1 - Node 1 (Port 5001)
```bash
npx ts-node src/p2p.ts
```

#### Terminal 2 - Node 2 (Port 5002) - Connect ke Node 1
```bash
P2P_PORT=5002 PEERS=ws://localhost:5001 npx ts-node src/p2p.ts
```

#### Terminal 3 - Node 3 (Port 5003) - Connect ke Node 1 & 2
```bash
P2P_PORT=5003 PEERS=ws://localhost:5001,ws://localhost:5002 npx ts-node src/p2p.ts
```

**Output yang diharapkan:**

```
# Terminal 1
✅ Node berjalan di port 5001
📡 Menunggu koneksi dari peer...
🔗 Terhubung ke peer baru (Total peers: 1)
🔗 Terhubung ke peer baru (Total peers: 2)

⛏️ Mining blok baru di node ini...
Block mined: 0041c1df...
Block successfully mined!
📢 Broadcasting blockchain terbaru ke semua peer...
✅ Broadcast selesai

# Terminal 2
✅ Node berjalan di port 5002
📡 Menunggu koneksi dari peer...
📥 Peer meminta blockchain kami
📢 Broadcasting blockchain terbaru ke semua peer...

# Terminal 3
✅ Node berjalan di port 5003
📡 Menunggu koneksi dari peer...
📥 Menerima blockchain dari peer. Panjang: 1
```

**Yang terjadi:**
1. Node 1 mulai mining → create blok
2. Node 2 & 3 connect ke Node 1 → request blockchain
3. Node 1 broadcast blockchain → Node 2 & 3 menerima
4. Semua nodes punya blockchain yang sama ✅
5. Setiap 10 detik, blockchain di-update & disync

---

## 📁 File Structure

| File | Deskripsi |
|------|-----------|
| `src/Block.ts` | Class Block - satu blok dalam blockchain |
| `src/Blockchain.ts` | Class Blockchain + Transaction - rantai & transaksi |
| `src/index.ts` | Demo lokal - transaksi + mining |
| `src/p2p.ts` | P2P Network node - WebSocket + sinkronisasi |
| `package.json` | Dependencies & build scripts |
| `tsconfig.json` | TypeScript configuration |

---

## 🔑 Key Concepts

### 1. Wallet (Key Pair)
```typescript
import elliptic from "elliptic";

const ec = new elliptic.ec("secp256k1");
const myKey = ec.keyFromPrivate("private_key_hex");
const myAddress = myKey.getPublic("hex");

// myAddress bisa dibagikan (wallet address)
// myKey JANGAN dibagikan (private key untuk sign transaksi)
```

### 2. Transaksi Ditandatangani
```typescript
const tx = new Transaction(senderAddress, receiverAddress, 10);
tx.signTransaction(senderKey); // Sign dengan private key

blockchain.addTransaction(tx); // Validasi signature & tambah ke mempool
```

### 3. Mining
```typescript
// Lakukan Proof of Work & add blok ke blockchain
blockchain.minePendingTransactions(minerAddress);

// Reward diberikan ke miner
// Saldo = semua transaksi incoming - outgoing
const balance = blockchain.getBalanceOfAddress(address);
```

### 4. Validasi Blockchain
```typescript
// Check apakah blockchain sudah dimanipulasi
if (blockchain.isChainValid()) {
  console.log("✅ Blockchain aman");
} else {
  console.log("⚠️ Ada manipulasi!");
}
```

---

## 🧪 Testing

### Cek apakah blockchain deteksi manipulasi

Edit file atau buat script test:

```typescript
import { Blockchain, Transaction } from "./src/Blockchain";

const bc = new Blockchain();

// Add transaksi & mining
const tx = new Transaction("sender", "receiver", 10);
// ... sign dan add ...

bc.minePendingTransactions("miner");

console.log("Valid sebelum manipulasi:", bc.isChainValid()); // true

// Hacker mencoba ubah data
bc.chain[1].transactions[0].amount = 1000;

console.log("Valid setelah manipulasi:", bc.isChainValid()); // false ✓
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'crypto-js'"
```bash
npm install crypto-js
```

### Error: "EADDRINUSE: address already in use"
```bash
# Port sudah digunakan. Gunakan port berbeda
P2P_PORT=5002 npx ts-node src/p2p.ts

# Atau kill process yang menggunakan port
lsof -i :5001  # Linux/Mac
netstat -ano | findstr :5001  # Windows
```

### Error: "Cannot find module '@types/elliptic'"
```bash
# Normal, type checking menggunakan @ts-ignore
# File sudah include type definitions di elliptic.d.ts
```

---

## 📚 Learning Path

### Beginner
1. Jalankan `npm start` (local demo)
2. Baca dokumentasi di `index.ts`
3. Pahami alur: wallet → transaksi → sign → mine

### Intermediate
1. Jalankan `npx ts-node src/p2p.ts` (single node)
2. Baca dokumentasi di `p2p.ts`
3. Pahami WebSocket communication

### Advanced
1. Setup 3-node network (lihat section 3️⃣ di atas)
2. Baca `ARCHITECTURE.md` lengkap
3. Eksperimen dengan difficulty, reward, dll

---

## 🎓 Implementasi Lebih Lanjut

Fitur yang bisa ditambahkan:

- [ ] **Merkle Tree**: Untuk efficient transaction verification
- [ ] **Smart Contracts**: Programmable transactions
- [ ] **Stake Proof**: Alternative consensus mechanism
- [ ] **Sharding**: Untuk scalability
- [ ] **State Channel**: Off-chain transactions
- [ ] **REST API**: HTTP server untuk wallet interactions
- [ ] **Web UI**: Dashboard untuk blockchain explorer

---

## 📖 Resources

- **Bitcoin Whitepaper**: https://bitcoin.org/bitcoin.pdf
- **Ethereum Docs**: https://ethereum.org/en/developers/docs/
- **Elliptic Curve Cryptography**: https://en.wikipedia.org/wiki/Elliptic-curve_cryptography
- **WebSocket**: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket

---

## ❓ FAQ

**Q: Apa bedanya digital signature dengan password?**  
A: Password sama untuk semua orang. Signature unik per message - jadi tidak bisa di-copy/reuse.

**Q: Kenapa butuh mining?**  
A: Mining membuat attack blockchain jadi mahal (butuh banyak komputasi). Semakin tinggi difficulty, semakin aman.

**Q: Apa itu mempool?**  
A: Temporary storage untuk transaksi yang belum dimasukkan ke blok. Miner pilih mana yang mau di-include.

**Q: Blockchain ini aman?**  
A: Untuk educational purposes ya. Untuk production, butuh:
- Better difficulty adjustment
- Transaction fee mechanism  
- Improved consensus
- Better DoS protection

---

**Happy Learning! 🎉**

Punya pertanyaan? Baca `ARCHITECTURE.md` untuk dokumentasi lebih lengkap.


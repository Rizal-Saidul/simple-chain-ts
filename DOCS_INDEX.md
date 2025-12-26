# 📑 Documentation Index

Panduan lengkap untuk navigasi dokumentasi Simple Chain TS.

## 🎯 Mulai dari Mana?

### 👶 Jika Anda Pemula

**Waktu yang dibutuhkan: ~30 menit**

1. Baca [README-NEW.md](./README-NEW.md) - Overview project (5 min)
2. Baca [QUICK_START.md](./QUICK_START.md) - Panduan menjalankan (10 min)
3. Jalankan `npm start` dan amati output (5 min)
4. Baca dokumentasi dalam `src/index.ts` (10 min)

**Hasil:** Pemahaman dasar blockchain, hashing, signing, dan mining ✅

---

### 🎓 Jika Anda Intermediate

**Waktu yang dibutuhkan: ~2 jam**

1. Lanjut dari level pemula
2. Baca [ARCHITECTURE.md](./ARCHITECTURE.md) - Detail arsitektur (45 min)
3. Baca dokumentasi dalam source files:
   - `src/Block.ts` - Struktur Block
   - `src/Blockchain.ts` - Blockchain & Transaction
   - `src/p2p.ts` - P2P Network
4. Setup P2P network dengan 2-3 nodes (30 min)
5. Eksperimen: ubah difficulty, mining interval

**Hasil:** Pemahaman menyeluruh blockchain, P2P, konsensus ✅

---

### 🚀 Jika Anda Advanced

**Waktu yang dibutuhkan: Sesuai kebutuhan**

1. Baca [API.md](./API.md) - Detail API lengkap
2. Modifikasi source code sesuai eksperimen
3. Implementasikan fitur baru
4. Optimize performa atau keamanan

**Hasil:** Dapat modify & extend blockchain sesuai kebutuhan ✅

---

## 📚 File Documentation Guide

### 📄 README-NEW.md (8 KB)
**Apa:** Overview project dan quick start
**Untuk siapa:** Semua orang yang baru pertama kali
**Waktu baca:** 5-10 menit
**Konten:**
- Project features & tech stack
- Installation & quick run
- Key concepts overview
- Project structure

➡️ **Baca ini dulu!**

---

### ⚡ QUICK_START.md (8 KB)
**Apa:** Panduan praktis menjalankan blockchain
**Untuk siapa:** Pemula yang ingin langsung praktek
**Waktu baca:** 10-15 menit
**Konten:**
- 3 cara menjalankan project
- Output yang diharapkan
- Learning path (beginner → advanced)
- Troubleshooting
- FAQ

➡️ **Baca setelah README!**

---

### 🏗️ ARCHITECTURE.md (22 KB)
**Apa:** Dokumentasi detail arsitektur & konsep
**Untuk siapa:** Yang ingin memahami cara kerja mendalam
**Waktu baca:** 45-60 menit
**Konten:**
- Komponen utama (Block, Blockchain, Transaction)
- Alur kerja lengkap
- Konsep kriptografi (SHA-256, ECDSA, Signatures)
- Proof of Work mining
- P2P network architecture
- Consensus mechanism

➡️ **Baca saat sudah familiar dengan basics**

---

### 📖 API.md (15 KB)
**Apa:** Dokumentasi API referensi lengkap
**Untuk siapa:** Developer yang ingin modify code
**Waktu baca:** 30-45 menit (referensi, baca saat dibutuhkan)
**Konten:**
- Block class - properties & methods
- Transaction class - properties & methods
- Blockchain class - properties & methods
- Type definitions
- Usage examples
- Best practices

➡️ **Refer saat coding & modifying**

---

### 💻 Source Code Documentation

#### src/Block.ts
```
📦 Class Block
├─ Properties: timestamp, transactions, previousHash, hash, nonce
├─ Methods:
│  ├─ calculateHash() - Hitung SHA-256 hash
│  ├─ mineBlock(difficulty) - Proof of Work mining
│  └─ hasValidTransactions() - Validasi semua transaksi
└─ JSDoc: ✅ Lengkap dengan penjelasan detail
```

**Baca untuk:** Memahami struktur block & mining mechanism

---

#### src/Blockchain.ts
```
🔗 Class Transaction
├─ Properties: fromAddress, toAddress, amount, signature
├─ Methods:
│  ├─ calculateHash() - Hash transaksi
│  ├─ signTransaction(key) - Tanda tangan transaksi
│  └─ isValid() - Validasi signature
└─ JSDoc: ✅ Lengkap

🔗 Class Blockchain
├─ Properties: chain, difficulty, pendingTransactions, miningReward
├─ Methods:
│  ├─ createGenesisBlock() - Buat genesis block
│  ├─ getLatestBlock() - Ambil blok terakhir
│  ├─ minePendingTransactions() - Mining & add block
│  ├─ addTransaction() - Tambah transaksi
│  ├─ getBalanceOfAddress() - Hitung saldo
│  ├─ isChainValid() - Validasi blockchain
│  ├─ replaceChain() - Update blockchain (P2P)
│  └─ isValidChain() - Validasi chain asing
└─ JSDoc: ✅ Sangat lengkap dengan penjelasan
```

**Baca untuk:** Memahami transaction flow & blockchain logic

---

#### src/index.ts
```
🎬 Local Demo Script
├─ Step 1: Generate wallet
├─ Step 2: Create transaction
├─ Step 3: Sign transaction
├─ Step 4: Add to mempool
├─ Step 5: Mining block 1
├─ Step 6: Check balance
├─ Step 7: Mining block 2
└─ Step 8: Check final balance

📝 Documentation: ✅ Step-by-step dengan flow chart
```

**Baca untuk:** Memahami praktik penggunaan blockchain

---

#### src/p2p.ts
```
🌐 P2P Network Node
├─ WebSocket server (menerima koneksi)
├─ Connect ke peers (inisiasi koneksi)
├─ Message types: CHAIN, REQUEST_CHAIN
├─ Message handler (terima & proses pesan)
├─ Mining interval (auto-mining setiap 10s)
└─ Broadcasting (broadcast blockchain ke peers)

📝 Documentation: ✅ Lengkap untuk setiap fungsi
```

**Baca untuk:** Memahami P2P network & synchronization

---

## 🔄 Learning Sequence

```
START (Anda di sini)
    │
    ├─→ README-NEW.md (5 min)
    │       │
    │       └─→ Understand project overview
    │
    ├─→ QUICK_START.md (15 min)
    │       │
    │       └─→ Run `npm start`
    │
    ├─→ src/index.ts (10 min)
    │       │
    │       └─→ Read step-by-step explanation
    │
    ├─→ ARCHITECTURE.md (1 hour)
    │       │
    │       └─→ Deep dive: hashing, signing, mining
    │
    ├─→ src/Block.ts (15 min)
    ├─→ src/Blockchain.ts (30 min)
    ├─→ src/p2p.ts (15 min)
    │       │
    │       └─→ Understand each component
    │
    ├─→ API.md (45 min)
    │       │
    │       └─→ Reference untuk implementasi
    │
    ├─→ Run P2P Network (30 min)
    │       │
    │       └─→ Setup 3-node network
    │
    └─→ MASTERY ✅
        Mulai modifikasi & eksperimen!
```

---

## 🎯 Doc by Purpose

### "Saya ingin MEMULAI"
→ [README-NEW.md](./README-NEW.md) → [QUICK_START.md](./QUICK_START.md)

### "Saya ingin MEMAHAMI"
→ [ARCHITECTURE.md](./ARCHITECTURE.md) → Source code JSDoc

### "Saya ingin CODING"
→ [API.md](./API.md) → Source code + JSDoc

### "Saya ingin EKSPERIMEN"
→ Modify `src/` files → Test dengan `npm start`

### "Saya stuck / error"
→ [QUICK_START.md](./QUICK_START.md) Troubleshooting section

---

## 📊 Documentation Statistics

| File | Size | Lines | Focus |
|------|------|-------|-------|
| README-NEW.md | 8.1 KB | 300 | Overview |
| QUICK_START.md | 7.9 KB | 280 | Getting Started |
| ARCHITECTURE.md | 22 KB | 700 | Deep Dive |
| API.md | 15 KB | 600 | Reference |
| src/Block.ts | ~3 KB | 150 | Implementation |
| src/Blockchain.ts | ~10 KB | 400 | Implementation |
| src/index.ts | ~3 KB | 150 | Demo |
| src/p2p.ts | ~3 KB | 120 | Implementation |
| **TOTAL** | **~70 KB** | **~2600** | Complete |

---

## 🎓 Recommended Reading Order

### Untuk Cepat (1 jam)
1. README-NEW.md (5 min)
2. Run `npm start` (5 min)
3. QUICK_START.md section "3️⃣ Multi-Node P2P Network" (20 min)
4. src/index.ts JSDoc (15 min)
5. Observe P2P network (15 min)

### Untuk Solid Understanding (2-3 jam)
1-5 dari "Untuk Cepat" (1 hour)
6. ARCHITECTURE.md section "Alur Kerja" (1 hour)
7. src/Block.ts JSDoc (20 min)
8. src/Blockchain.ts JSDoc (30 min)

### Untuk Mastery (4-5 jam)
Semua di atas +
9. ARCHITECTURE.md (full) (1 hour)
10. API.md (full) (45 min)
11. src/p2p.ts JSDoc (20 min)
12. Eksperimen: ubah difficulty, reward, interval (30 min)

---

## 🔍 Quick Lookup

**Q: Bagaimana cara membuat transaksi?**
→ src/index.ts (lines 45-52) + API.md (Transaction section)

**Q: Bagaimana cara mining?**
→ ARCHITECTURE.md (Proof of Work section) + API.md (minePendingTransactions)

**Q: Bagaimana P2P synchronization?**
→ src/p2p.ts (full file) + ARCHITECTURE.md (P2P Network section)

**Q: Bagaimana signature verification?**
→ ARCHITECTURE.md (Digital Signature section) + API.md (Transaction.isValid)

**Q: Bagaimana blockchain validation?**
→ ARCHITECTURE.md (Chain Validation section) + API.md (isChainValid method)

---

## 📝 Notes

- Semua documentation ditulis dengan format Markdown
- JSDoc di source files bisa dibaca langsung di code editor
- Contoh code ditulis dalam TypeScript
- Documentasi dalam bahasa **Indonesia** ✅

---

**Last Updated**: 26 December 2025

**Total Documentation**: ~70 KB, 2600+ lines, fully commented code

**Status**: ✅ Complete & Ready for Learning


# Project Roadmap & TODOs

Berikut adalah rencana pengembangan untuk membuat simulasi ini mendekati cara kerja Bitcoin/Ethereum yang sebenarnya.

### ✅ Phase 1: Core Structure (Completed)

- [x] Setup TypeScript environment.
- [x] Create `Block` class with properties (index, timestamp, data, hash).
- [x] Implement SHA-256 hashing.
- [x] Create `Blockchain` class (Genesis block, Add block).
- [x] Implement Chain Validation logic (Integrity check).

### 🚧 Phase 2: Consensus Mechanism (Next Step)

- [x] Implement **Proof of Work (Mining)**.
  - Menambahkan `nonce` pada Block.
  - Membuat loop `mining` hingga menemukan hash yang diawali dengan '0000'.
- [x] Menambahkan mekanisme _Difficulty adjustment_.

### 🔮 Phase 3: Transactions & Wallets

- [x] Create `Transaction` class (From, To, Amount).
- [x] Implement KeyPair generation (Public/Private Key) menggunakan Elliptic Curve.
- [x] Implement Digital Signature (Signing transactions).
- [x] Validasi signature sebelum transaksi dimasukkan ke Block.

### 🌐 Phase 4: Network (Advanced)

- [ ] Membuat P2P server sederhana dengan WebSockets.
- [ ] Sinkronisasi rantai antar _node_.

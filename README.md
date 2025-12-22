# Simple Chain TS 🔗

> A fundamental Blockchain simulation written in TypeScript to demonstrate Hash immutability and Chain validation.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

## 📖 About The Project
Project ini adalah simulasi backend sederhana untuk memahami cara kerja **Blockchain** pada level data structure.

Dibangun tanpa *library* blockchain eksternal, project ini mendemonstrasikan bagaimana **SHA-256 Hashing** bekerja untuk mengamankan integritas data dan bagaimana setiap blok saling terikat (*linked*) melalui `previousHash`.

### Key Concepts Demonstrated:
- **Immutability:** Bagaimana perubahan satu byte data akan merusak hash blok.
- **Chain Linking:** Bagaimana blok terhubung secara kriptografis.
- **Validation Mechanism:** Algoritma untuk mendeteksi manipulasi data (*tampering*) dalam rantai.

## 🚀 Tech Stack
- **Language:** TypeScript
- **Runtime:** Node.js
- **Algorithm:** SHA-256 (via `crypto-js`)

## 🛠️ How to Run

1. **Clone & Install**
   ```bash
   git clone [https://github.com/username-anda/simple-chain-ts.git](https://github.com/username-anda/simple-chain-ts.git)
   cd simple-chain-ts
   npm install

    Run Simulation Jalankan simulasi untuk melihat proses pembuatan blok dan deteksi tampering.
    Bash

    npx ts-node src/index.ts

🧪 Simulation Scenario

Dalam file src/index.ts, skenario berikut dijalankan:

    Membuat Blockchain baru.

    Menambahkan 2 blok transaksi valid.

    Check 1: Sistem memverifikasi rantai (Hasil: TRUE).

    Attack Attempt: Mencoba mengubah amount pada Blok 1 secara paksa.

    Check 2: Sistem memverifikasi ulang rantai (Hasil: FALSE - Manipulasi terdeteksi).

📝 Code Snippet (Validation Logic)
TypeScript

// Core logic to detect tampering
if (currentBlock.hash !== currentBlock.calculateHash()) {
    return false; // Data has been changed
}
if (currentBlock.previousHash !== previousBlock.hash) {
    return false; // Chain link is broken
}

👨‍💻 Author

Saidul Rizal Aspiring Web3 Backend Developer

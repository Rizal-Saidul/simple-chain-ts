/**
 * @fileoverview P2P Network Node untuk Blockchain
 * 
 * Implementasi peer-to-peer network menggunakan WebSocket.
 * Setiap node dapat:
 * - Menerima koneksi dari peer lain
 * - Connect ke peer lain
 * - Sinkronisasi blockchain (menerima chain dari peer)
 * - Broadcast chain update ke semua peer
 * - Mining otomatis setiap interval
 * 
 * Konsensus: Longest Chain Rule
 * - Jika menerima chain lebih panjang dari node, dan chain valid, replace
 * - Ini memastikan semua node konvergen ke blockchain terpanjang
 * 
 * Menjalankan node:
 * - Node 1 (port 5001): npx ts-node src/p2p.ts
 * - Node 2 (port 5002): P2P_PORT=5002 PEERS=ws://localhost:5001 npx ts-node src/p2p.ts
 * - Node 3 (port 5003): P2P_PORT=5003 PEERS=ws://localhost:5001,ws://localhost:5002 npx ts-node src/p2p.ts
 */

import { WebSocketServer, WebSocket } from "ws";
import { Blockchain } from "./Blockchain.js";

/**
 * P2P_PORT: Port untuk menjalankan WebSocket server
 * Default: 5001 (jika tidak diberikan P2P_PORT di environment)
 * 
 * @example
 * P2P_PORT=5002 npx ts-node src/p2p.ts
 */
const P2P_PORT = process.env.P2P_PORT ? parseInt(process.env.P2P_PORT) : 5001;

/**
 * PEERS: Daftar peer yang akan dihubungi
 * Format: comma-separated WebSocket URLs
 * Default: [] (tidak ada peer awal)
 * 
 * @example
 * PEERS=ws://localhost:5001,ws://localhost:5002 npx ts-node src/p2p.ts
 */
const PEERS = process.env.PEERS ? process.env.PEERS.split(",") : [];

/** Instance blockchain untuk node ini */
const myCoin = new Blockchain();

/** Array semua WebSocket connections yang terbuka */
const sockets: WebSocket[] = [];

/**
 * Tipe pesan yang bisa dikirim antar node
 * 
 * - CHAIN: Mengirim blockchain (untuk sinkronisasi)
 * - REQUEST_CHAIN: Meminta blockchain dari peer
 */
enum MessageType {
  CHAIN = "CHAIN",
  REQUEST_CHAIN = "REQUEST_CHAIN",
}

/**
 * Format pesan yang dikirim antar node
 * 
 * @property {MessageType} type - Tipe pesan
 * @property {any} data - Data yang dikirim (bisa blockchain atau null)
 * 
 * @example
 * const message: Message = {
 *   type: MessageType.CHAIN,
 *   data: blockchain.chain
 * };
 */
interface Message {
  type: MessageType;
  data: any;
}

/**
 * WebSocket server untuk menerima koneksi incoming dari peer lain
 * 
 * Setiap node menjalankan server untuk:
 * - Menerima request blockchain dari peer
 * - Menerima blockchain update dari peer
 * - Respond dengan blockchain kita
 */
const server = new WebSocketServer({ port: P2P_PORT });

/**
 * Event handler: ketika ada peer baru yang connect ke server kita
 */
server.on("connection", (socket) => {
  connectSocket(socket);
});

console.log(`✅ Node berjalan di port ${P2P_PORT}`);
console.log("📡 Menunggu koneksi dari peer...");

/**
 * STEP 1: Connect ke peers yang sudah ada
 * 
 * Node ini akan menginisialisasi koneksi outgoing ke semua peer
 * yang disebutkan di environment variable PEERS
 * 
 * Jika berhasil connect, akan request blockchain dari peer tersebut.
 */
PEERS.forEach((peer) => {
  const socket = new WebSocket(peer);
  socket.on("open", () => connectSocket(socket));
});

/**
 * Menghubungkan WebSocket ke node network
 * 
 * Proses:
 * 1. Simpan socket ke daftar sockets
 * 2. Setup message handler untuk menerima pesan dari peer
 * 3. Request blockchain dari peer untuk sinkronisasi
 * 
 * @param {WebSocket} socket - WebSocket connection ke peer
 */
function connectSocket(socket: WebSocket) {
  sockets.push(socket);
  console.log("🔗 Terhubung ke peer baru (Total peers: " + sockets.length + ")");

  // Setup message handler
  messageHandler(socket);

  // Request blockchain dari peer untuk sinkronisasi awal
  sendChainRequest(socket);
}

/**
 * Handler untuk pesan yang diterima dari peer
 * 
 * Proses:
 * 1. Parse JSON message menjadi Message object
 * 2. Cek tipe pesan
 * 3. Kirim atau terima blockchain sesuai tipe pesan
 * 
 * @param {WebSocket} socket - WebSocket yang mengirim pesan
 */
function messageHandler(socket: WebSocket) {
  socket.on("message", (message: string) => {
    // Parse pesan JSON
    const data: Message = JSON.parse(message);

    // Handle berbagai tipe pesan
    switch (data.type) {
      /**
       * REQUEST_CHAIN: Peer meminta blockchain kita
       * 
       * Jika peer meminta chain, kita respond dengan chain terbaru kita.
       * Ini memungkinkan peer baru untuk sinkronisasi blockchain.
       */
      case MessageType.REQUEST_CHAIN:
        console.log("📥 Peer meminta blockchain kami");
        // Respond dengan blockchain kita
        socket.send(
          JSON.stringify({
            type: MessageType.CHAIN,
            data: myCoin.chain,
          })
        );
        break;

      /**
       * CHAIN: Menerima blockchain dari peer
       * 
       * Jika menerima chain dari peer:
       * 1. Log informasi chain yang diterima
       * 2. Coba ganti blockchain kita dengan yang baru (jika lebih panjang & valid)
       * 3. Broadcast chain terbaru ke semua peer lain
       * 
       * Ini mengimplementasikan Longest Chain Rule consensus.
       */
      case MessageType.CHAIN:
        // Terima blockchain dari peer
        const receivedChain = data.data;
        console.log(
          "📥 Menerima blockchain dari peer. Panjang:",
          receivedChain.length
        );

        // Coba adu panjang blockchain (consensus mechanism)
        // Jika chain baru lebih panjang dan valid, replace blockchain kita
        myCoin.replaceChain(receivedChain);
        break;
    }
  });
}

/**
 * Mengirim request blockchain ke peer
 * 
 * Digunakan ketika:
 * - Node pertama kali connect ke peer (untuk sinkronisasi)
 * - Node ingin mengupdate blockchain dengan versi terbaru dari peer
 * 
 * @param {WebSocket} socket - WebSocket ke peer yang dituju
 */
function sendChainRequest(socket: WebSocket) {
  socket.send(
    JSON.stringify({
      type: MessageType.REQUEST_CHAIN,
      data: null,
    })
  );
}

/**
 * ⛏️ SIMULASI MINING DI NODE INI
 * 
 * Setiap node menjalankan mining otomatis setiap interval.
 * Ini memastikan blockchain terus berkembang.
 * 
 * Proses setiap interval:
 * 1. Lakukan mining (create dan add block ke blockchain)
 * 2. Broadcast blockchain terbaru ke semua peer yang terhubung
 * 
 * Interval: 10 detik (untuk testing)
 * Di blockchain nyata: ~10 menit (Bitcoin) atau ~12 detik (Ethereum)
 * 
 * Catatan: Mining reward address hardcoded untuk simplicity.
 * Di implementasi nyata, bisa dikonfigurasi per node.
 */
setInterval(() => {
  // Mining: Lakukan Proof of Work dan tambah blok
  console.log("\n⛏️ Mining blok baru di node ini...");
  myCoin.minePendingTransactions("MY-WALLET-ADDRESS");

  // Broadcast: Kirim blockchain terbaru ke semua peer
  console.log("📢 Broadcasting blockchain terbaru ke semua peer...");
  sockets.forEach((socket) => {
    // Hanya kirim jika socket masih terbuka
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: MessageType.CHAIN,
          data: myCoin.chain,
        })
      );
    }
  });

  console.log("✅ Broadcast selesai");
}, 10000); // Mining dan broadcast setiap 10 detik

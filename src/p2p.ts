import { WebSocketServer, WebSocket } from "ws";
import { Blockchain } from "./Blockchain.js";

const P2P_PORT = process.env.P2P_PORT ? parseInt(process.env.P2P_PORT) : 5001;
const PEERS = process.env.PEERS ? process.env.PEERS.split(",") : [];

const myCoin = new Blockchain();
const sockets: WebSocket[] = [];

enum MessageType {
  CHAIN = "CHAIN",
  REQUEST_CHAIN = "REQUEST_CHAIN",
}

interface Message {
  type: MessageType;
  data: any;
}

const server = new WebSocketServer({ port: P2P_PORT });

server.on("connection", (socket) => {
  connectSocket(socket);
});

console.log(`node berjalan di port ${P2P_PORT}`);
console.log("menunggu koneksi");

PEERS.forEach((peer) => {
  const socket = new WebSocket(peer);
  socket.on("open", () => connectSocket(socket));
});

function connectSocket(socket: WebSocket) {
  sockets.push(socket);
  console.log("terhubung ke peer baru");

  messageHandler(socket);

  sendChainRequest(socket);
}

function messageHandler(socket: WebSocket) {
  socket.on("message", (message: string) => {
    const data: Message = JSON.parse(message);

    switch (data.type) {
      case MessageType.REQUEST_CHAIN:
        // Ada yang minta data? Kirim rantai kita!
        socket.send(
          JSON.stringify({
            type: MessageType.CHAIN,
            data: myCoin.chain,
          })
        );
        break;

      case MessageType.CHAIN:
        // Kita menerima rantai dari orang lain
        const receivedChain = data.data;
        console.log(
          "📥 Menerima rantai dari peer. Panjang:",
          receivedChain.length
        );

        // Coba adu panjang rantai (Konsensus)
        myCoin.replaceChain(receivedChain);
        break;
    }
  });
}

function sendChainRequest(socket: WebSocket) {
  socket.send(JSON.stringify({ type: MessageType.REQUEST_CHAIN, data: null }));
}

// --- SIMULASI MINING DI NODE INI ---
// Agar blockchain bergerak, kita buat interval mining otomatis tiap 10 detik
setInterval(() => {
  console.log("\n⛏️  Mining blok baru di node ini...");
  myCoin.minePendingTransactions("MY-WALLET-ADDRESS");

  // Broadcast rantai baru ke semua peers
  console.log("📢 Mengirim rantai terbaru ke semua peers...");
  sockets.forEach((socket) => {
    socket.send(
      JSON.stringify({
        type: MessageType.CHAIN,
        data: myCoin.chain,
      })
    );
  });
}, 10000); // Mining setiap 10 detik

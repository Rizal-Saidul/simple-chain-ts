import elliptic from 'elliptic';
const EC = elliptic.ec;

const ec = new EC('secp256k1');

const key = ec.genKeyPair();

const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');

console.log();
console.log('===============================================================');
console.log('🔑  PRIVATE KEY (Rahasia! Copy ini ke dalam src/index.ts):');
console.log(privateKey);
console.log();
console.log('👛  PUBLIC KEY (Wallet Address Anda):');
console.log(publicKey);
console.log('===============================================================');
import uuid from 'uuid';
import sha256 from 'sha256';

const currentNodeUrl = process.argv[3];

/*function constructor for my Blockchain.*/
class Blockchain {
    constructor(socketID) {
        this.socketId = socketID;
        this.chain = [];
        this.pendingTransactions = [];
        this.currentNodeUrl = currentNodeUrl;
        this.networkNodes = [];
        this.createNewBlock(100, '0', '0'); //Genesis block.
    }
    /*init a new block to the chain and insert pending transactions into the block.*/
    createNewBlock(nonce, previousBlockHash, hash) {
        const newBlock = {
            index: this.chain.length + 1,
            timestamp: Date.now(),
            date: new Date().toString(),
            transactions: this.pendingTransactions,
            nonce: nonce,
            hash: hash,
            previousBlockHash: previousBlockHash
        };
        this.pendingTransactions = []; //reset the pendingTransactions for the next block.
        this.chain.push(newBlock); //push to the blockchain the new block.
        return newBlock;
    }
    /*returns the last block of the chain.*/
    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }
    
}

module.exports = Blockchain;
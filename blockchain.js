
import sha256 from 'sha256';
import Transaction from './transaction.js';
import broadcastLatest from './p2p.js'
import hexToBinary from './utils/hexToBinary.js';
import CryptoJS from 'crypto-js';

/*function constructor for my Blockchain.*/
class Blockchain {
    constructor(index, hash, previousHash,
        timestamp, data, difficulty, nonce) {
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.data = data;
    this.hash = hash;
    this.difficulty = difficulty;
    this.nonce = nonce;
}

    
}

const genesisTransaction = {
    'txIns': [{'signature': '', 'txOutId': '', 'txOutIndex': 0}],
    'txOuts': [{
        'address': '04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534a',
        'amount': 50
    }],
    'id': 'e655f6a5f26dc9b4cac6e46f52336428287759cf81ef5ff10854f69d68f43fa3'
};
//genesis Block
const genesisBlock = new Blockchain(
    0, '91a73664bc84c0baa1fc75ea6e4aa6d1d20c5df664c724e3159aefc2e1186627', '', 1620705526, [genesisTransaction], 0, 0
);
let blockchain = [genesisBlock];

const getBlockchain = () => blockchain;
const getLatestBlock = () => blockchain[blockchain.length - 1];
// in seconds
const BLOCK_GENERATION_INTERVAL = 10;

// in blocks
const DIFFICULTY_ADJUSTMENT_INTERVAL = 10;
const getDifficulty = (aBlockchain)=> {
    const latestBlock = aBlockchain[blockchain.length - 1];
    if (latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && latestBlock.index !== 0) {
        return getAdjustedDifficulty(latestBlock, aBlockchain);
    } else {
        return latestBlock.difficulty;
    }
};

const getAdjustedDifficulty = (latestBlock, aBlockchain) => {
    const prevAdjustmentBlock= aBlockchain[blockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
    const timeExpected = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
    const timeTaken = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
    if (timeTaken < timeExpected / 2) {
        return prevAdjustmentBlock.difficulty + 1;
    } else if (timeTaken > timeExpected * 2) {
        return prevAdjustmentBlock.difficulty - 1;
    } else {
        return prevAdjustmentBlock.difficulty;
    }
};
const getCurrentTimestamp = () => Math.round(new Date().getTime() / 1000);

const isValidBlockStructure = (block) => {
    return typeof block.index === 'number'
        && typeof block.hash === 'string'
        && typeof block.previousHash === 'string'
        && typeof block.timestamp === 'number'
        && typeof block.data === 'object';
};

const isValidNewBlock = (newBlock, previousBlock) => {
    if (!isValidBlockStructure(newBlock)) {
        console.log('invalid block structure: %s', JSON.stringify(newBlock));
        return false;
    }
    if (previousBlock.index + 1 !== newBlock.index) {
        console.log('invalid index');
        return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
        console.log('invalid previoushash');
        return false;
    } else if (!isValidTimestamp(newBlock, previousBlock)) {
        console.log('invalid timestamp');
        return false;
    } else if (!hasValidHash(newBlock)) {
        return false;
    }
    return true;
};

const isValidTimestamp = (newBlock, previousBlock) => {
    return ( previousBlock.timestamp - 60 < newBlock.timestamp )
        && newBlock.timestamp - 60 < getCurrentTimestamp();
};
const hasValidHash = (block) => {

    if (!hashMatchesBlockContent(block)) {
        console.log('invalid hash, got:' + block.hash);
        return false;
    }

    if (!hashMatchesDifficulty(block.hash, block.difficulty)) {
        console.log('block difficulty not satisfied. Expected: ' + block.difficulty + 'got: ' + block.hash);
    }
    return true;
};

const findBlock = (index, previousHash, timestamp, data, difficulty) => {
    let nonce = 0;
    while (true) {
        const hash = calculateHash(index, previousHash, timestamp, data, difficulty, nonce);
        if (hashMatchesDifficulty(hash, difficulty)) {
            return new Block(index, hash, previousHash, timestamp, data, difficulty, nonce);
        }
        nonce++;
    }
};


const hashMatchesBlockContent = (block) => {
    const blockHash = calculateHashForBlock(block);
    return blockHash === block.hash;
};
const calculateHash = (index, previousHash, timestamp, data,
    difficulty, nonce) =>
CryptoJS.SHA256(index + previousHash + timestamp + data + difficulty + nonce).toString();

const hashMatchesDifficulty = (hash, difficulty) => {
    const hashInBinary = hexToBinary(hash);
    const requiredPrefix = '0'.repeat(difficulty);
    return hashInBinary.startsWith(requiredPrefix);
};

/*
    Checks if the given blockchain is valid. Return the unspent txOuts if the chain is valid
 */
    const isValidChain = (blockchainToValidate) => {
        console.log('isValidChain:');
        console.log(JSON.stringify(blockchainToValidate));
        const isValidGenesis = (block) => {
            return JSON.stringify(block) === JSON.stringify(genesisBlock);
        };
    
        if (!isValidGenesis(blockchainToValidate[0])) {
            return null;
        }
        /*
        Validate each block in the chain. The block is valid if the block structure is valid
          and the transaction are valid
         */
        let aUnspentTxOuts = [];
    
        for (let i = 0; i < blockchainToValidate.length; i++) {
            const currentBlock = blockchainToValidate[i];
            if (i !== 0 && !isValidNewBlock(blockchainToValidate[i], blockchainToValidate[i - 1])) {
                return null;
            }
    
            aUnspentTxOuts = processTransactions(currentBlock.data, aUnspentTxOuts, currentBlock.index);
            if (aUnspentTxOuts === null) {
                console.log('invalid transactions in blockchain');
                return null;
            }
        }
        return aUnspentTxOuts;
    };
    const replaceChain = (newBlocks) => {
        const aUnspentTxOuts = isValidChain(newBlocks);
        const validChain = aUnspentTxOuts !== null;
        if (validChain &&
            getAccumulatedDifficulty(newBlocks) > getAccumulatedDifficulty(getBlockchain())) {
            console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
            blockchain = newBlocks;
            setUnspentTxOuts(aUnspentTxOuts);
            updateTransactionPool(unspentTxOuts);
            broadcastLatest();
        } else {
            console.log('Received blockchain invalid');
        }
    };
export {Blockchain, getBlockchain, generateNextBlock} ;
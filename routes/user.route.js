import express from 'express';
import Web3 from 'web3';
import {existsSync, readFileSync, unlinkSync, writeFileSync} from 'fs';
import {setGenesisTransactions,getUnspentTxOuts} from './../blockchain.js';

const router = express.Router();
const privateKeyLocation = 'node/wallet/private_key';

router.post('/', async (req,res)=>{
    
    const password = req.body.password;
    const web3 = new Web3();
    const account = web3.eth.accounts.create();
    const keystoreJson = await web3.eth.accounts.encrypt(account.privateKey,password);
    const userAddress = web3.eth.accounts.decrypt(
        keystoreJson,
        password
      );
    //setGenesisTransactions({address:userAddress.address,amount:50});
    
    writeFileSync(privateKeyLocation,account.privateKey);
    res.status(201).json(keystoreJson);
})

export default router;
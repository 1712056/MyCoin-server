import express from 'express';
import Web3 from 'web3';
const router = express.Router();

router.post('/', (req,res)=>{
    const password = req.body.password;
    const web3 = new Web3();
    const account = web3.eth.accounts.create();
    const keystoreJson = web3.eth.accounts.encrypt(account.privateKey,password);
    
    res.status(201).json(keystoreJson);
})

export default router;
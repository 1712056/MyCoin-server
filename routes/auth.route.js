import express from 'express';
import Web3 from 'web3';
const router = express.Router();

router.post('/', (req,res)=>{
    const user = req.body;
    const web3 = new Web3();
    const userAddress = web3.eth.accounts.decrypt(user.keystoreJson,user.password);
    res.status(400).json({authenticated: true, user: userAddress});
})

export default router;

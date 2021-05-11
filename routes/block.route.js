import express from "express";
import {getBlockchain, generateNextBlock, generateRawNextBlock} from './../blockchain.js';
const router = express.Router();

router.get('/',()=>{
    res.send(getBlockchain());
});
router.get('/:hash', (req, res) => {
    const block = _.find(getBlockchain(), {'hash' : req.params.hash});
    res.send(block);
});
router.post('/mining', (req, res) => {
    const newBlock = generateNextBlock();
    if (newBlock === null) {
        res.status(400).send('could not generate block');
    } else {
        res.send(newBlock);
    }
});
router.post('/mining-RawBlock', (req, res) => {
    if (req.body.data == null) {
        res.send('data parameter is missing');
        return;
    }
    const newBlock = generateRawNextBlock(req.body.data);
    if (newBlock === null) {
        res.status(400).send('could not generate block');
    } else {
        res.send(newBlock);
    }
});
export default router;

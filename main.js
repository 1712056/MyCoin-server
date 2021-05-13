import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import Auth from "./routes/auth.route.js";
import User from "./routes/user.route.js";
import Block from "./routes/block.route.js";
import {
  Blockchain, generateNextBlock, generatenextBlockWithTransaction, generateRawNextBlock, getAccountBalance,
  getBlockchain, getMyUnspentTransactionOutputs, getUnspentTxOuts, sendTransaction
} from './blockchain.js';
import {getPublicFromWallet, initWallet} from './wallet.js';
import { connectToPeers, getSockets, initP2PServer } from "./p2p.js";
import * as _ from 'lodash';

const p2pPort = 6001;
const initHttpServer = (myHttpPort) => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use("/api/auth", Auth);
  app.use("/api/users", User);
  app.use("/block", Block);
  app.get("/transaction/:id", (req, res) => {
    const tx = _(getBlockchain())
      .map((blocks) => blocks.data)
      .flatten()
      .find({ id: req.params.id });
    res.send(tx);
  });

  app.get("/address/:address", (req, res) => {
    const unspentTxOuts = _.filter(
      getUnspentTxOuts(),
      (uTxO) => uTxO.address === req.params.address
    );
    res.send({ unspentTxOuts: unspentTxOuts });
  });

  app.get("/unspentTransactionOutputs", (req, res) => {
    res.send(getUnspentTxOuts());
  });

  app.get("/myUnspentTransactionOutputs", (req, res) => {
    res.send(getMyUnspentTransactionOutputs());
  });

  app.post("/mineRawBlock", (req, res) => {
    if (req.body.data == null) {
      res.send("data parameter is missing");
      return;
    }
    const newBlock = generateRawNextBlock(req.body.data);
    if (newBlock === null) {
      res.status(400).send("could not generate block");
    } else {
      res.send(newBlock);
    }
  });

  app.post("/mineBlock", (req, res) => {
    const newBlock = generateNextBlock();
    if (newBlock === null) {
      res.status(400).send("could not generate block");
    } else {
      res.send(newBlock);
    }
  });

  app.get("/balance", (req, res) => {
    const balance = getAccountBalance();
    res.send({ balance: balance });
  });

  app.get("/address", (req, res) => {
    const address = getPublicFromWallet();
    res.send({ address: address });
  });

  app.post("/mineTransaction", (req, res) => {
    const address = req.body.address;
    const amount = req.body.amount;
    try {
      const resp = generatenextBlockWithTransaction(address, amount);
      res.send(resp);
    } catch (e) {
      console.log(e.message);
      res.status(400).send(e.message);
    }
  });

  app.post("/sendTransaction", (req, res) => {
    try {
      const address = req.body.address;
      const amount = req.body.amount;

      if (address === undefined || amount === undefined) {
        throw Error("invalid address or amount");
      }
      const resp = sendTransaction(address, amount);
      res.send(resp);
    } catch (e) {
      console.log(e.message);
      res.status(400).send(e.message);
    }
  });

  app.get("/transactionPool", (req, res) => {
    res.send(getTransactionPool());
  });
  app.get("/peers", (req, res) => {
    res.send(
      getSockets().map(
        (s) => s._socket.remoteAddress + ":" + s._socket.remotePort
      )
    );
  });
  app.post("/addPeer", (req, res) => {
    connectToPeers(req.body.peer);
    res.send();
  });
  app.get("/err", function (req, res) {
    throw new Error("Error!");
  });

  app.use(function (req, res, next) {
    res.status(404).json({
      error_message: "Endpoint not found",
    });
  });

  app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({
      error_message: "Something broke!",
    });
  });

  app.listen(myHttpPort, () => {
    console.log("Server is running on port", `${myHttpPort}`);
  });
};
const PORT = process.env.PORT || 5000;
initHttpServer(PORT);
initP2PServer(p2pPort);

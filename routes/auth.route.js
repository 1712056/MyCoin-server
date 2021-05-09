import e from "express";
import express from "express";
import Web3 from "web3";
const router = express.Router();

router.post("/", (req, res) => {
  try {
    const user = req.body;
    if (user) {
      const web3 = new Web3();
      const userAddress = web3.eth.accounts.decrypt(
        user.keystore,
        user.password
      );
      res.json({ isAuthenticated: true, user: userAddress });
    }
  } catch (e) {
    res.status(401).json({ isAuthenticated: false, error: 'Passphrase given is not correct!' });
  }
});

export default router;

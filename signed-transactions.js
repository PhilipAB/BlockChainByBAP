const Tx = require('ethereumjs-tx').Transaction;
const web3 = require('web3');

web3js = new web3(new web3.providers.WebsocketProvider("wss://ropsten.infura.io/ws/v3/674c8c3bc3c64cc6bd6ce5849f05219c"));

//Creating (by private key) signed transactions, so we can make post requests towards our blockchain
module.exports = function sendSignedTransaction(masterAddress, privateKey, contractAddress, methodABIencoded, eventExtraCount) {

    var privKey = Buffer.from(privateKey, 'hex')

    var count;
    // get transaction count, later will used as nonce
    web3js.eth.getTransactionCount(masterAddress).then(function (v) {
        count = v + eventExtraCount;
        //creating raw transaction
        var rawTransaction = { "from": masterAddress, "gasPrice": web3js.utils.toHex(20 * 1e9), "gasLimit": web3js.utils.toHex(420000), "to": contractAddress, "value": "0x0", "data": methodABIencoded, "nonce": web3js.utils.toHex(count) }
        //creating tranaction via ethereumjs-tx on ropsten test network
        var transaction = new Tx(rawTransaction, { 'chain': 'ropsten' });
        //signing transaction with private key
        transaction.sign(privKey);
        //sending transacton via web3js module
        web3js.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'));
    })
}
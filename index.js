const web3 = require('web3');
const express = require('express');
const Tx = require('ethereumjs-tx');

const app = express();

//Infura HttpProvider Endpoint
web3js = new web3(new web3.providers.HttpProvider("https://ropsten.infura.io/v3/674c8c3bc3c64cc6bd6ce5849f05219c"));

const qualityLevel = ['very low', 'low', 'acceptable', 'good', 'very good'];

app.get("/test", function (request, response) {
    response.send({
        test: 150
    })
});

app.get("/sensorQuality", function (request, response) {
    var sensorProcessing = qualityLevel[Math.floor(Math.random() * qualityLevel.length)];
    response.send({
        foodQuality: sensorProcessing
    })
});

(async function () {

    const config = await require('./config');

    app.get('/numVoteTest', async function (req, res) {

        var contract = new web3js.eth.Contract(config.lunchContractABI, config.contractAddressLunch);

        var returnValue = await contract.methods.numVotes().call({ from: config.contractAddressLunch });

        var gasPrice = await web3js.eth.getGasPrice(function (e, r) { console.log('Error: ', e) });

        var latestBlock = await web3js.eth.getBlock("latest");

        var rawTransaction = {
            "from": config.masterAddress,
            "gasPrice": gasPrice,
            "gasLimit": latestBlock.gasLimit,
            "to": config.contractAddressLunch,
            "data": contract.methods.numVotes().encodeABI(),
            "return value": returnValue
        }
        res.send({ rawTransaction });
    })

    app.get('/numVote', async function (req, res) {

        //creating contract object
        var contract = new web3js.eth.Contract(config.lunchExtendedContractABI, config.contractAddressLunchExtended);

        var returnValue = await contract.methods.numVotes().call({ from: config.contractAddressLunchExtended });

        var gasPrice = await web3js.eth.getGasPrice(function (e, r) { console.log('Error: ', e) });

        var latestBlock = await web3js.eth.getBlock("latest");

        var rawTransaction = {
            "from": config.masterAddress,
            "gasPrice": gasPrice,
            "gasLimit": latestBlock.gasLimit,
            "to": config.contractAddressLunch,
            "data": contract.methods.numVotes().encodeABI(),
            "return value": returnValue
        }
        res.send({ rawTransaction });
    });

    app.listen(3000, () => console.log('Example app listening on port 3000!'))

})();
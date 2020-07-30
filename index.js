const web3 = require('web3');
const express = require('express');
const Tx = require('ethereumjs-tx').Transaction;
const axios = require('axios');
const { response } = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Infura HttpProvider Endpoint
//web3js.currentProvider.disconnect();
web3js = new web3(new web3.providers.WebsocketProvider("wss://ropsten.infura.io/ws/v3/674c8c3bc3c64cc6bd6ce5849f05219c"));
// 1 = very low, 2 = low, 3 = acceptable, 4 = good, 5 = very good
const qualityLevel = [1, 2, 3, 4, 5];

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

    app.get('/validName/:name', async function (req, res) {

        var contract = new web3js.eth.Contract(config.contract2ABI, config.contractAddress2);

        var returnValue = await contract.methods.validName(req.params.name).call({ from: config.contractAddress2 });

        // var gasPrice = await web3js.eth.getGasPrice(function (e, r) { console.log('Error: ', e) });

        // var latestBlock = await web3js.eth.getBlock("latest");

        var rawTransaction = {
            "from": config.masterAddress,
            // "gasPrice": gasPrice,
            // "gasLimit": latestBlock.gasLimit,
            "to": config.contractAddress2,
            "return value": returnValue
        }
        res.send({ rawTransaction });
    });

    app.post('/addLocation', async function (req, res) {
        if (!req.body.name) {
            return res.status(400).send({
                success: 'false',
                message: 'name is required'
            });
        }
        var contract = new web3js.eth.Contract(config.contract2ABI, config.contractAddress2);

        var returnValue = await contract.methods.addLocation(req.body.name).call({ from: config.contractAddress2 });
        const location = {
            id: returnValue,
            name: req.body.name
        }

        var myAddress = config.masterAddress;
        var privateKey = Buffer.from(config.privateKey, 'hex')

        var count;
        // get transaction count, later will used as nonce
        web3js.eth.getTransactionCount(myAddress).then(function (v) {
            console.log("Count: " + v);
            count = v;
            var amount = web3js.utils.toHex(1e16);
            //creating raw tranaction
            var rawTransaction = { "from": myAddress, "gasPrice": web3js.utils.toHex(20 * 1e9), "gasLimit": web3js.utils.toHex(210000), "to": config.contractAddress2, "value": "0x0", "data": contract.methods.addLocation(req.body.name).encodeABI(), "nonce": web3js.utils.toHex(count) }
            console.log(rawTransaction);
            //creating tranaction via ethereumjs-tx on ropsten test network
            var transaction = new Tx(rawTransaction, { 'chain': 'ropsten' });
            //signing transaction with private key
            transaction.sign(privateKey);
            //sending transacton via web3js module
            web3js.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'))
                .on('transactionHash', console.log);
        })

        return res.status(201).send({
            success: 'true',
            message: 'location added successfully',
            location
        })
    });

    app.get('/validLocation/:location', async function (req, res) {

        var contract = new web3js.eth.Contract(config.contract2ABI, config.contractAddress2);

        var returnValue = await contract.methods.validLocation(req.params.location).call({ from: config.contractAddress2 });

        // var gasPrice = await web3js.eth.getGasPrice(function (e, r) { console.log('Error: ', e) });

        // var latestBlock = await web3js.eth.getBlock("latest");

        var rawTransaction = {
            "from": config.masterAddress,
            // "gasPrice": gasPrice,
            // "gasLimit": latestBlock.gasLimit,
            "to": config.contractAddress2,
            "return value": returnValue
        }
        res.send({ rawTransaction });
    });

    app.post('/mapLocationToAddress', async function (req, res) {
        if (!req.body.address) {
            return res.status(400).send({
                success: 'false',
                message: 'address is required'
            });
        }
        else if (!req.body.location) {
            return res.status(400).send({
                success: 'false',
                message: 'location is required'
            });
        }
        var contract = new web3js.eth.Contract(config.contract2ABI, config.contractAddress2);

        var returnValue = await contract.methods.mapLocationToAddress(req.body.address, req.body.location).call({ from: config.contractAddress2 });
        const mapping = {
            address: req.body.address,
            location: req.body.location,
            mappingSuccessful: returnValue
        }

        var myAddress = config.masterAddress;
        var privateKey = Buffer.from(config.privateKey, 'hex')

        var count;
        // get transaction count, later will used as nonce
        web3js.eth.getTransactionCount(myAddress).then(function (v) {
            console.log("Count: " + v);
            count = v;
            var amount = web3js.utils.toHex(1e16);
            //creating raw tranaction
            var rawTransaction = { "from": myAddress, "gasPrice": web3js.utils.toHex(20 * 1e9), "gasLimit": web3js.utils.toHex(210000), "to": config.contractAddress2, "value": "0x0", "data": contract.methods.mapLocationToAddress(req.body.address, req.body.location).encodeABI(), "nonce": web3js.utils.toHex(count) }
            console.log(rawTransaction);
            //creating tranaction via ethereumjs-tx on ropsten test network
            var transaction = new Tx(rawTransaction, { 'chain': 'ropsten' });
            //signing transaction with private key
            transaction.sign(privateKey);
            //sending transacton via web3js module
            web3js.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'))
                .on('transactionHash', console.log);
        })

        return res.status(201).send({
            success: 'true',
            message: 'mapping function executed successfully',
            mapping
        })
    });

    app.post('/createBatches', async function (req, res) {
        if (!req.body.commodity) {
            return res.status(400).send({
                success: 'false',
                message: 'commodity is required'
            });
        }
        else if (!req.body.origin) {
            return res.status(400).send({
                success: 'false',
                message: 'origin is required'
            });
        }
        else if (!req.body.owner) {
            return res.status(400).send({
                success: 'false',
                message: 'owner is required'
            });
        }
        else if (!req.body.quantity) {
            return res.status(400).send({
                success: 'false',
                message: 'quantity is required'
            });
        }
        var contract = new web3js.eth.Contract(config.contract2ABI, config.contractAddress2);

        var returnValue = await contract.methods.createBatches(req.body.commodity, req.body.origin, req.body.owner, req.body.quantity).call({ from: config.contractAddress2 });
        const batch = {
            commodity: req.body.commodity,
            origin: req.body.origin,
            owner: req.body.owner,
            requestedQuantity: req.body.quantity,
            batchIdAndActualQuantity: returnValue
        }

        var myAddress = config.masterAddress;
        var privateKey = Buffer.from(config.privateKey, 'hex')

        var count;
        // get transaction count, later will used as nonce
        web3js.eth.getTransactionCount(myAddress).then(function (v) {
            console.log("Count: " + v);
            count = v;
            var amount = web3js.utils.toHex(1e16);
            //creating raw tranaction
            var rawTransaction = { "from": myAddress, "gasPrice": web3js.utils.toHex(20 * 1e9), "gasLimit": web3js.utils.toHex(210000), "to": config.contractAddress2, "value": "0x0", "data": contract.methods.createBatches(req.body.commodity, req.body.origin, req.body.owner, req.body.quantity).encodeABI(), "nonce": web3js.utils.toHex(count) }
            console.log(rawTransaction);
            //creating tranaction via ethereumjs-tx on ropsten test network
            var transaction = new Tx(rawTransaction, { 'chain': 'ropsten' });
            //signing transaction with private key
            transaction.sign(privateKey);
            //sending transacton via web3js module
            web3js.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'))
                .on('transactionHash', console.log);
        })

        return res.status(201).send({
            success: 'true',
            message: 'batch creation function called successfully - see below for further details',
            batch
        })
    });

    app.get('/validBatch/:batch', async function (req, res) {

        var contract = new web3js.eth.Contract(config.contract2ABI, config.contractAddress2);

        var returnValue = await contract.methods.validBatch(req.params.batch).call({ from: config.contractAddress2 });

        // var gasPrice = await web3js.eth.getGasPrice(function (e, r) { console.log('Error: ', e) });

        // var latestBlock = await web3js.eth.getBlock("latest");

        var rawTransaction = {
            "from": config.masterAddress,
            // "gasPrice": gasPrice,
            // "gasLimit": latestBlock.gasLimit,
            "to": config.contractAddress2,
            "return value": returnValue
        }
        res.send({ rawTransaction });
    });

    app.post('/transferBatch', async function (req, res) {
        if (!req.body.selectedBatch) {
            return res.status(400).send({
                success: 'false',
                message: 'selectedBatch is required'
            });
        }
        else if (!req.body.oldOwner) {
            return res.status(400).send({
                success: 'false',
                message: 'oldOwner is required'
            });
        }
        else if (!req.body.newOwner) {
            return res.status(400).send({
                success: 'false',
                message: 'newOwner is required'
            });
        }
        else if (!req.body.price) {
            return res.status(400).send({
                success: 'false',
                message: 'price is required'
            });
        }
        var contract = new web3js.eth.Contract(config.contract2ABI, config.contractAddress2);

        var returnValue = await contract.methods.transferBatch(req.body.selectedBatch, req.body.oldOwner, req.body.newOwner, req.body.price).call({ from: config.contractAddress2 });
        const transfer = {
            selectedBatch: req.body.selectedBatch,
            oldOwner: req.body.oldOwner,
            newOwner: req.body.newOwner,
            price: req.body.price,
            transferSuccessful: returnValue
        }

        var myAddress = config.masterAddress;
        var privateKey = Buffer.from(config.privateKey, 'hex')

        var count;
        // get transaction count, later will used as nonce
        web3js.eth.getTransactionCount(myAddress).then(function (v) {
            console.log("Count: " + v);
            count = v;
            var amount = web3js.utils.toHex(1e16);
            //creating raw tranaction
            var rawTransaction = { "from": myAddress, "gasPrice": web3js.utils.toHex(20 * 1e9), "gasLimit": web3js.utils.toHex(210000), "to": config.contractAddress2, "value": "0x0", "data": contract.methods.transferBatch(req.body.selectedBatch, req.body.oldOwner, req.body.newOwner, req.body.price).encodeABI(), "nonce": web3js.utils.toHex(count) }
            console.log(rawTransaction);
            //creating tranaction via ethereumjs-tx on ropsten test network
            var transaction = new Tx(rawTransaction, { 'chain': 'ropsten' });
            //signing transaction with private key
            transaction.sign(privateKey);
            //sending transacton via web3js module
            web3js.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'))
                .on('transactionHash', console.log);
        })

        return res.status(201).send({
            success: 'true',
            message: 'transfer executed successfully - see below for further details',
            transfer
        })
    });

    app.post('/createQualityRequest', async function (req, res) {
        if (!req.body.batch) {
            return res.status(400).send({
                success: 'false',
                message: 'batch is required'
            });
        }
        var contract = new web3js.eth.Contract(config.contract2ABI, config.contractAddress2);

        contract.methods.createQualityRequest(req.body.batch).call({ from: config.contractAddress2 });
        const batch = {
            batch: req.body.batch
        }

        var myAddress = config.masterAddress;
        var privateKey = Buffer.from(config.privateKey, 'hex')

        var count;
        // get transaction count, later will used as nonce
        web3js.eth.getTransactionCount(myAddress).then(function (v) {
            console.log("Count: " + v);
            count = v;
            var amount = web3js.utils.toHex(1e16);
            //creating raw tranaction
            var rawTransaction = { "from": myAddress, "gasPrice": web3js.utils.toHex(20 * 1e9), "gasLimit": web3js.utils.toHex(210000), "to": config.contractAddress2, "value": "0x0", "data": contract.methods.createQualityRequest(req.body.batch).encodeABI(), "nonce": web3js.utils.toHex(count) }
            console.log(rawTransaction);
            //creating tranaction via ethereumjs-tx on ropsten test network
            var transaction = new Tx(rawTransaction, { 'chain': 'ropsten' });
            //signing transaction with private key
            transaction.sign(privateKey);
            //sending transacton via web3js module
            web3js.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'))
                .on('transactionHash', console.log);
        })

        return res.status(201).send({
            success: 'true',
            message: 'quality request executed successfully',
            batch
        })
    });

    app.get('/getQualityOfBatch/:batch', async function (req, res) {

        var contract = new web3js.eth.Contract(config.contract2ABI, config.contractAddress2);

        var returnValue = await contract.methods.getQualityOfBatch(req.params.batch).call({ from: config.contractAddress2 });

        // var gasPrice = await web3js.eth.getGasPrice(function (e, r) { console.log('Error: ', e) });

        // var latestBlock = await web3js.eth.getBlock("latest");

        var rawTransaction = {
            "from": config.masterAddress,
            // "gasPrice": gasPrice,
            // "gasLimit": latestBlock.gasLimit,
            "to": config.contractAddress2,
            "return value": returnValue
        }
        res.send({ rawTransaction });
    });

    app.post('/openOrResetBankAccount', async function (req, res) {
        if (!req.body.address) {
            return res.status(400).send({
                success: 'false',
                message: 'address is required'
            });
        }
        var contract = new web3js.eth.Contract(config.contract3ABI, config.contractAddress3);

        var returnValue = await contract.methods.openOrResetBankAccount(req.body.address).call({ from: config.contractAddress3 });
        const bankAccount = {
            address: req.body.address,
            initialBalance: 0
        }

        var myAddress = config.masterAddress;
        var privateKey = Buffer.from(config.privateKey, 'hex')

        var count;
        // get transaction count, later will used as nonce
        web3js.eth.getTransactionCount(myAddress).then(function (v) {
            console.log("Count: " + v);
            count = v;
            var amount = web3js.utils.toHex(1e16);
            //creating raw tranaction
            var rawTransaction = { "from": myAddress, "gasPrice": web3js.utils.toHex(20 * 1e9), "gasLimit": web3js.utils.toHex(210000), "to": config.contractAddress3, "value": "0x0", "data": contract.methods.openOrResetBankAccount(req.body.address).encodeABI(), "nonce": web3js.utils.toHex(count) }
            console.log(rawTransaction);
            //creating tranaction via ethereumjs-tx on ropsten test network
            var transaction = new Tx(rawTransaction, { 'chain': 'ropsten' });
            //signing transaction with private key
            transaction.sign(privateKey);
            //sending transacton via web3js module
            web3js.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'))
                .on('transactionHash', console.log);
        })

        return res.status(201).send({
            success: 'true',
            message: 'bank account set up successfully',
            bankAccount
        })
    });

    app.post('/makeDeposit', async function (req, res) {
        if (!req.body.address) {
            return res.status(400).send({
                success: 'false',
                message: 'address is required'
            });
        }
        else if (!req.body.deposit) {
            return res.status(400).send({
                success: 'false',
                message: 'deposit is required'
            });
        }
        var contract = new web3js.eth.Contract(config.contract3ABI, config.contractAddress3);

        var returnValue = await contract.methods.makeDeposit(req.body.address, req.body.deposit).call({ from: config.contractAddress3 });
        const bankAccount = {
            address: req.body.address,
            depositIncrease: req.body.deposit
        }

        var myAddress = config.masterAddress;
        var privateKey = Buffer.from(config.privateKey, 'hex')

        var count;
        // get transaction count, later will used as nonce
        web3js.eth.getTransactionCount(myAddress).then(function (v) {
            console.log("Count: " + v);
            count = v;
            var amount = web3js.utils.toHex(1e16);
            //creating raw tranaction
            var rawTransaction = { "from": myAddress, "gasPrice": web3js.utils.toHex(20 * 1e9), "gasLimit": web3js.utils.toHex(210000), "to": config.contractAddress3, "value": "0x0", "data": contract.methods.makeDeposit(req.body.address, req.body.deposit).encodeABI(), "nonce": web3js.utils.toHex(count) }
            console.log(rawTransaction);
            //creating tranaction via ethereumjs-tx on ropsten test network
            var transaction = new Tx(rawTransaction, { 'chain': 'ropsten' });
            //signing transaction with private key
            transaction.sign(privateKey);
            //sending transacton via web3js module
            web3js.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'))
                .on('transactionHash', console.log);
        })

        return res.status(201).send({
            success: 'true',
            message: 'bank deposit made successfully',
            bankAccount
        })
    });

    app.post('/transfer', async function (req, res) {
        if (!req.body.addressFrom) {
            return res.status(400).send({
                success: 'false',
                message: 'address is required'
            });
        }
        else if (!req.body.addressTo) {
            return res.status(400).send({
                success: 'false',
                message: 'addressTo is required'
            });
        }
        else if (!req.body.amount) {
            return res.status(400).send({
                success: 'false',
                message: 'amount is required'
            });
        }
        var contract = new web3js.eth.Contract(config.contract3ABI, config.contractAddress3);

        var returnValue = await contract.methods.hasFunds(req.body.addressFrom, req.body.amount).call({ from: config.contractAddress3 });
        const transferOverview = {
            addressFrom: req.body.addressFrom,
            addressTo: req.body.addressTo,
            amount: req.body.amount,
            successful: returnValue
        }

        var myAddress = config.masterAddress;
        var privateKey = Buffer.from(config.privateKey, 'hex')

        var count;
        // get transaction count, later will used as nonce
        web3js.eth.getTransactionCount(myAddress).then(function (v) {
            console.log("Count: " + v);
            count = v;
            var amount = web3js.utils.toHex(1e16);
            //creating raw tranaction
            var rawTransaction = { "from": myAddress, "gasPrice": web3js.utils.toHex(20 * 1e9), "gasLimit": web3js.utils.toHex(210000), "to": config.contractAddress3, "value": "0x0", "data": contract.methods.transfer(req.body.addressFrom, req.body.addressTo, req.body.amount).encodeABI(), "nonce": web3js.utils.toHex(count) }
            console.log(rawTransaction);
            //creating tranaction via ethereumjs-tx on ropsten test network
            var transaction = new Tx(rawTransaction, { 'chain': 'ropsten' });
            //signing transaction with private key
            transaction.sign(privateKey);
            //sending transacton via web3js module
            web3js.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'))
                .on('transactionHash', console.log);
        })

        return res.status(201).send({
            success: 'true',
            message: 'bank deposit made successfully',
            transferOverview
        })
    });

    var contract2 = new web3js.eth.Contract(config.contract2ABI, config.contractAddress2);

    contract2.events.NewRequest({
    }, function (error, event) { })
        .on('data', async function (event) {
            console.log(event);
            var sensorProcessing = qualityLevel[Math.floor(Math.random() * qualityLevel.length)];
            var returnValue = await contract2.methods.makeQualityAssessment(event.returnValues.batch, sensorProcessing).call({ from: config.contractAddress2 });

            var myAddress = config.masterAddress;
            var privateKey = Buffer.from(config.privateKey, 'hex')

            var count;
            // get transaction count, later will used as nonce
            web3js.eth.getTransactionCount(myAddress).then(function (v) {
                console.log("Count: " + v);
                count = v;
                var amount = web3js.utils.toHex(1e16);
                //creating raw tranaction
                var rawTransaction = { "from": myAddress, "gasPrice": web3js.utils.toHex(20 * 1e9), "gasLimit": web3js.utils.toHex(210000), "to": config.contractAddress2, "value": "0x0", "data": contract2.methods.makeQualityAssessment(event.returnValues.batch, sensorProcessing).encodeABI(), "nonce": web3js.utils.toHex(count) }
                console.log(rawTransaction);
                //creating tranaction via ethereumjs-tx on ropsten test network
                var transaction = new Tx(rawTransaction, { 'chain': 'ropsten' });
                //signing transaction with private key
                transaction.sign(privateKey);
                //sending transacton via web3js module
                web3js.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'))
                    .on('transactionHash', console.log);
            })

            console.log(returnValue);
            event.removed = true;
        })
        .on('changed', function (event) {
        })
        .on('error', console.error);

    app.listen(3000, () => console.log('Example app listening on port 3000!'))

})();
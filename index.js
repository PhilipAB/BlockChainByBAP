const web3 = require('web3');
const express = require('express');
const Tx = require('ethereumjs-tx').Transaction;
const axios = require('axios');
const { response } = require('express');
const bodyParser = require('body-parser');
const signedTransaction = require('./signed-transactions');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 1 = very low, 2 = low, 3 = acceptable, 4 = good, 5 = very good
const qualityLevel = [1, 2, 3, 4, 5];

app.get("/test", function (request, response) {
    response.send({
        test: 150
    })
});

(async function () {

    const config = await require('./config');

    //Infura HttpProvider Endpoint
    web3js = new web3(new web3.providers.WebsocketProvider("wss://ropsten.infura.io/ws/v3/" + config.projectId));

    //Check if the name for a location is valid
    app.get('/validName/:name', async function (req, res) {

        var contract = new web3js.eth.Contract(config.contract2ABI, config.contractAddress2);

        var returnValue = await contract.methods.validName(req.params.name).call({ from: config.contractAddress2 });

        var rawTransaction = {
            "from": config.masterAddress,
            "to": config.contractAddress2,
            "return value": returnValue
        }
        res.send({ rawTransaction });
    });

    //Add a new location onchain 
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

        signedTransaction(config.masterAddress, config.privateKey, config.contractAddress2, contract.methods.addLocation(req.body.name).encodeABI(), 0);

        return res.status(201).send({
            success: 'true',
            message: 'location added successfully',
            location
        })
    });

    //Verify a specific location
    app.get('/validLocation/:location', async function (req, res) {

        var contract = new web3js.eth.Contract(config.contract2ABI, config.contractAddress2);

        var returnValue = await contract.methods.validLocation(req.params.location).call({ from: config.contractAddress2 });

        var rawTransaction = {
            "from": config.masterAddress,
            "to": config.contractAddress2,
            "return value": returnValue
        }
        res.send({ rawTransaction });
    });

    //Map a location to a specific address
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

        signedTransaction(config.masterAddress, config.privateKey, config.contractAddress2, contract.methods.mapLocationToAddress(req.body.address, req.body.location).encodeABI(), 0);

        return res.status(201).send({
            success: 'true',
            message: 'mapping function executed successfully',
            mapping
        })
    });

    //Create a new batch onchain
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

        signedTransaction(config.masterAddress, config.privateKey, config.contractAddress2, contract.methods.createBatches(req.body.commodity, req.body.origin, req.body.owner, req.body.quantity).encodeABI(), 0);

        return res.status(201).send({
            success: 'true',
            message: 'batch creation function called successfully - see below for further details',
            batch
        })
    });

    //Verify a specific batch
    app.get('/validBatch/:batch', async function (req, res) {

        var contract = new web3js.eth.Contract(config.contract2ABI, config.contractAddress2);

        var returnValue = await contract.methods.validBatch(req.params.batch).call({ from: config.contractAddress2 });

        var rawTransaction = {
            "from": config.masterAddress,
            "to": config.contractAddress2,
            "return value": returnValue
        }
        res.send({ rawTransaction });
    });

    //transfer a batch between to owners
    //make sure that the old owner actually owns the batch and that the new owner has sufficient funds
    //otherwise this method returns false
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

        signedTransaction(config.masterAddress, config.privateKey, config.contractAddress2, contract.methods.transferBatch(req.body.selectedBatch, req.body.oldOwner, req.body.newOwner, req.body.price).encodeABI(), 0);

        return res.status(201).send({
            success: 'true',
            message: 'transfer executed successfully - see below for further details',
            transfer
        })
    });

    //Trigger the sensor to detect the quality of a batch by creating new quality request
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

        signedTransaction(config.masterAddress, config.privateKey, config.contractAddress2, contract.methods.createQualityRequest(req.body.batch).encodeABI(), 0);

        return res.status(201).send({
            success: 'true',
            message: 'quality request executed successfully',
            batch
        })
    });

    //get the quality of a batch
    // 0 = undefined -> no QualityAssessment yet made
    // 1 = very low, 2 = low, 3 = acceptable, 4 = good, 5 = very good
    app.get('/getQualityOfBatch/:batch', async function (req, res) {

        var contract = new web3js.eth.Contract(config.contract2ABI, config.contractAddress2);

        var returnValue = await contract.methods.getQualityOfBatch(req.params.batch).call({ from: config.contractAddress2 });

        var rawTransaction = {
            "from": config.masterAddress,
            "to": config.contractAddress2,
            "return value": returnValue
        }
        res.send({ rawTransaction });
    });

    //Open or reset a bank account for a specific address
    app.post('/openOrResetBankAccount', async function (req, res) {
        if (!req.body.address) {
            return res.status(400).send({
                success: 'false',
                message: 'address is required'
            });
        }
        var contract = new web3js.eth.Contract(config.contract2ABI, config.contractAddress2);

        const bankAccount = {
            address: req.body.address,
            initialBalance: 0
        }

        signedTransaction(config.masterAddress, config.privateKey, config.contractAddress2, contract.methods.openOrResetBankAccount(req.body.address).encodeABI(), 0);

        return res.status(201).send({
            success: 'true',
            message: 'bank account set up successfully',
            bankAccount
        })
    });

    //Make a deposit for the bank account of an specific address
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
        var contract = new web3js.eth.Contract(config.contract2ABI, config.contractAddress2);

        var returnValue = await contract.methods.makeDeposit(req.body.address, req.body.deposit).call({ from: config.contractAddress2 });
        const bankAccount = {
            address: req.body.address,
            depositIncrease: req.body.deposit
        }

        signedTransaction(config.masterAddress, config.privateKey, config.contractAddress2, contract.methods.makeDeposit(req.body.address, req.body.deposit).encodeABI(), 0);

        return res.status(201).send({
            success: 'true',
            message: 'bank deposit made successfully',
            bankAccount
        })
    });

    //Transfer funds between two addresses
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
        var contract = new web3js.eth.Contract(config.contract2ABI, config.contractAddress2);

        var returnValue = await contract.methods.hasFunds(req.body.addressFrom, req.body.amount).call({ from: config.contractAddress2 });
        const transferOverview = {
            addressFrom: req.body.addressFrom,
            addressTo: req.body.addressTo,
            amount: req.body.amount,
            successful: returnValue
        }

        signedTransaction(config.masterAddress, config.privateKey, config.contractAddress2, contract.methods.transfer(req.body.addressFrom, req.body.addressTo, req.body.amount).encodeABI(), 0);

        return res.status(201).send({
            transferOverview
        })
    });

    //Check if an owner actually owns a specific batch
    app.get('/checkOwnership/:address/:batch', async function (req, res) {

        var contract = new web3js.eth.Contract(config.contract2ABI, config.contractAddress2);

        var returnValue = await contract.methods.isOwnerOfBatch(req.params.address, req.params.batch).call({ from: config.contractAddress2 });

        var rawTransaction = {
            "from": config.masterAddress,
            "to": config.contractAddress2,
            "isOwner": returnValue
        }
        res.send({ rawTransaction });
    });

    var contract2 = new web3js.eth.Contract(config.contract2ABI, config.contractAddress2);

    //A NewRequest event is triggered if a quality request has been made
    contract2.events.NewRequest({
    }, function (error, event) { })
        .on('data', async function (event) {
            //The sensor determines the quality of the batch
            var sensorProcessing = qualityLevel[Math.floor(Math.random() * qualityLevel.length)];
            var returnValue = await contract2.methods.makeQualityAssessment(event.returnValues.batch, sensorProcessing).call({ from: config.contractAddress2 });
            
            //The resulting quality is stored onchain
            signedTransaction(config.masterAddress, config.privateKey, config.contractAddress2, contract2.methods.makeQualityAssessment(event.returnValues.batch, sensorProcessing).encodeABI(), 1);

            //logging the quality for debugging purposes
            console.log("Quality: ", returnValue);

            //Removing this specific event, so it won't trigger the sensor again
            event.removed = true;
        })
        .on('changed', function (event) {
        })
        .on('error', console.error);

    app.listen(3000, () => console.log('Example app listening on port 3000!'))

})();
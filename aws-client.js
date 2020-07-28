const AWS = require('aws-sdk');
AWS.config.update({region:'ap-south-2'});
const ssm = new AWS.SSM();

module.exports = ssm;
const AWS = require('aws-sdk');
AWS.config.update({region:'ap-southeast-2'});
const ssm = new AWS.SSM();

module.exports = ssm;
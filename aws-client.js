const AWS = require('aws-sdk');
//Set up of the AWS client - please make sure that you have set the following environment variables on your (local/virtual) machine to run this application:
//AWS_ACCESS_KEY_ID
//AWS_SECRET_ACCESS_KEY
AWS.config.update({region:'ap-southeast-2'});
const ssm = new AWS.SSM();

module.exports = ssm;
const ssm = require('./aws-client');

module.exports = async function getSecret(secretName) {
  console.log(`Getting secret for ${secretName}`);
  const params = {
    Name: secretName,
    WithDecryption: true
  };

  const result = await ssm.getParameter(params).promise();
  return result.Parameter.Value;
};
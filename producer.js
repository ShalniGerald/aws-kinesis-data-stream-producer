const AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({
  region: 'us-east-1' // change if needed
});

const kinesis = new AWS.Kinesis();

const STREAM_NAME = 'transaction-stream';

// Helper: generate a random transaction
function generateTransaction() {
  const userId = 'user' + Math.floor(Math.random() * 5 + 1); // user1 to user5
  const transactionId = 'tx' + Math.floor(Math.random() * 1000000);
  const amount = Math.random() < 0.2 ? 15000 : Math.floor(Math.random() * 1000); // occasionally trigger fraud
  const timestamp = Date.now();
  const location = ['NY', 'CA', 'TX', 'FL', 'WA'][Math.floor(Math.random() * 5)];

  return {
    transactionId,
    userId,
    amount,
    timestamp,
    location
  };
}

// Send transaction to Kinesis
function sendTransaction() {
  const txn = generateTransaction();
  const payload = JSON.stringify(txn);

  const params = {
    Data: payload,
    PartitionKey: txn.userId, // ensures same user lands in same shard
    StreamName: STREAM_NAME
  };

  kinesis.putRecord(params, (err, data) => {
    if (err) {
      console.error('Error sending to Kinesis:', err);
    } else {
      console.log('Sent:', payload);
    }
  });
}

// Send a new transaction every second
setInterval(sendTransaction, 1000);

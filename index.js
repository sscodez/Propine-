const csv = require('csv-parser');
const fs = require('fs');
const request = require('request');

let portfolio = {};

// Read the transactions from the CSV file
fs.createReadStream('data/transactions.csv')
  .pipe(csv())
  .on('data', (data) => {
    // Calculate the portfolio balance for each token
    if (!portfolio[data.token]) {
      portfolio[data.token] = 0;
    }
    if (data.transaction_type === 'DEPOSIT') {
      portfolio[data.token] += parseFloat(data.amount);
    } else if (data.transaction_type === 'WITHDRAWAL') {
      portfolio[data.token] -= parseFloat(data.amount);
    }
  })
  .on('end', () => {
    // Get the latest exchange rates for each token
    for (const token in portfolio) {
      request(`https://min-api.cryptocompare.com/data/price?fsym=${token}&tsyms=USD`, (error, response, body) => {
        if (!error && response.statusCode === 200) {
          const exchangeRate = JSON.parse(body).USD;
          portfolio[token] *= exchangeRate;
          console.log(`${token}: ${portfolio[token]} USD`);
        } else {
          console.error(`Error getting exchange rate for ${token}: ${error}`);
        }
      });
    }
  });

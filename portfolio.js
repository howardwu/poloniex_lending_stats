/* Provide Poloniex API Key and Secret */
var key = '';
var secret = '';

/**************************** DO NOT MODIFY BELOW ****************************/

/*

openLoan:

{ BTC: 
   [ { id: 320223094,
       rate: '0.00018700',
       amount: '0.00142481',
       duration: 2,
       autoRenew: 0,
       date: '2017-01-02 19:44:00' } ],
  ETH: 
   [ { id: 320223083,
       rate: '0.00006000',
       amount: '1.06123745',
       duration: 2,
       autoRenew: 0,
       date: '2017-01-02 19:43:59' },
     { id: 320223081,
       rate: '0.00005990',
       amount: '1.06123745',
       duration: 2,
       autoRenew: 0,
       date: '2017-01-02 19:43:59' } ] }


activeLoan:

{ provided: 
   [ { id: 139577530,
       currency: 'ETH',
       rate: '0.00005900',
       amount: '0.70749164',
       duration: 2,
       autoRenew: 0,
       date: '2017-01-02 19:52:44',
       fees: '0.00000002' },
     { id: 139575957,
       currency: 'BTC',
       rate: '0.00013166',
       amount: '0.01138998',
       duration: 2,
       autoRenew: 0,
       date: '2017-01-02 19:49:40',
       fees: '0.00000000' } ],
  used: [] }

lendingHistory:

[ { id: 247179977,
    currency: 'ETH',
    rate: '0.00006000',
    amount: '7.67100001',
    duration: '1.35490000',
    interest: '0.00062363',
    fee: '-0.00009354',
    earned: '0.00053009',
    open: '2017-01-01 11:31:52',
    close: '2017-01-02 20:02:59' } ]

*/

var Promises = require('promise');

var Poloniex = require('./poloniex.js');
var poloniex = new Poloniex(key, secret);

var start = 1388534400;
var end = new Date().getTime() / 1000;

function checkWallet(lendingWallet, currency) {
	return new Promise((resolve) => {
		if (lendingWallet[currency] === undefined || lendingWallet[currency] === null) {
			lendingWallet[currency] = {
				balance: 0,
				amount: 0,
				interest: 0,
				duration: 0,
				count: 0
			};

			resolve();
		} else {
			resolve();
		}
	});
}

function openLoans(callback) {
	poloniex.returnOpenLoanOffers(function (err, data) {
		if (err) console.log(err);
		else callback(data);
	});
}

function activeLoans(callback) {
	poloniex.returnActiveLoans(function (err, data) {
		if (err) console.log(err);
		else callback(data);
	});
}

function lendingHistory(callback) {
	poloniex.returnLendingHistory(start, end, function (err, data) {
		if (err) console.log(err);
		else callback(data);
	});
}



var lendingWallet = {};

var p1 = new Promise((resolve, reject) => {

	openLoans(function (data) {

		var p = Object.keys(data).map(currency => {

			checkWallet(lendingWallet, currency).then(() => {

				data[currency].map(openLoan => {
					lendingWallet[currency].balance += parseFloat(openLoan.amount);
				});

			});

		});

		Promises.all(p).then(() => { console.log('Open loans...'); resolve() });

	});

}); 


var p2 = new Promise((resolve, reject) => {

	activeLoans(function (res) {

		var p = res.provided.map(activeLoan => {

			checkWallet(lendingWallet, activeLoan.currency).then(() => {

				lendingWallet[activeLoan.currency].balance += parseFloat(activeLoan.amount);

			});
		});

		Promises.all(p).then(() => { console.log('Active loans... '); resolve() });

	});

});

var p3 = new Promise((resolve, reject) => {

	lendingHistory(function (history) {

		var p = history.map(lend => {

			checkWallet(lendingWallet, lend.currency).then(() => {

				lendingWallet[lend.currency].amount += parseFloat(lend.amount);
				lendingWallet[lend.currency].interest += parseFloat(lend.earned);
				lendingWallet[lend.currency].duration += ((new Date(lend.close).getTime() / 1000) - (new Date(lend.open).getTime() / 1000));
				lendingWallet[lend.currency].count += 1;

			});

		});

		Promises.all(p).then(() => { console.log('Lending history... '); resolve() });

	});

});

Promises.all([p3, p2, p1]).then(() => {

	Object.keys(lendingWallet).map(currency => {

		console.log('');
		console.log(currency + ' Return: ' + (lendingWallet[currency].interest / (lendingWallet[currency].balance - lendingWallet[currency].interest)) * 100 + ' %');
		console.log('Number of ' + currency + ' Loans Made: ' + lendingWallet[currency].count + ' Transactions');
		console.log('Total ' + currency + ' Interest Earned: ' + lendingWallet[currency].interest + ' ETH');
		console.log('Total ' + currency + ' Lending Balance: ' + lendingWallet[currency].balance + ' ETH');
		console.log('Total ' + currency + ' Loan Volume: ' + lendingWallet[currency].amount + ' ETH');
		console.log('Average ' + currency + ' Loan Amount: ' + (lendingWallet[currency].amount / lendingWallet[currency].count) + ' ETH');
		console.log('Average ' + currency + ' Loan Duration: ' + (lendingWallet[currency].duration / lendingWallet[currency].count / 3600) + ' hours');
		console.log('');

	});

});

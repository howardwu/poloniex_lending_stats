/* Provide Poloniex API Key and Secret */
var key = '';
var secret = '';

/**************************** DO NOT MODIFY BELOW ****************************/

var Poloniex = require('./poloniex.js');
var poloniex = new Poloniex(key, secret);

var start = 1388534400;
var end = new Date().getTime() / 1000;

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

var totalETHLendingBalance = 0;
var totalBTCLendingBalance = 0;

openLoans(function (data) {
	if (data.ETH !== undefined && data.ETH !== null) {
		for (var i = 0; i < data.ETH.length; i++) {
    		totalETHLendingBalance += parseFloat(data.ETH[i].amount);
    	}
	}

	if (data.BTC !== undefined && data.BTC !== null) {
		for (var i = 0; i < data.BTC.length; i++) {
    		totalBTCLendingBalance += parseFloat(data.BTC[i].amount);
    	}
	}

	activeLoans(function (res) {
		for (var i = 0; i < res.provided.length; i++) {
        	if (res.provided[i].currency === 'ETH') {
        		totalETHLendingBalance += parseFloat(res.provided[i].amount);
        	}
          	else if (res.provided[i].currency === 'BTC') {
        		totalBTCLendingBalance += parseFloat(res.provided[i].amount);
        	}
    	}

    	lendingHistory(function (history) {
    		var totalETHAmount = 0;
    		var totalETHInterest = 0;
    		var totalETHDuration = 0;
    		var totalETHCount = 0;

    		var totalBTCAmount = 0;
    		var totalBTCInterest = 0;
    		var totalBTCDuration = 0;
    		var totalBTCCount = 0;


			for (var i = 0; i < history.length; i++) {
				var lend = history[i];

				if (lend.currency === 'ETH') {
					totalETHAmount += parseFloat(lend.amount);
					totalETHInterest += parseFloat(lend.earned);
					totalETHDuration += ((new Date(lend.close).getTime() / 1000) - (new Date(lend.open).getTime() / 1000));
					totalETHCount += 1;
				}
				else if (lend.currency === 'BTC') {
					totalBTCAmount += parseFloat(lend.amount);
					totalBTCInterest += parseFloat(lend.earned);
					totalBTCDuration += ((new Date(lend.close).getTime() / 1000) - (new Date(lend.open).getTime() / 1000));
					totalBTCCount += 1;
				}

				if (i === history.length - 1) {
					console.log('');
					console.log('ETH Return: ' + (totalETHInterest / totalETHLendingBalance) * 100 + ' %');
					console.log('Number of ETH Loans Made: ' + totalETHCount + ' Transactions');
					console.log('Total ETH Interest Earned: ' + totalETHInterest + ' ETH');
					console.log('Total ETH Lending Balance: ' + totalETHLendingBalance + ' ETH');
					console.log('Total ETH Loan Volume: ' + totalETHAmount + ' ETH');
					console.log('Average ETH Loan Amount: ' + (totalETHAmount / totalETHCount) + ' ETH');
					console.log('Average ETH Loan Duration: ' + (totalETHDuration / totalETHCount / 3600) + ' hours');
					console.log('');
					console.log('BTC Return: ' + (totalBTCInterest / totalBTCLendingBalance) * 100 + ' %');
					console.log('Number of BTC Loans Made: ' + totalBTCCount + ' Transactions');
					console.log('Total BTC Interest Earned: ' + totalBTCInterest + ' BTC');
					console.log('Total BTC Lending Balance: ' + totalBTCLendingBalance + ' BTC');
					console.log('Total BTC Loan Volume: ' + totalBTCAmount + ' BTC');
					console.log('Average BTC Loan Amount: ' + (totalBTCAmount / totalBTCCount) + ' BTC');
					console.log('Average BTC Loan Duration: ' + (totalBTCDuration / totalBTCCount / 3600) + ' hours');
					console.log('');
				}
			}

    	});
	});
});


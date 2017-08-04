// Created with Remix IDE and Metamask on Ropsten
var contractAddress = '0x07a5e64f13e608509ad5c60e4d7f975b28ae155b';
var contractOwner = '0x53022f4f4e8672c56499eb6b69bf62d727b6d071';
var contractAbi =
    [{ "constant": true, "inputs": [{ "name": "_user", "type": "address" }, { "name": "_txid", "type": "uint256" }], "name": "existsOwner", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "type": "function" }, { "constant": true, "inputs": [{ "name": "_txid", "type": "uint256" }], "name": "exists", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "type": "function" }, { "constant": true, "inputs": [{ "name": "_txid", "type": "uint256" }], "name": "getTransactionStatus", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "type": "function" }, { "constant": false, "inputs": [{ "name": "_user", "type": "address" }, { "name": "_txid", "type": "uint256" }], "name": "addTransaction", "outputs": [], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "type": "function" }, { "constant": false, "inputs": [{ "name": "_txid", "type": "uint256" }], "name": "confirmTransaction", "outputs": [], "payable": false, "type": "function" }, { "constant": true, "inputs": [{ "name": "_user", "type": "address" }, { "name": "_txid", "type": "uint256" }], "name": "getTransactionStatusOwner", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "type": "function" }, { "inputs": [], "payable": false, "type": "constructor" }];


var contract = web3.eth.contract(contractAbi).at(contractAddress);

function fetchLocalData() {
    return {
        23011:
        {
            details: 'You bought 8.375.394,75 INR against 100.000,00 GBP with value date 04-8-2017 with the following exchange rate 1 GBP = 83,7539 INR.',
        },
        14055:
        {
            details: 'You sold 5.750,00 CNY against 94.242,99 JPY with value date 04-08-2017 at the following exchange rate 1 CNY = 16.3901 JPY'
        }
    }
}

// TODO, fetch() not implemented
function fetchRemoteData() {
    try {
        fetch('http://10.162.130.120:7878/pending.json').then(function (data) {
            status.sendMessage('Done!');
            console.log('done');
        }).catch(function (e) {
            status.sendMessage('Failed!');
            console.log('err');
        });
    } catch (e) {
        status.sendMessage('Error!');
        console.log('error');
    }
}

function getMyBalance(context, result) {
    try {
        var balance = web3.fromWei(web3.eth.getBalance(context.from), 'ether');
        result['text-message'] = 'You have ' + balance.toString() + ' ETH';
    } catch (e) {
        result.err = e;
    }
}

function getMyPendingTxs(result) {
    var data = fetchLocalData();

    result['text-message'] = ('Here are your current transactions:\n');

    for (var tx in data) {
        if (tx)
            result['text-message'] += '\nTransaction: ' + tx;
    };

    result['text-message'] += '\n\nTo get more details about any transaction type its ID number here';
}

status.addListener('init', function (params, context) {
    status.sendMessage('G\'day');
    status.sendMessage('I recognize keywords in chat like: balance, account, contract, status and transaction numbers');
    status.sendMessage('For everything else, I will be as unhelpful as possible :)')
});

status.addListener('on-message-send', function (params, context) {
    var result = {
        err: null,
        data: null,
        messages: []
    };

    var message = params.message;
    var txid;

    if (message.match(/balance/i)) {
        getMyBalance(context, result);
    } else if (message.match(/status/i)) {
        getMyPendingTxs(result);
    } else if (message.match(/account/i)) {
        result['text-message'] = 'Your account is 0x' + context.from;
    } else if (message.match(/contract/i)) {
        result['text-message'] = 'We are currently using the contract at ' + contractAddress;
    } else {
        txid = message.match(/[1-9]+[0-9]*/);
        if (txid) {
            var txs = fetchLocalData();
            var tx = txs[txid];
            if (tx) {
                result['text-message'] = 'Here are the transaction details for ' + txid + ' : \n' + tx.details + '\n\n';

                var txExists = contract.exists(txid);
                var txStatus = contract.getTransactionStatus(txid);
                if (!txExists) {
                    result['text-message'] += '\nLooks like this transaction does not exist in our smart contract'
                }
                else if (!txStatus) {
                    result['text-message'] += '\nIf you want to confirm this transaction use the /confirm command';
                } else {
                    result['text-message'] += '\nThis transaction is already confirmed. Thank you!';
                }
            } else {
                result['text-message'] = 'I am not aware of a transaction with the ID ' + txid;
            }
        } else {
            result['text-message'] = 'I am not smart enough to answer that :('
        }
    }

    return result;
});

status.command({
    name: 'confirm',
    title: 'Confirm',
    description: 'Confirm transaction',
    color: 'green',
    sequentialParams: true,
    params: [{
        name: 'txid',
        type: status.types.NUMBER,
        placeholder: 'transaction number'
    }],
    preview: function (params, context) {
        return { markup: status.components.text({}, 'Confirm transaction ' + params.txid) };
    },
    handler: function (params, context) {
        // Defensive programming: On
        try {
            var txStatus = contract.getTransactionStatus(params.txid);
            if (txStatus) {
                return status.sendMessage('Transaction was already approved, sir');
            }

            var exists = contract.exists(params.txid);
            if (!exists) {
                return status.sendMessage('Seems this transaction does not exist in our smart contract');
            }

            contract.confirmTransaction(params.txid, { from: context.from });
        } catch (e) {
            status.sendMessage('Boing, error: ' + e);
        }
    }
});


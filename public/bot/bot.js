status.command({
    name: "hello",
    title: "HelloBot",
    description: "Helps you say hello",
    color: "#CCCCCC",
    preview: function (params) {
        var text = status.components.text(
            {
                style: {
                    marginTop: 5,
                    marginHorizontal: 0,
                    fontSize: 14,
                    fontFamily: "font",
                    color: "black"
                }
            }, "Hello from the other side!");
        return { markup: status.components.view({}, [text]) };
    }
});

var eliza = {};

// Created with Remix IDE and Metamask on Ropsten
var contractAddress = '0x03749a095ec23d8108f7338b09ced562db0195b7';
var contractOwner = '0x53022f4f4e8672c56499eb6b69bf62d727b6d071';
var contractAbi =
    [{ "constant": true, "inputs": [{ "name": "_txid", "type": "uint256" }], "name": "getTransactionStatus", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "type": "function" }, { "constant": false, "inputs": [{ "name": "_user", "type": "address" }, { "name": "_txid", "type": "uint256" }], "name": "addTransaction", "outputs": [], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "type": "function" }, { "constant": false, "inputs": [{ "name": "_txid", "type": "uint256" }], "name": "confirmTransaction", "outputs": [], "payable": false, "type": "function" }, { "inputs": [], "payable": false, "type": "constructor" }];

var contract = web3.eth.contract(contractAbi).at(contractAddress);

function fetchLocalData() {
    return {
        49014:
        {
            details: 'The bank will pay for this transaction upon approval',
        },
        78900:
        {
            details: 'Please confirm you want your funds transfered out of account RX566900'
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

    result['text-message'] = ('Let\'s see if I have anything for you...\n');

    for (var tx in data) {
        if (tx)
            result['text-message'] += '\nPending transaction: ' + tx;
    };

    result['text-message'] += '\n\nTo get more details about any transaction type its ID number here';
}

status.addListener('init', function (params, context) {
    status.sendMessage('G\'day');
    status.sendMessage('I recognize keywords in chat like: balance, account, status, transaction IDs');
    status.sendMessage('For everything else, my friend Eliza will be as unhelpful as possible :)')
    eliza.start();
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
    } else {
        txid = message.match(/[1-9]+[0-9]*/);
        if (txid) {
            var txs = fetchLocalData();
            var tx = txs[txid];
            if (tx) {
                result['text-message'] = 'Here are the transaction details for ' + txid + ' : \n' + tx.details + '\n\n';

                var txStatus = contract.getTransactionStatus(txid);
                if (!txStatus) {
                    result['text-message'] += '\nIf you want to confirm this transaction use the /confirm command';
                } else {
                    result['text-message'] += '\nThis transaction is already confirmed. Thank you!';
                }
            } else {
                result['text-message'] = 'I am not aware of a transaction with the ID ' + txid;
            }
        } else {
            // Take it away Eliza
            result['text-message'] = eliza.reply(message);
        }
    }

    return result;
});
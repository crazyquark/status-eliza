function fetchLocalData() {
    console.log('Getting local data');
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

// TODO
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
        result['text-message'] = 'Man, you (0x' + context.from + ') have ' + balance.toString() + ' ETH, you filthy animal!';
    } catch (e) {
        result.err = e;
    }
}

status.addListener('init', function (params, context) {
    status.sendMessage('G\'day, use /status to list your pending transactions');
});

status.addListener('on-message-send', function (params, context) {
    var result = {
        err: null,
        data: null,
        messages: []
    };

    console.log('Bot here');

    return result;
});

status.command({
    name: 'status',
    title: 'Transactions',
    description: 'Pulls pending transactions',
    color: 'green',
    preview: function () {
        var text = status.components.text(
            {
                style: {
                    marginTop: 5,
                    marginHorizontal: 0,
                    fontSize: 14,
                    fontFamily: 'font',
                    color: 'black'
                }
            }, '^^ Here is your status ^^');
        return { markup: status.components.view({}, [text]) };
    },
    handler: function (params) {
        var data = fetchLocalData();

        for (var tx in data) {
            status.sendMessage('Transaction that needs confirmation: ' + tx);
        };
    }
});

// status.command({
//      name: 'greet',
//      title: 'Greeter',
//      description: 'Helps you choose greetings',
//      color: '#0000ff',
//      params: [{
//               name: 'greet',
//               type: status.types.TEXT,
//               suggestions: helloSuggestions
//              }]
//  });

// function suggestionsContainerStyle(suggestionsCount) {
//     return {
//         marginVertical: 1,
//         marginHorizontal: 0,
//         keyboardShouldPersistTaps: 'always',
//         height: Math.min(150, (56 * suggestionsCount)),
//         backgroundColor: 'white',
//         borderRadius: 5,
//         flexGrow: 1
//     };
// }
// var suggestionSubContainerStyle = {
//     height: 56,
//     borderBottomWidth: 1,
//     borderBottomColor: '#0000001f'
// };
// var valueStyle = {
//     marginTop: 9,
//     fontSize: 14,
//     fontFamily: 'font',
//     color: '#000000de'
// };

// function helloSuggestions() {
//     var suggestions = ['Hello', 'Goodbye'].map(function(entry) {
//         return status.components.touchable(
//             {onPress: status.components.dispatch([status.events.SET_VALUE, entry])},
//             status.components.view(
//                 suggestionsContainerStyle,
//                 [status.components.view(
//                     suggestionSubContainerStyle,
//                     [
//                         status.components.text(
//                             {style: valueStyle},
//                             entry
//                         )
//                     ]
//                 )]
//             )
//         );
//     });

//     // Let's wrap those two touchable buttons in a scrollView
//     var view = status.components.scrollView(
//         suggestionsContainerStyle(2),
//         suggestions
//     );

//     // Give back the whole thing inside an object.
//     return {markup: view};
// }

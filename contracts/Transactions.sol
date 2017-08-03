pragma solidity 0.4.14;

contract Transactions {
    struct Transaction {
        uint txid;
        bool exists;
        bool confirmed;
    }
    
    // User to confirm -> map of TX ID and confirmation status
    mapping(address => mapping(uint => Transaction)) transactions;
    
    address public owner;
    
    modifier restricted() {
        if (msg.sender == owner) _;
    }
  
    function Transactions() {
        owner = msg.sender;
    }
    
    function addTransaction(address _user, uint _txid) restricted {
        if (transactions[_user][_txid].exists) {
            revert();
        }
        
        transactions[_user][_txid] = Transaction({txid: _txid, exists: true, confirmed: false});
    }
    
    function confirmTransaction(uint _txid) {
        if (!transactions[msg.sender][_txid].exists) {
            revert();
        }
        
        transactions[msg.sender][_txid].confirmed = true;
    }
    
    function getTransactionStatus(uint _txid) constant returns (bool) {
        return transactions[msg.sender][_txid].confirmed;
    }
}
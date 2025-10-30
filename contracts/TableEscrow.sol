// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TableEscrow
 * @notice Simple vault that receives from transferWithAuthorization and pays out to winners
 * Prevents N?N transfers (we do negatives ? escrow ? positives)
 */
contract TableEscrow {
    address public facilitator;
    address public token; // USDC or b402 relayer token wrapper
    mapping(address => uint256) public balance;

    event PaidIn(address indexed from, uint256 amount);
    event PaidOut(address indexed to, uint256 amount);
    event Settled(uint256 indexed handNo, bytes32 receiptHash, bytes32 txHash);

    modifier onlyFacilitator() {
        require(msg.sender == facilitator, "not fac");
        _;
    }

    constructor(address _token, address _fac) {
        token = _token;
        facilitator = _fac;
    }

    /**
     * @notice Called by facilitator after transferWithAuthorization moves funds here
     * In practice, you'd credit by reading actual token balance deltas (safer)
     */
    function credit(address p, uint256 amt) external onlyFacilitator {
        balance[p] += amt;
        emit PaidIn(p, amt);
    }

    /**
     * @notice Pay out to winner (debit from escrow and transfer ERC20)
     */
    function debit(address p, uint256 amt) external onlyFacilitator {
        require(balance[p] >= amt, "insufficient");
        balance[p] -= amt;
        
        // Transfer ERC20 to p
        (bool ok, bytes memory data) = token.call(
            abi.encodeWithSignature("transfer(address,uint256)", p, amt)
        );
        require(ok && (data.length == 0 || abi.decode(data, (bool))), "xfer fail");
        emit PaidOut(p, amt);
    }

    /**
     * @notice Batch debit multiple winners in one transaction
     */
    function batchDebit(address[] calldata recipients, uint256[] calldata amounts) external onlyFacilitator {
        require(recipients.length == amounts.length, "length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(balance[recipients[i]] >= amounts[i], "insufficient");
            balance[recipients[i]] -= amounts[i];
            
            (bool ok, bytes memory data) = token.call(
                abi.encodeWithSignature("transfer(address,uint256)", recipients[i], amounts[i])
            );
            require(ok && (data.length == 0 || abi.decode(data, (bool))), "xfer fail");
            emit PaidOut(recipients[i], amounts[i]);
        }
    }

    /**
     * @notice Emit settlement event
     */
    function emitSettled(uint256 handNo, bytes32 receiptHash, bytes32 txHash) external onlyFacilitator {
        emit Settled(handNo, receiptHash, txHash);
    }
}

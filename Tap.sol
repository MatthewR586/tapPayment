// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Tap is Ownable {
    using SafeERC20 for IERC20;

    mapping(uint32 => uint32) public burners_mapping;
    address public ownerAddress; // Additional owner address storage
    address public managerAddress;
    uint256 public ownerFee;
    uint256 public managerFee;

    event Transaction(address from, string txType);
    event MyselfTransfer(address indexed msg_sender_address, uint256 _value);
    event OwnerAddressChanged(address oldOwner, address newOwner);

    constructor() Ownable(msg.sender) {
        updateBurnerMap(0, 100);
        ownerAddress = owner(); // Initialize with deployer address
        managerAddress = owner();
    }

    // Add this function to allow changing ownerAddress
    function setOwnerAddress(address _newOwnerAddress) external onlyOwner {
        require(_newOwnerAddress != address(0), "Invalid address");
        emit OwnerAddressChanged(ownerAddress, _newOwnerAddress);
        ownerAddress = _newOwnerAddress;
    }
    function setManagerAddress(address _newManagerAddress) external onlyOwner {
        require(_newManagerAddress != address(0), "Invalid address");
        managerAddress = _newManagerAddress;
    }
    function setManagerFee(uint256 _newManagerFee) external onlyOwner {
        require(_newManagerFee >= 0, "Wrong interaction");
        managerFee = _newManagerFee;
    }
    function setOwnerFee(uint256 _newOwnerFee) external onlyOwner {
        require(_newOwnerFee >= 0, "Wrong interaction");
        ownerFee = _newOwnerFee;
    }

    function updateBurnerMap(uint32 from_index, uint32 to_index)
        public
        onlyOwner
    {
        require(to_index > from_index, "Invalid range");
        for (uint32 i = from_index; i < to_index; i++) {
            burners_mapping[i] = 2**32 - 1;
        }
    }

    function internalBurn(
        uint32 key_id,
        uint32 remove_amount,
        uint32 min_burner_amount
    ) internal {
        require(
            burners_mapping[key_id] >= remove_amount,
            "Not enough value for this key_id"
        );
        require(
            (burners_mapping[key_id] - remove_amount) >= min_burner_amount,
            "Below min burner amount"
        );
        burners_mapping[key_id] -= remove_amount;
    }

    function useBurner(
        uint256 fee_amount,
        address sender
    ) external payable {
        emit MyselfTransfer(msg.sender, msg.value);
        require(msg.value >= fee_amount, "Insufficiant amount");
        uint256 adjustedAmount = msg.value - fee_amount;
        uint256 toSender = (adjustedAmount * 99) / 100;
        uint256 toOwner = msg.value - toSender; // More precise calculation

        payable(sender).transfer(toSender);
        payable (ownerAddress).transfer(toOwner);
    }

    function useBurnerForErcSc(
        address coin,
        uint256 amount,
        address sender
    ) external {
        uint256 fee = ownerFee + managerFee; 
        require(amount >= fee, "Insufficient fee");
        uint256 adjustedAmount = amount - fee;
        uint256 toSender = adjustedAmount;
                
        IERC20(coin).safeTransferFrom(msg.sender, sender, toSender);
        
        IERC20(coin).safeTransferFrom(msg.sender, ownerAddress, ownerFee);
        IERC20(coin).safeTransferFrom(msg.sender, managerAddress, managerFee);

        emit Transaction(msg.sender, "erc-sc");
    }

    function getBurner(uint32 key_id) external view returns (uint256) {
        return burners_mapping[key_id];
    }

    function transfer(address payable _receiver, uint256 amount)
        external
        onlyOwner
    {
        _receiver.transfer(amount);
    }

    function transferERC(
        address _receiver,
        address token,
        uint256 amount
    ) external onlyOwner {
        IERC20(token).safeTransfer(_receiver, amount);
    }

    receive() external payable {
        emit Transaction(msg.sender, "receive");
    }

    fallback() external payable {
        emit Transaction(msg.sender, "fallback");
    }
}

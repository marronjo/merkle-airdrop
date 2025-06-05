// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20, SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleAirdrop {
    using SafeERC20 for IERC20;

    error MerkleAirdrop__InvalidProof();
    error MerkleAirdrop__AlreadyClaimed();

    IERC20 private immutable i_airdropToken;
    bytes32 private immutable i_rootHash;

    mapping(address user => bool claimed) private s_hasClaimed;

    event Claimed(address indexed account, uint256 amount);

    constructor(bytes32 root, IERC20 token){
        i_airdropToken = token;
        i_rootHash = root;
    }

    function claim(address account, uint256 amount, bytes32[] calldata merkleProof) external {
        if(s_hasClaimed[account]){
            revert MerkleAirdrop__AlreadyClaimed();
        }

        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(account, amount))));

        if(!MerkleProof.verify(merkleProof, i_rootHash, leaf)){
            revert MerkleAirdrop__InvalidProof();
        }

        s_hasClaimed[account] = true;
        emit Claimed(account, amount);

        i_airdropToken.safeTransfer(account, amount);
    }

    function getMerkleRoot() external view returns(bytes32){
        return i_rootHash;
    }

    function getAirdropToken() external view returns(IERC20){
        return i_airdropToken;
    }
}

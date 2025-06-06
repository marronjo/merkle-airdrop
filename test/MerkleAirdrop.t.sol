// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MerkleAirdrop} from "../src/MerkleAirdrop.sol";
import {AirdropToken} from "../src/AirdropToken.sol";

contract MerkleAirdropTest is Test {

    MerkleAirdrop private merkleAirdrop;
    AirdropToken private token;

    address user;
    uint256 userPrivKey;

    bytes32 private root = bytes32(0xbe8c0ca0528696387b5b52486e7bdebf6a1c53e3adcd6df3d566ef338e924e0f);

    bytes32[] private userProof = [
        bytes32(0xef54b0c83407e0c74021e9c900344391f8b30fb6c98e7689f3c6015840959d08),
        bytes32(0xaf54f4c1ffaace224204799f4ac4ae7b9ec3437ee6e3e72a911513f0ed95ba8b)
    ];

    function setUp() public {
        token = new AirdropToken();
        merkleAirdrop = new MerkleAirdrop(root, token);

        token.mint(address(merkleAirdrop), 1e50);

        (user, userPrivKey) = makeAddrAndKey("user");
    }

    function testUserCanClaim() public {
        assertEq(token.balanceOf(user), 0);

        vm.prank(user);
        merkleAirdrop.claim(user, 25e18, userProof);

        assertEq(token.balanceOf(user), 25e18);
    }
}

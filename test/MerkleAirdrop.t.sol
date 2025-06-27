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
        makeAddrAndKey("user1");
        makeAddrAndKey("user2");
        makeAddrAndKey("user3");
        makeAddrAndKey("user4"); //0x90561e5Cd8025FA6F52d849e8867C14A77C94BA0
        makeAddrAndKey("user5"); //0x22068447936722AcB3481F41eE8a0B7125526D55
        makeAddrAndKey("user6"); //0xc1268511E6bC61c44C096f7F25B813Bd5531b64a
        makeAddrAndKey("user7"); //0xD2D67024f7cA52d0F49d02329DDFD1b3Edae9351
    }

    function testUserCanClaim() public {
        assertEq(token.balanceOf(user), 0);

        vm.prank(user);
        merkleAirdrop.claim(user, 25e18, userProof);

        assertEq(token.balanceOf(user), 25e18);

        makeAddrAndKey("user1");
        makeAddrAndKey("user2");
        makeAddrAndKey("user3");
        makeAddrAndKey("user4");
        makeAddrAndKey("user5");
        makeAddrAndKey("user6");
        makeAddrAndKey("user7");
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {stdJson} from "forge-std/StdJson.sol";
import {console} from "forge-std/console.sol";

// Merkle tree input file generator script
contract GenerateInput is Script {
    uint256 private constant AMOUNT = 25 * 1e18;
    string[] types = new string[](2);
    uint256 count;
    string[] whitelist = new string[](8);
    string private constant  INPUT_PATH = "/script/target/input.json";

    function run() public {
        types[0] = "address";
        types[1] = "uint";

        //standard user addresses
        whitelist[0] = "0x6CA6d1e2D5347Bfab1d91e883F1915560e09129D";    // "user"
        whitelist[1] = "0x29E3b139f4393aDda86303fcdAa35F60Bb7092bF";    // "user1"
        whitelist[2] = "0x537C8f3d3E18dF5517a58B3fB9D9143697996802";    // "user2"
        whitelist[3] = "0xc0A55e2205B289a967823662B841Bd67Aa362Aec";    // "user3"
        whitelist[4] = "0x90561e5Cd8025FA6F52d849e8867C14A77C94BA0";    // "user4"
        whitelist[5] = "0x22068447936722AcB3481F41eE8a0B7125526D55";    // "user5"
        whitelist[6] = "0xc1268511E6bC61c44C096f7F25B813Bd5531b64a";    // "user6"
        whitelist[7] = "0xD2D67024f7cA52d0F49d02329DDFD1b3Edae9351";    // "user7"
        count = whitelist.length;
        string memory input = _createJSON();
        // write to the output file the stringified output json tree dump
        vm.writeFile(string.concat(vm.projectRoot(), INPUT_PATH), input);

        console.log("DONE: The output is found at %s", INPUT_PATH);
    }

    function _createJSON() internal view returns (string memory) {
        string memory countString = vm.toString(count); // convert count to string
        string memory amountString = vm.toString(AMOUNT); // convert amount to string
        string memory json = string.concat('{ "types": ["address", "uint"], "count":', countString, ',"values": {');
        for (uint256 i = 0; i < whitelist.length; i++) {
            if (i == whitelist.length - 1) {
                json = string.concat(json, '"', vm.toString(i), '"', ': { "0":', '"',whitelist[i],'"',', "1":', '"',amountString,'"', ' }');
            } else {
            json = string.concat(json, '"', vm.toString(i), '"', ': { "0":', '"',whitelist[i],'"',', "1":', '"',amountString,'"', ' },');
            }
        }
        json = string.concat(json, '} }');

        return json;
    }
}
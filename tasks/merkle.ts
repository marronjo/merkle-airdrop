import { task } from 'hardhat/config'

import inputJson from './target/input.json';

type MerkleInput = {
    types: string[];
    values: string[][];
}

task('read-merkle-input').setAction(async (taskArgs, hre) => {
    const coder = hre.ethers.AbiCoder.defaultAbiCoder();

    const input = inputJson as MerkleInput;
    let leaves: string[] = [];

    for(const value of input.values){
        const output = coder.encode(input.types, value);
        const leaf = hre.ethers.keccak256(hre.ethers.keccak256(output));
        leaves.push(leaf);
    }

    console.log('Merkle Root : ' + hashLeaves(leaves, hre));
});

// recurse through each level in the tree
// hash leaves together until a single 'root' is left
const hashLeaves = (leaves: string[], hre: any) : string => {
    if(leaves.length === 1) return leaves[0];

    let level: string[] = [];

    for(let i = 0; i < leaves.length; i += 2){
        const [v0, v1] = [leaves[i], i + 1 < leaves.length ? leaves[i+1] : 0]; 
        const [lo, hi] = BigInt(v0) < BigInt(v1) ? [v0, v1] : [v1, v0];
        const combined = hre.ethers.solidityPacked(['bytes32', 'bytes32'], [lo, hi]);
        const hash = hre.ethers.keccak256(combined);
        level.push(hash);
    }

    return hashLeaves(level, hre);
}

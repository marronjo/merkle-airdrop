import { task } from 'hardhat/config'

import inputJson from './target/input.json';

type MerkleInput = {
    types: string[];
    values: string[][];
}

task('read-merkle-input').setAction(async (taskArgs, hre) => {
    const input = inputJson as MerkleInput;

    for(const value of input.values){
        console.log('1. ' + input.types[0] + ': ' + value[0]);
        console.log('2. ' + input.types[1] + ': ' + value[1]);

        const coder = hre.ethers.AbiCoder.defaultAbiCoder();
        const output = coder.encode([input.types[0], input.types[1]], [value[0], value[1]]);

        const leaf = hre.ethers.keccak256(hre.ethers.keccak256(output));
        console.log('3. Leaf : ' + leaf);
        console.log('');
    }
});

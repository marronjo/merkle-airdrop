import { task } from 'hardhat/config'

import inputJson from './target/input.json';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

type MerkleInput = {
    types: string[];
    values: string[][];
}

task('create-merkle-tree').setAction(async (taskArgs, hre) => {
    const coder = hre.ethers.AbiCoder.defaultAbiCoder();
    const input = inputJson as MerkleInput;

    let leaves: string[] = input.values.map(entry => {
        const output = coder.encode(input.types, entry);
        return hre.ethers.keccak256(hre.ethers.keccak256(output));
    });

    let levels: string[][] = [leaves];

    console.log('\n--- Merkle Root ---')
    console.log(generateMerkleRoot(leaves, levels, hre));

    console.log('\n--- Merkle Tree ---');
    console.log(levels);

    console.log('\n--- Proofs ---');
    for(let i = 0; i < leaves.length - 1; i++){
        console.log('Proof : ' + i);
        console.log(getProof(levels, i));
    }
});

// recurse through each level in the tree
// hash leaves together until a single 'root' is left
// construct levels in each iteration of the tree
const generateMerkleRoot = (leaves: string[], levels: string[][], hre: HardhatRuntimeEnvironment) : string => {
    if(leaves.length === 1) return leaves[0];
    let level: string[] = [];

    for(let i = 0; i < leaves.length; i += 2){
        const [v0, v1] = [leaves[i], i + 1 < leaves.length ? leaves[i+1] : hre.ethers.ZeroHash];
        const [lo, hi] = BigInt(v0) < BigInt(v1) ? [v0, v1] : [v1, v0];
        const combined = hre.ethers.solidityPacked(['bytes32', 'bytes32'], [lo, hi]);
        const hash = hre.ethers.keccak256(combined);
        level.push(hash);
    }

    levels.push(level);
    return generateMerkleRoot(level, levels, hre);
}

const getProof = (levels: string[][], index: number) : string[] => {
    if(levels.length === 1 || index > levels[0].length - 1) return [];

    let proof : string[] = [];
    let currentIdx = index;

    for(let i = 0; i < levels.length - 1; i++){
        let sibling = currentIdx % 2 == 0 ? currentIdx + 1 : currentIdx - 1;
        proof.push(levels[i][sibling]);
        currentIdx = Math.floor(currentIdx/2);
    }

    return proof;
}

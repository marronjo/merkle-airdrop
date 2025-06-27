import { task } from 'hardhat/config'

import inputJson from './target/input.json';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

enum Action {
    MERKLE_LEAVES,  //print all leaves
    MERKLE_ROOT,    //print just the root
    MERKLE_PROOF,   //print single proof
    MERKLE_PROOFS,  //print all proofs
    MERKLE_TREE,    //print entire tree
}

type MerkleInput = {
    types: string[];
    values: string[][];
}

task('merkle-tree').setAction(async (_, hre) => {
    handleTask(hre, Action.MERKLE_TREE, 0);
});

task('merkle-leaves').setAction(async (_, hre) => {
    handleTask(hre, Action.MERKLE_LEAVES, 0);
});

task('merkle-root').setAction(async (_, hre) => {
    handleTask(hre, Action.MERKLE_ROOT, 0);
});

task('merkle-proof').addPositionalParam("index").setAction(async (taskArgs, hre) => {
    handleTask(hre, Action.MERKLE_PROOF, +taskArgs.index);
});

task('merkle-proofs').setAction(async (_, hre) => {
    handleTask(hre, Action.MERKLE_PROOFS, 0);
});

const handleTask = (hre: HardhatRuntimeEnvironment, action: Action, index: number) => {
    const input = inputJson as MerkleInput;

    const leaves: string[] = hashLeaves(input.values, input.types, hre);
    const levels: string[][] = [leaves];
    const root: string = generateMerkleRoot(leaves, levels, hre);

    switch(action){
        case Action.MERKLE_LEAVES:
            console.log('--- Merkle Leaves ---');
            console.log(leaves);
            return;
        case Action.MERKLE_ROOT:
            console.log('--- Merkle Root ---');
            console.log(root);
            return;
        case Action.MERKLE_PROOF:
            console.log('--- Proof ' + index + ' ---');
            console.log(getProof(levels, index, hre));
            return;
        case Action.MERKLE_PROOFS:
            console.log('--- Proofs ---');
            for(let i = 0; i < leaves.length; i++){
                console.log('Proof : ' + i);
                console.log(getProof(levels, i, hre));
            }
            return;
        case Action.MERKLE_TREE:
            console.log('--- Merkle Tree ---');
            console.log(levels);
            return;
        default:
            console.error("Unknown action!")
    }
}

const hashLeaves = (values: string[][], types: string[], hre: HardhatRuntimeEnvironment) : string[] => {
    const coder = hre.ethers.AbiCoder.defaultAbiCoder();
    return values.map(entry => {
        const output = coder.encode(types, entry);
        return hre.ethers.keccak256(hre.ethers.keccak256(output));
    });
}

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

const getProof = (levels: string[][], index: number, hre: HardhatRuntimeEnvironment) : string[] => {
    if(levels.length === 1 || index > levels[0].length - 1) return [];

    let proof : string[] = [];
    let currentIdx = index;

    for(let i = 0; i < levels.length - 1; i++){
        let sibling = currentIdx % 2 == 0 ? currentIdx + 1 : currentIdx - 1;
        if(sibling >= levels[i].length){
            proof.push(hre.ethers.ZeroHash);
        } else {
            proof.push(levels[i][sibling]);
        }
        currentIdx = Math.floor(currentIdx/2);
    }
    return proof;
}

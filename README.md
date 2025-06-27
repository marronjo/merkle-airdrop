### 🌳 Merkle Airdrop 

🪂 Using Merkle Trees to check user inclusion in whitelist for a token airdrop 🪂

### Usage Instructions
tasks read from : `tasks/target/input.json`
to create a new tree, update this file

```bash
pnpm hardhat TASK ARGS
```

supported tasks:
- merkle-tree : prints entire tree
- merkle-root : prints root
- merkle-proof (index) : prints proof for given number
- merkle-proofs : prints proofs for all leaves in the tree

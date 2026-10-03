# SYS Token — Base

## Deployment target

- Network: Base (Base Mainnet / Base Sepolia for testing)
- Token standard: ERC-20
- Name: SysStream Token
- Symbol: SYS
- Initial supply: 1,000,000,000 SYS
- Decimals: 18
- Minting after deployment: disabled
- Initial holder: deployment wallet

The contract uses OpenZeppelin ERC20. OpenZeppelin documents 18 decimals as the default for ERC20 and supports fixed-supply designs by minting the initial amount in the constructor.

## Deployment tooling

Deployment is isolated under `contracts/` so the existing React/Airdrop application is not coupled to the token deployment toolchain.

From the repository root:

```powershell
cd contracts
npm install
Copy-Item .env.example .env
```

Fill `contracts/.env` locally with the Base RPC endpoint and deployment wallet private key. **Never send the private key in chat and never commit `.env`.**

### Compile only

```powershell
npm run compile
```

Expected checks:

- SysStream Token
- SYS
- 1,000,000,000 SYS
- 18 decimals

### Base Sepolia deployment

Fund the deployment wallet with Base Sepolia ETH first, then:

```powershell
npm run deploy:base-sepolia
```

The script validates chain ID `84532` before sending the transaction and prints the deployer address, transaction hash, contract address, token metadata, total supply, deployer SYS balance, and BaseScan address.

### Base Mainnet deployment

**Do not run this until Base Sepolia has been checked and the mainnet deployment has been explicitly approved.**

```powershell
npm run deploy:base
```

The script validates chain ID `8453` before sending the transaction.

## Important

Do **not** put a private key into GitHub or send it in chat.

Deploy from the wallet that should initially control the 1,000,000,000 SYS supply. After deployment, record the contract address and transaction hash.

Do not connect the SYS balance shown in the web app to this contract until the contract address has been deployed and verified.

## Deployment flow

1. Compile locally.
2. Deploy to Base Sepolia.
3. Confirm name, symbol, decimals, total supply, and deployer balance.
4. Confirm there is no public mint function.
5. Verify the contract source on BaseScan.
6. Test token transfer with a small testnet amount.
7. Only after the testnet checks pass, deploy the same source to Base Mainnet.
8. Save the mainnet contract address in the application's production configuration.
9. Then implement the Airdrop claim/withdraw flow so internal SYS credits can be exchanged for on-chain SYS from a controlled treasury/distribution wallet.

## Current application behavior

The existing Airdrop conversion credits the application's internal `users.sys_balance` ledger. It is intentionally **not** an on-chain token transfer yet.

That separation is important: deploying the token must not silently change existing user balances.

## Security

- Never commit `.env`, private keys, seed phrases, or wallet signing secrets.
- Use a dedicated deployment/treasury wallet where appropriate.
- Consider multisig custody for production treasury funds.
- A smart-contract deployment is not a security audit; test and review the contract before mainnet use.

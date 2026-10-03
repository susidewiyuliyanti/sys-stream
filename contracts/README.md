# SYS Token — Base

## Deployment target

- Network: Base (Base Mainnet / Base Sepolia for testing)
- Token standard: ERC-20 compatible / BEP-20
- Name: SysStream Token
- Symbol: SYS
- Initial supply: 1,000,000,000 SYS
- Decimals: 18
- Minting after deployment: disabled
- Initial holder: deployment wallet

The contract uses OpenZeppelin ERC20. OpenZeppelin's ERC20 implementation uses 18 decimals by default and supports fixed-supply tokens by minting the initial amount in the constructor.

## Important

Do **not** put a private key into GitHub or send it in chat.

Deploy from the wallet that should initially control the 1,000,000,000 SYS supply. After deployment, record the contract address and transaction hash.

Do not connect the SYS balance shown in the web app to this contract until the contract address has been deployed and verified.

## Deployment flow

1. Deploy to Base Sepolia first.
2. Confirm name, symbol, decimals, total supply, and deployer balance.
3. Confirm there is no public mint function.
4. Verify the contract source on the BaseScan.
5. Only after the testnet checks pass, deploy the same source to Base Mainnet.
6. Save the mainnet contract address in the application's production configuration.
7. Then implement the Airdrop claim/withdraw flow so internal SYS credits can be exchanged for on-chain SYS from a controlled treasury/distribution wallet.

## Current application behavior

The existing Airdrop conversion currently credits the application's internal users.sys_balance ledger. It is intentionally **not** an on-chain token transfer yet.

That separation is important: deploying the token must not silently change existing user balances.

## Security

- Never commit .env, private keys, seed phrases, or wallet signing secrets.
- Use a dedicated deployment/treasury wallet where appropriate.
- Consider multisig custody for production treasury funds.
- A smart-contract deployment is not a security audit; test and review the contract before mainnet use.

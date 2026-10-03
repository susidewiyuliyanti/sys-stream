import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import solc from "solc";
import { ethers } from "ethers";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const CONTRACT_FILE = path.join(ROOT, "SysStreamToken.sol");

function readContract() {
  return fs.readFileSync(CONTRACT_FILE, "utf8");
}

function findImports(importPath) {
  if (importPath.startsWith("@openzeppelin/contracts/")) {
    const filePath = path.join(ROOT, "node_modules", importPath);
    if (fs.existsSync(filePath)) {
      return { contents: fs.readFileSync(filePath, "utf8") };
    }
  }
  return { error: `Import not found: ${importPath}` };
}

function compile() {
  const input = {
    language: "Solidity",
    sources: {
      "SysStreamToken.sol": { content: readContract() }
    },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode.object", "evm.deployedBytecode.object", "metadata"]
        }
      }
    }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
  const errors = output.errors ?? [];
  const fatal = errors.filter((item) => item.severity === "error");

  for (const item of errors) {
    console.log(item.formattedMessage);
  }

  if (fatal.length) {
    throw new Error("Solidity compilation failed.");
  }

  const contract = output.contracts?.["SysStreamToken.sol"]?.SysStreamToken;
  if (!contract?.evm?.bytecode?.object) {
    throw new Error("Compiled SysStreamToken bytecode was not produced.");
  }

  return contract;
}

function getArg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const compileOnly = process.argv.includes("--compile-only");
const network = getArg("--network");
const artifact = compile();

if (compileOnly) {
  console.log("SYS contract compilation: OK");
  console.log("Name: SysStream Token");
  console.log("Symbol: SYS");
  console.log("Supply: 1,000,000,000 SYS");
  console.log("Decimals: 18");
  process.exit(0);
}

if (!network || !["base-sepolia", "base"].includes(network)) {
  throw new Error("Use --network base-sepolia or --network base.");
}

const rpcUrl = network === "base-sepolia"
  ? process.env.BASE_SEPOLIA_RPC_URL
  : process.env.BASE_MAINNET_RPC_URL;

const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

if (!rpcUrl) {
  throw new Error(`Missing RPC URL for ${network}. Set it in contracts/.env.`);
}

if (!privateKey) {
  throw new Error("Missing DEPLOYER_PRIVATE_KEY. Set it only in your local contracts/.env.");
}

const expectedChainId = network === "base-sepolia" ? 84532n : 8453n;
const provider = new ethers.JsonRpcProvider(rpcUrl);
const chain = await provider.getNetwork();

if (chain.chainId !== expectedChainId) {
  throw new Error(
    `Wrong network. Expected chain ID ${expectedChainId}, received ${chain.chainId}.`
  );
}

const wallet = new ethers.Wallet(privateKey, provider);
const deployer = await wallet.getAddress();
const balance = await provider.getBalance(deployer);

console.log(`Network: ${network}`);
console.log(`Chain ID: ${chain.chainId}`);
console.log(`Deployer: ${deployer}`);
console.log(`Native balance: ${ethers.formatEther(balance)} ETH`);

const factory = new ethers.ContractFactory(
  artifact.abi,
  artifact.evm.bytecode.object,
  wallet
);

console.log("Deploying SysStreamToken...");
const contract = await factory.deploy();
const tx = contract.deploymentTransaction();

if (!tx) {
  throw new Error("Deployment transaction was not created.");
}

console.log(`Transaction: ${tx.hash}`);
await contract.waitForDeployment();

const address = await contract.getAddress();
const [name, symbol, decimals, totalSupply, deployerBalance] = await Promise.all([
  contract.name(),
  contract.symbol(),
  contract.decimals(),
  contract.totalSupply(),
  contract.balanceOf(deployer)
]);

console.log("");
console.log("=== SYS DEPLOYMENT RESULT ===");
console.log(`Contract: ${address}`);
console.log(`Transaction: ${tx.hash}`);
console.log(`Name: ${name}`);
console.log(`Symbol: ${symbol}`);
console.log(`Decimals: ${decimals}`);
console.log(`Total supply: ${ethers.formatUnits(totalSupply, decimals)} SYS`);
console.log(`Deployer balance: ${ethers.formatUnits(deployerBalance, decimals)} SYS`);
console.log(
  `Explorer: ${network === "base-sepolia"
    ? "https://sepolia.basescan.org/address/" + address
    : "https://basescan.org/address/" + address}`
);
console.log("");
console.log("IMPORTANT: Do not integrate this address into production until source verification and deployment checks are complete.");

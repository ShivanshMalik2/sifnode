/**
 * Responsible for fetching deployment data and returning a valid ethers contract instance
 */
const fs = require("fs");
const { ethers, network } = require("hardhat");
const { print } = require("./utils");

// By default, this will work with a mainnet fork,
// but it can also be used to fork Ropsten
const DEPLOYMENT_DIRECTORY = "deployments";
const DEFAULT_DEPLOYMENT_NAME = "sifchain-1";

// The address of the Proxy admin (used to impersonate the account that has permission to upgrade proxies)
const PROXY_ADMIN_ADDRESS = "0x7c6c6ea036e56efad829af5070c8fb59dc163d88";

/**
 * Figures out the correct details for a given contract that has already been deployed in production
 * @param {string} deploymentName
 * @param {string} contractName
 * @param {number} chainId
 * @returns An object containing the factory, the instance, its address and the first user found in the accounts list
 */
async function getDeployedContract(deploymentName, contractName, chainId) {
  deploymentName = deploymentName ?? DEFAULT_DEPLOYMENT_NAME;
  contractName = contractName ?? "BridgeBank";
  chainId = chainId ?? 1;

  const filename = `${DEPLOYMENT_DIRECTORY}/${deploymentName}/${contractName}.json`;
  const artifactContents = fs.readFileSync(filename, { encoding: "utf-8" });
  const parsed = JSON.parse(artifactContents);
  const ethersInterface = new ethers.utils.Interface(parsed.abi);

  const address = parsed.networks[chainId].address;
  print(
    "yellow",
    `Connecting to ${contractName} at ${address} on chain ${chainId}`
  );

  const accounts = await ethers.getSigners();
  const activeUser = accounts[0];

  const contract = new ethers.Contract(address, ethersInterface, activeUser);
  const instance = await contract.attach(address);

  print(
    "green",
    `Connected to ${contractName} at ${address} on chain ${chainId}`
  );

  return {
    contract,
    instance,
    address,
    activeUser,
  };
}

/**
 * Use this function to impersonate accounts when forking
 * @param {string} address
 * @param {string} newBalance
 * @returns An ethers SIGNER object
 */
async function impersonateAccount(address, newBalance) {
  print("magenta", `Impersonating account ${address}`);

  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [address],
  });

  if (newBalance) {
    await setNewEthBalance(address, newBalance);
  }

  print("magenta", `Account ${address} successfully impersonated`);

  return ethers.getSigner(address);
}

/**
 * When impersonating an account, this function sets its balance
 * @param {string} address
 * @param {string | number} newBalance
 */
async function setNewEthBalance(address, newBalance) {
  const newValue = `0x${newBalance.toString(16)}`;
  await ethers.provider.send("hardhat_setBalance", [address, newValue]);

  print("magenta", `Balance of account ${address} set to ${newBalance}`);
}

/**
 * Throws an error if USE_FORKING is not set in .env
 */
function enforceForking() {
  const forkingActive = !!process.env.USE_FORKING;
  if (!forkingActive) {
    throw new Error("Forking is not active. Operation aborted.");
  }
}

/**
 * Returns an instance of the contract on the currently connected network
 * @dev Use this function to connect to a deployed contract
 * @dev THAT HAS THE SAME INTERFACE OF A CONTRACT IN THE CONTRACTS FOLDER
 * @dev It means that it won't work for outdated contracts (for that, please use the function getDeployedContract)
 * @param {string} contractName
 * @param {string} contractAddress
 * @returns An instance of the contract on the currently connected network
 */
async function getContractAt(contractName, contractAddress) {
  const factory = await ethers.getContractFactory(contractName);
  return await factory.attach(contractAddress);
}

module.exports = {
  PROXY_ADMIN_ADDRESS,
  getDeployedContract,
  impersonateAccount,
  setNewEthBalance,
  enforceForking,
  getContractAt,
};

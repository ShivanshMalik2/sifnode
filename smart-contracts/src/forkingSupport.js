/**
 * Responsible for fetching deployment data and returning a valid ethers contract instance
 */
const fs = require('fs');
const path = require('path');
const { ethers } = require('hardhat');

const DEPLOYMENT_DIRECTORY = 'deployments';
const DEFAULT_DEPLOYMENT_NAME = 'sifchain-1';

async function main() {
  return await getDeploymentDetails();
}

async function getDeploymentDetails(deploymentName, contractName, chainId) {
  deploymentName = deploymentName ?? DEFAULT_DEPLOYMENT_NAME;
  contractName = contractName ?? 'BridgeBank';
  chainId = chainId ?? 1;

  const filename = `${DEPLOYMENT_DIRECTORY}/${deploymentName}/build/contracts/${contractName}.json`;
  const artifactContents = fs.readFileSync(filename, { encoding: 'utf-8' });
  const parsed = JSON.parse(artifactContents);
  const ethersInterface = new ethers.utils.Interface(parsed.abi);

  const address = parsed.networks[chainId].address;
  console.log(`Address: ${address}`);

  //const contractFactory = new ethers.ContractFactory(ethersInterface, parsed.bytecode);
  const contract = new ethers.Contract(address, ethersInterface);
  // connect

  const instance = await contract.attach(address);
  const owner = await instance.owner();
  console.log(`owner: ${owner}`);
}

main()
  .catch((e) => {
    console.error({ e });
  })
  .finally(() => process.exit(0));

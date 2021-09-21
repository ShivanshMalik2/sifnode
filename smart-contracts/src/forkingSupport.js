/**
 * Responsible for fetching deployment data and returning a valid ethers contract instance
 */
const fs = require('fs');
const { ethers } = require('hardhat');

const print = require('../test/helpers/helpers').colorLog;

const DEPLOYMENT_DIRECTORY = 'deployments';
const DEFAULT_DEPLOYMENT_NAME = 'sifchain-1';

async function main() {
  return await getDeployedContract();
}

async function getDeployedContract(deploymentName, contractName, chainId) {
  deploymentName = deploymentName ?? DEFAULT_DEPLOYMENT_NAME;
  contractName = contractName ?? 'BridgeBank';
  chainId = chainId ?? 1;

  const filename = `${DEPLOYMENT_DIRECTORY}/${deploymentName}/${contractName}.json`;
  const artifactContents = fs.readFileSync(filename, { encoding: 'utf-8' });
  const parsed = JSON.parse(artifactContents);
  const ethersInterface = new ethers.utils.Interface(parsed.abi);

  const address = parsed.networks[chainId].address;
  console.log(`Address: ${address}`);

  const accounts = await ethers.getSigners();
  const activeUser = accounts[0];

  const contract = new ethers.Contract(address, ethersInterface, activeUser);
  const instance = await contract.attach(address);
  const owner = await instance.owner();
  const operator = await instance.operator();

  print('magenta', `Connected to ${contractName} at ${address} on chain ${chainId}`);
  //print('cyan', `-> Owner: ${owner}`);
  //print('cyan', `-> Operator: ${operator}`);

  return {
    contract,
    instance,
    address,
    activeUser,
  };
}

main()
  .catch((e) => {
    console.error({ e });
  })
  .finally(() => process.exit(0));

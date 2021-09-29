const hardhat = require('hardhat');
const fs = require('fs-extra');

const support = require('./helpers/forkingSupport');
const print = require('../test/helpers/helpers').colorLog;

// If there is no DEPLOYMENT_NAME env var, we'll use the mainnet deployment
const DEPLOYMENT_NAME = process.env.DEPLOYMENT_NAME || 'sifchain-1';

// If there is no FORKING_CHAIN_ID env var, we'll use the mainnet id
const CHAIN_ID = process.env.FORKING_CHAIN_ID || 1;

async function main() {
  print('highlight', `~~~ Running script upgradeContracts.js ~~~`);

  // Makes sure we're forking
  support.enforceForking();

  // Fetches the manifest
  copyManifest();

  // Creates an instance of BridgeBank from the deployed code
  const { instance: bridgeBank } = await support.getDeployedContract(
    DEPLOYMENT_NAME,
    'BridgeBank',
    CHAIN_ID
  );

  // Fetches and logs the operator
  const operator_bb = await bridgeBank.operator();
  print('cyan', `-> Operator: ${operator_bb}`);

  /*
  // creates an instance of CosmosBridge from the deployed code
  const { instance: cosmosBridge } = await support.getDeployedContract(
    'sifchain-1',
    'CosmosBridge',
    1
  );
  const operator_cb = await cosmosBridge.operator();
  print('cyan', `-> Operator: ${operator_cb}`);
  */

  // Impersonates the admin account
  const admin = await support.impersonateAccount(
    support.PROXY_ADMIN_ADDRESS,
    1000000000
  );

  // Upgrades BridgeBank
  const newBridgeBankFactory = await hardhat.ethers.getContractFactory('BridgeBank');
  await hardhat.upgrades.upgradeProxy(bridgeBank, newBridgeBankFactory.connect(admin));

  // Upgrades CosmosBridge
  //const newCosmosBridgeFactory = await hardhat.ethers.getContractFactory('CosmosBridge');
  //await hardhat.upgrades.upgradeProxy(cosmosBridge, newCosmosBridgeFactory.connect(admin));

  // Cleans up temporary files
  cleanup();

  print('greenHighlight', '~~~ DONE! ~~~');
}

// Copies the manifest to the right place (where Hardhat wants it)
function copyManifest() {
  print('cyan', `Fetching the correct manifest`);

  fs.copySync(`./deployments/sifchain-1/.openzeppelin/mainnet.json`, `./.openzeppelin/mainnet.json`);
}

// Deletes temporary files (the copied manifest)
function cleanup() {
  print('cyan', `Cleaning up temporary files`);

  fs.unlinkSync(`./.openzeppelin/mainnet.json`);
}

main()
  .catch((e) => {
    cleanup();
    print('red', `${e}`);
  })
  .finally(() => process.exit(0));

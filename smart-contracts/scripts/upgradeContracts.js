const hardhat = require('hardhat');

const support = require('./helpers/forkingSupport');
const print = require('../test/helpers/helpers').colorLog;

async function main() {
  print('highlight', `~~~ Running script upgradeContracts.js ~~~`);

  // Makes sure we're forking
  support.enforceForking();

  // Creates an instance of BridgeBank from the deployed code
  const { instance: bridgeBank } = await support.getDeployedContract('sifchain-1', 'BridgeBank', 1);
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

  // Finds out which account is the proxy admin
  //TODO: figure out how to use the correct account here
  //const admin = await support.impersonateAccount(operator_bb, 1000000000);
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

  print('greenHighlight', '~~~ DONE! ~~~');
}

main()
  .catch((e) => {
    print('red', `${e}`);
    console.error({ e });
  })
  .finally(() => process.exit(0));

const hardhat = require('hardhat');

const support = require('./helpers/forkingSupport');
const print = require('../test/helpers/helpers').colorLog;

async function main() {
  print('highlight', `~~~ Running script upgradeContracts.js ~~~`);

  const { instance: bridgeBank } = await support.getDeployedContract('sifchain-1', 'BridgeBank', 1);
  const operator_bb = await bridgeBank.operator();
  print('cyan', `-> Operator: ${operator_bb}`);

  const { instance: cosmosBridge } = await support.getDeployedContract(
    'sifchain-1',
    'CosmosBridge',
    1
  );
  const operator_cb = await cosmosBridge.operator();
  print('cyan', `-> Operator: ${operator_cb}`);

  //TODO: figure out how to use the correct account here
  //const admin = await support.impersonateAccount(operator_bb, 1000000000);
  const admin = await support.impersonateAccount(
    '0xD60500F92b59B4D02664442E023408Bad3725133',
    1000000000
  );

  const newBridgeBankFactory = await hardhat.ethers.getContractFactory('BridgeBank');
  const newCosmosBridgeFactory = await hardhat.ethers.getContractFactory('CosmosBridge');

  await hardhat.upgrades.upgradeProxy(bridgeBank, newBridgeBankFactory.connect(admin), {
    unsafeAllowCustomTypes: true,
  });

  await hardhat.upgrades.upgradeProxy(cosmosBridge, newCosmosBridgeFactory.connect(admin), {
    unsafeAllowCustomTypes: true,
  });

  print('greenHighlight', '~~~ DONE! ~~~');
}

main()
  .catch((e) => {
    print('red', `ERROR: ${e}`);
    console.error({ e });
  })
  .finally(() => process.exit(0));

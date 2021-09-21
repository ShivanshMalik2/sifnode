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

  const operatorImpersonated = await support.impersonateAccount(operator_bb, 1000000000);
}

main()
  .catch((e) => {
    print('red', `ERROR: ${e}`);
    console.error({ e });
  })
  .finally(() => process.exit(0));

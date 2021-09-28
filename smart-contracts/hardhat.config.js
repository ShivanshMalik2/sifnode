require('hardhat/config');
require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-ethers');
require('@nomiclabs/hardhat-etherscan');
require('@openzeppelin/hardhat-upgrades');
require('dotenv').config();

const print = require('./test/helpers/helpers').colorLog;

const networkUrl = process.env['NETWORK_URL'];
const activePrivateKey = process.env[process.env.ACTIVE_PRIVATE_KEY];

if(networkUrl == '') {
  throw new Error('INVALID_NETWORK_URL')
}
if(activePrivateKey == '') {
  throw new Error('INVALID_PRIVATE_KEY')
}

// Works only for 'hardhat' network:
const useForking = !!process.env.USE_FORKING;

// Initial Log
const logColor = useForking ? 'yellowHighlight' : 'blueHighlight';
print(logColor, `HARDHAT | Use Forking: ${useForking}`);

module.exports = {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false,
      chainId: 1,
      forking: {
        enabled: useForking,
        url: networkUrl,
        blockNumber: 13316453,
      },
    },
    ropsten: {
      url: networkUrl,
      accounts: [activePrivateKey],
      gas: 2000000,
    },
    mainnet: {
      url: networkUrl,
      accounts: [activePrivateKey],
      gas: 2000000,
      gasPrice: 'auto',
      gasMultiplier: 1.2,
    },
    localRpc: {
      allowUnlimitedContractSize: false,
      chainId: 31337,
      url: 'http://127.0.0.1:8545/',
    },
  },
  solidity: {
    compilers: [
      {
        version: '0.8.0',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: '0.5.16',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  typechain: {
    outDir: 'build',
    target: 'ethers-v5',
  },
  mocha: {
    timeout: 200000,
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env['ETHERSCAN_API_KEY'],
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  mocha: {
    timeout: 20000,
  },
};

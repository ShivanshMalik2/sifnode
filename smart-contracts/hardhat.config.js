require('hardhat/config');
require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-ethers');
require('@nomiclabs/hardhat-etherscan');
require('@openzeppelin/hardhat-upgrades');
require('dotenv').config();

const print = require('./test/helpers/helpers').colorLog;

const mainnetUrl = process.env['MAINNET_URL'] ?? 'https://example.com';
const ropstenUrl = process.env['ROPSTEN_URL'] ?? 'https://example.com';
const ropstenPrivateKey = process.env['ROPSTEN_PRIVATE_KEY'] ?? '0xabcd';
const mainnetPrivateKey = process.env['MAINNET_PRIVATE_KEY'] ?? '0xabcd';

const activePrivateKey = process.env[process.env.ACTIVE_PRIVATE_KEY] ?? '0xabcde';

// Works only for 'hardhat' network:
const useForking = !!process.env.USE_FORKING;

// Initial Log
const logColor = useForking ? 'yellowHighlight' : 'blueHighlight';
print(logColor, `HARDHAT | Use Forking: ${useForking}`);

module.exports = {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false,
      forking: {
        enabled: useForking,
        url: mainnetUrl,
        blockNumber: 13270000,
      },
    },
    ropsten: {
      url: ropstenUrl,
      accounts: [activePrivateKey],
      gas: 2000000,
    },
    mainnet: {
      url: mainnetUrl,
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

require("dotenv").config();
const { ethers } = require("hardhat");

const { print } = require("./helpers/utils");
const parser = require("./helpers/ofacParser");

// Defaults to the Ropsten address
const BLOCKLIST_ADDRESS =
  process.env.BLOCKLIST_ADDRESS || "0xbB4fa6cC28f18Ae005998a5336dbA3bC49e3dc57";

const state = {
  ofac: [],
  evm: [],
  toAdd: [],
  toRemove: [],
  blocklistInstance: null,
};

async function main() {
  print("highlight", "-- SYNC OFAC BLOCKLIST --");

  state.ofac = await parser.getList();
  print("cyan", `OFAC LIST: ${state.ofac}`);
  print("cyan", `----`);

  state.evm = await fetchEvmBlocklist();
  print("cyan", `EVM LIST : ${state.evm}`);
  print("cyan", `----`);

  calculateDiff();

  await addToBlocklist();
  print("cyan", `----`);
  await removeFromBlocklist();
  print("cyan", `----`);

  print("green", "Our EVM blocklist is synced with OFAC's blocklist");
  print("highlight", "~~~ DONE ~~~");
}

async function fetchEvmBlocklist() {
  print("yellow", "Fetching EVM blocklist...");

  const blocklistFactory = await ethers.getContractFactory("Blocklist");
  state.blocklistInstance = await blocklistFactory.attach(BLOCKLIST_ADDRESS);
  const fullList = await state.blocklistInstance.getFullList();

  return fullList;
}

function calculateDiff() {
  print("yellow", "Calculating Diff...");

  // addresses that must be added don't exist on evm, but exist on ofac
  state.toAdd = state.ofac.filter((address) => !state.evm.includes(address));
  print("cyan", `Will add: ${state.toAdd}`);

  // addresses that must be removed exist on evm, but don't exist on ofac
  state.toRemove = state.evm.filter((address) => !state.ofac.includes(address));
  print("cyan", `Will remove: ${state.toRemove}`);
  print("cyan", "----");
}

async function addToBlocklist() {
  if (state.toAdd.length === 0) {
    print("yellow", "The are no new addresses to add to the blocklist");
    return;
  }

  print("yellow", "Adding addresses to the blocklist. Please wait...");

  let tx;
  if (state.toAdd.length === 1) {
    tx = await state.blocklistInstance
      .addToBlocklist(state.toAdd[0])
      .catch((e) => {
        throw e;
      });
  } else {
    // there are many addresses to add
    tx = await state.blocklistInstance
      .batchAddToBlocklist(state.toAdd)
      .catch((e) => {
        throw e;
      });
  }

  print("cyan", `Added ${state.toAdd} to the blocklist.`);
  print("green", `TX Hash: ${tx.hash}`);
}

async function removeFromBlocklist() {
  if (state.toRemove.length === 0) {
    print("yellow", "The are no addresses to remove from the blocklist");
    return;
  }

  print("yellow", "Removing addresses from the blocklist. Please wait...");

  const owner = await ethers.getSigner(
    "0xfc854524613dA7244417908d199857754189633c"
  );

  let tx;
  if (state.toRemove.length === 1) {
    tx = await state.blocklistInstance
      .connect(owner)
      .removeFromBlocklist(state.toRemove[0])
      .catch((e) => {
        throw e;
      });
  } else {
    // there are many addresses to add
    tx = await state.blocklistInstance
      .connect(owner)
      .batchRemoveFromBlocklist(state.toRemove)
      .catch((e) => {
        throw e;
      });
  }

  print("cyan", `Removed ${state.toRemove} from the blocklist.`);
  print("green", `TX Hash: ${tx.hash}`);
}

main()
  .catch((error) => {
    console.error({ error });
  })
  .finally(() => process.exit(0));

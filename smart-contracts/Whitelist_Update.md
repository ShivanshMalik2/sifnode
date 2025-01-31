# Update whitelisted tokens on mainnet

If you are trying to whitelist many token addresses at once, you will need to use the `yarn whitelist:run` command.

1) Before running the script, make sure there is a file called address_list_source.json in the smart-contracts/data directory.  
It contains the token addresses that will be whitelisted. It should have at least one address in an array, like so:
```
[
 "0x217ddead61a42369a266f1fb754eb5d3ebadc88a",
 "0x9e32b13ce7f2e80a01932b42553652e053d6ed8e"
]
```

2) Now, edit your .env file adding the following variables:
```
MAINNET_URL=https://eth-mainnet.alchemyapi.io/v2/ZGe5q0xD06oCAHiwf6ZAexnzGKSPrS5P
MAINNET_PRIVATE_KEY_OPERATOR=e67825808c9642d98d16b5794da4582432cb159610ff3934e8a0bac074e725f2
ACTIVE_PRIVATE_KEY=MAINNET_PRIVATE_KEY_OPERATOR
BRIDGEBANK_ADDRESS=0xB5F54ac4466f5ce7E0d8A5cB9FE7b8c0F35B7Ba8
DEPLOYMENT_NAME=sifchain-1
ADDRESS_LIST_SOURCE="data/address_list_source.json"
```
_Please note that the values of MAINNET_URL and MAINNET_PRIVATE_KEY_OPERATOR have been redacted and won't work on the mainnet. You should change them to your actual mainnet Alchemy URL and the BridgeBank OPERATOR's private key. You may use the other values exactly as they are above._

Important:
- Make sure MAINNET_PRIVATE_KEY_OPERATOR in your .env file is the private key matching the OPERATOR address.

- Ensure MAINNET_URL is set correctly.  

To bulk update the whitelist and add tokens, use `yarn whitelist:run` like so:

```
yarn whitelist:run
```

## Next steps
Please notify the person who asked you to run this command that the process has been finished.  
If you see any errors on your console/terminal, please report it to that same person.

## Devnotes
For more details that might concern developers only, consult the document Whitelist_Devnotes.md.  
You do not need to know those details to run this command.  
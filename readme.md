# DApps tutorial JS
This tutorial shows how to develop DApps only using evan.network frameworks and pure JS and CSS. For detailed information and instructions have a look here: 
[evannetwork.github.io](https://evannetwork.github.io/dapps/js/hello-world)

## Install
```bash
npm install
lerna bootstrap --hoist
```

## Basic Development
- build and watch all included dapps
```bash
npm run dapps-serve
```

- starts an local server at http://localhost:3000
```bash
npm run serve
```

## Deploy to contract
- start ipfs deamon connected to evan.network ipfs before deploying
```bash
./scripts/go-ipfs.sh
```
- create a new contract and reference your dapp
```bash
npm run deploy-to-contract hello-world
```

## Deploy to ENS

Have a look at the [deployment description](https://evannetwork.github.io/dev/deployment).

require("@nomicfoundation/hardhat-toolbox")
require("@nomiclabs/hardhat-ethers")
require("hardhat-deploy")
require("dotenv").config()
/** @type import('hardhat/config').HardhatUserConfig */

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL
const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL
const KOVAN_RPC_URL = process.env.KOVAN_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COINMARKET_API_KEY = process.env.COINMARKET_API_KEY

module.exports = {
    defaultNetwork: "hardhat",
    solidity: {
        compilers: [
            {
                version: "0.8.7",
            },
            {
                version: "0.8.9",
            },
        ],
    },
    networks: {
        hardhat: {
            chainId: 31337,
        },
        kovan: {
            url: KOVAN_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 42,
            blockConfirmations: 6,
        },
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 5,
            blockConfirmations: 6,
        },
        rinkeby: {
            url: RINKEBY_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 4,
            blockConfirmations: 6,
        },
        localhost: {
            url: "http://127.0.0.1:8545",
            chainId: 31337,
        },
    },
    etherscan: {
        apiKey: {
            rinkeby: ETHERSCAN_API_KEY,
            goerli: ETHERSCAN_API_KEY,
            kovan: ETHERSCAN_API_KEY,
        },
        customChains: [
            {
                network: "rinkeby",
                chainId: 4,
                urls: {
                    apiURL: "https://api-rinkeby.etherscan.io/api",
                    browserURL: "https://rinkeby.etherscan.io",
                },
            },
            {
                network: "goerli",
                chainId: 5,
                urls: {
                    apiURL: "https://api-goerli.etherscan.io/api",
                    browserURL: "https://goerli.etherscan.io",
                },
            },
            {
                network: "kovan",
                chainId: 42,
                urls: {
                    apiURL: "https://api-kovan.etherscan.io/api",
                    browserURL: "https://kovan.etherscan.io",
                },
            },
        ],
    },
    gasReporter: {
        enabled: false,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKET_API_KEY,
        token: "ETH",
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        player: {
            default: 0,
        },
    },
}

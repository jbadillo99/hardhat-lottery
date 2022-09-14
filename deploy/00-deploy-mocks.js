const { network, ethers } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")

const BASE_FEE = ethers.utils.parseEther("0.25")
const GAS_PRICE_LINK = 1e9 // Calculated value: link/gas

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if (developmentChains.includes(network.name)) {
        console.log("Deplying Mocks from local network")
        const args = [BASE_FEE, GAS_PRICE_LINK]
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            args: [BASE_FEE, GAS_PRICE_LINK],
            log: true,
        })
        console.log("Mocks deployed--")
        console.log(
            "Run npx hardhat console --network localhost to interact with deployes smartcontracts"
        )
    }
}

module.exports.tags = ["all", "mocks"]

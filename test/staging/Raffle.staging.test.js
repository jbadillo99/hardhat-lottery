const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const {
    isCallTrace,
} = require("hardhat/internal/hardhat-network/stack-traces/message-trace")
const {
    developmentChains,
    networkConfig,
} = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Staging Tests", () => {
          let raffle,
              vrfCoordinatorV2Mock,
              raffleEntranceFee,
              deployer,
              interval
          const chainId = network.config.chainId
          beforeEach(async () => {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              raffle = await ethers.getContract("Raffle", deployer)
              raffleEntranceFee = await raffle.getEntranceFee()
          })

          describe("fulfillRandomWords", () => {
              it("works with liv Chainlik keepers and Chainlink VRF, we get a random winner", async () => {
                  const startingTimestamp = await raffle.getLastTimestamp()
                  await new Promise(async (resolve, reject) => {
                      raffle.once("WinnerPicked", async () => {
                          console.log("Winner Picked Event Fired")
                          try {
                              //   setTimeout(async () => {
                              const recentWinner =
                                  await raffle.getRecentWinner()
                              const raffleState = await raffle.getRaffleState()
                              const winnerEndingBalance =
                                  await accounts[0].getBalance()
                              const endingTimestamp = raffle.getLastTimestamp()
                              await expect(raffle.getPlayer(0)).to.be.reverted
                              assert.equal(
                                  recentWinner.toString(),
                                  accounts[0].address
                              )
                              assert.equal(raffleState, 0)
                              assert.equal(
                                  winnerEndingBalance.toString(),
                                  winnerStartingBalance
                                      .add(raffleEntranceFee)
                                      .toString()
                              )
                              assert.equal(
                                  endingTimestamp > startingTimestamp,
                                  true
                              )
                              resolve()
                              //   }, 15000)
                          } catch (error) {
                              console.log(`Error: ${error}`)
                              reject(error)
                          }
                      })
                      console.log("Enterring Raffle")

                      const tx = await raffle.enterRaffle({
                          value: raffleEntranceFee,
                      })
                      await tx.wait()
                      const winnerStartingBalance =
                          await accounts[0].getBalance()
                  })
              })
          })
      })

const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const {
    developmentChains,
    networkConfig,
} = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")
const {
    isCallTrace,
} = require("hardhat/internal/hardhat-network/stack-traces/message-trace")
const { assertHardhatInvariant } = require("hardhat/internal/core/errors")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Tests", async function () {
          let raffle,
              vrfCoordinatorV2Mock,
              raffleEntranceFee,
              deployer,
              interval
          const chainId = network.config.chainId
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture("all")
              raffle = await ethers.getContract("Raffle", deployer)
              vrfCoordinatorV2Mock = await ethers.getContract(
                  "VRFCoordinatorV2Mock",
                  deployer
              )
              raffleEntranceFee = await raffle.getEntranceFee()
              interval = await raffle.getInterval()
          })

          describe("constructor", function () {
              it("Initializes the raffle correctlys", async function () {
                  const raffleState = await raffle.getRaffleState()
                  // Raffle state should start att 0: OPEN
                  assert.equal(raffleState.toString(), "0")
                  assert.equal(
                      interval.toString(),
                      networkConfig[chainId]["interval"]
                  )
              })
          })

          describe("enterRaffle", function () {
              it("Reverts when you dont pay enough", async function () {
                  await expect(
                      raffle.enterRaffle()
                  ).to.be.revertedWithCustomError(
                      raffle,
                      "Raffle__NotEnoughEntranceFee"
                  )
              })

              it("Records players when they enter", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  const playerFromContract = await raffle.getPlayer(0)
                  assert.equal(deployer, playerFromContract)
              })

              it("Emits event on enter", async function () {
                  await expect(
                      raffle.enterRaffle({ value: raffleEntranceFee })
                  ).to.emit(raffle, "RaffleEnter")
              })

              it("Does not allow when raffle is calculating", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [
                      interval.toNumber() + 1,
                  ])
                  await network.provider.send("evm_mine", [])

                  // Pretend to be a chainlink keeper
                  await raffle.performUpkeep([])
                  await expect(
                      raffle.enterRaffle({ value: raffleEntranceFee })
                  ).to.be.revertedWithCustomError(raffle, "Raffle__NotOpen")
              })
          })

          describe("checkUpkeep", function () {
              it("returns false if people haven't sent any ETH", async () => {
                  await network.provider.send("evm_increaseTime", [
                      interval.toNumber() + 1,
                  ])
                  await network.provider.request({
                      method: "evm_mine",
                      params: [],
                  })
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep(
                      "0x"
                  ) // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                  assert(!upkeepNeeded)
              })
              it("returns false if raffle isn't open", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [
                      interval.toNumber() + 1,
                  ])
                  await network.provider.request({
                      method: "evm_mine",
                      params: [],
                  })
                  await raffle.performUpkeep([]) // changes the state to calculating
                  const raffleState = await raffle.getRaffleState() // stores the new state
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep(
                      "0x"
                  ) // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                  assert.equal(
                      raffleState.toString() == "1",
                      upkeepNeeded == false
                  )
              })

              it("returns false if enough time hasn't passed", async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [
                      interval.toNumber() - 5,
                  ]) // use a higher number here if this test fails
                  await network.provider.request({
                      method: "evm_mine",
                      params: [],
                  })
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep(
                      "0x"
                  ) // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                  assert(!upkeepNeeded)
              })
              it("returns true if enough time has passed, has players, eth, and is open", async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [
                      interval.toNumber() + 1,
                  ])
                  await network.provider.request({
                      method: "evm_mine",
                      params: [],
                  })
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep(
                      "0x"
                  ) // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                  assert(upkeepNeeded)
              })
          })
      })

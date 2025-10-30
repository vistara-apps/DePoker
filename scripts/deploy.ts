import hre from "hardhat";

async function main() {
  const tokenAddress = process.env.TOKEN_ADDRESS;
  const facilitatorAddress = process.env.FACILITATOR_ADDRESS;

  if (!tokenAddress) {
    throw new Error("TOKEN_ADDRESS environment variable required");
  }

  if (!facilitatorAddress) {
    throw new Error("FACILITATOR_ADDRESS environment variable required");
  }

  console.log(`Deploying TableEscrow...`);
  console.log(`Token: ${tokenAddress}`);
  console.log(`Facilitator: ${facilitatorAddress}`);

  const TableEscrow = await hre.ethers.getContractFactory("TableEscrow");
  const escrow = await TableEscrow.deploy(tokenAddress, facilitatorAddress);

  await escrow.waitForDeployment();

  const address = await escrow.getAddress();
  console.log(`\n? TableEscrow deployed to: ${address}`);
  console.log(`\nSet ESCROW_ADDRESS=${address} in your .env file`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

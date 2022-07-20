const main = async () => {
    const [owner, randomPerson] = await hre.ethers.getSigners();
    /*This will actually compile our contract and generate the necessary files we
    need to work with our contract under the artifacts directory.*/
    const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");

    /* What's happening here is Hardhat will create a local Ethereum network for us,
    but just for this contract. Then, after the script completes it'll destroy that local network.
    So, every time you run the contract, it'll be a fresh blockchain. What's the point?
    It's kinda like refreshing your local server every time so you always start from a clean slate which makes it easy to debug errors.*/
    const waveContract = await waveContractFactory.deploy({
      value: hre.ethers.utils.parseEther('0.1'),
    });

    /*We'll wait until our contract is officially deployed to our local blockchain! Our constructor runs when we actually deploy. */
    await waveContract.deployed();

    console.log("Contract deployed to:", waveContract.address);
    console.log("Contract deployed by:", owner.address);

    let contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
    console.log("Contract Balance: ", hre.ethers.utils.formatEther(contractBalance));
  
    let waveTxn;

    // 1st wave
    waveTxn = await waveContract.connect(randomPerson).wave(`This is my msg`);
    waveContract.on("WonPrize", (message) => {
      console.log("got the event!");
    });
    await waveTxn.wait();
    contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
    console.log("Contract Balance: ", hre.ethers.utils.formatEther(contractBalance));
    // 2nd wave
    waveTxn = await waveContract.connect(randomPerson).wave(`This is my msg`);
    waveContract.on("WonPrize", (message) => {
      console.log("got the event!");
    });
    await waveTxn.wait();
    contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
    console.log("Contract Balance: ", hre.ethers.utils.formatEther(contractBalance));
    // 3rd wave
    waveTxn = await waveContract.connect(randomPerson).wave(`This is my msg`);
    waveContract.on("WonPrize", (message) => {
      console.log("got the event!");
    });
    await waveTxn.wait();
    contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
    console.log("Contract Balance: ", hre.ethers.utils.formatEther(contractBalance));
  };
  
  const runMain = async () => {
    try {
      await main();
      process.exit(0); // exit Node process without error
    } catch (error) {
      console.log(error);
      process.exit(1); // exit Node process while indicating 'Uncaught Fatal Exception' error
    }
  };
  
  runMain();
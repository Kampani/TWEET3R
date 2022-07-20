import React, { useEffect, useState } from "react";
import "./App.css";
import { contractAddress, contractABI } from "./constants/constants";
import {ethers} from 'ethers';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
        getAllWaves();
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async() => {
    try {
      const {ethereum} = window;

      if(ethereum) {
        const accounts = await ethereum.request({method: "eth_requestAccounts"});
        setCurrentAccount(accounts[0]);
        console.log("Connected Account: ",accounts[0]);
      } else {
        alert("get metamask!");
      }

    } catch(error) {
      console.log(error);
    }
  }

  const wave = async() => {
    try {
      const {ethereum} = window;
      if(ethereum) {
        if(currentAccount !== ""){
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();

          const { chainId } = await provider.getNetwork();
          if(chainId !== 5 ) {
            alert("Change network to Goerli!");
            throw new Error ("Change Network to Goerli!");
          }

          const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
  
          let totalWaveCount = await wavePortalContract.getTotalWaves();
          console.log("Retrieved total tweet count...", totalWaveCount.toNumber());
  
          const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000 });
          console.log("Mining...", waveTxn.hash);
          alert("Txn being mined, click ok and wait")
          
          wavePortalContract.on("WonPrize", (message) => {
            alert(`${message} Check the internal txns for your address now!`);
          });

          await waveTxn.wait();
          console.log("Mined -- ", waveTxn.hash);
  
          totalWaveCount = await wavePortalContract.getTotalWaves();
          console.log("Retrieved total tweet count...", totalWaveCount.toNumber());

          const address = await signer.getAddress();
          let wavesByCaller = await wavePortalContract.wavesBy(address);
          console.log("Total tweets by " + address + " are " + wavesByCaller);

          getAllWaves();

        } else {
          alert("Connect Wallet first!");
        }
      } else {
        alert("Get Metamask!");
      }
    } catch(error) {
      console.log(error);
      alert("Error encountered, check console for details");
    }
  }

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await wavePortalContract.getAllWaves();
        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleChange = (event) => {
    setMessage(event.target.value);
  }

  const handleSubmit = async(event) => {
    event.preventDefault();
    setLoading(true);
    await wave();
    setLoading(false);
    setMessage("");
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          👋 Hey there!
        </div>

        <div className="bio">
          I am Manav and I work on Web3 so that's pretty cool right?
        </div>
        <div className="bio">
          <p>
            Connect your Ethereum wallet and send me a tweet!<br/>
            Your tweet will appear at the bottom of the list.
          </p>
          <p>
            Open up the console (ctrl + shift + I) for the live updates happening on the blockchain.
            There's a cooldown period of 2 minutes from a unique wallet address so users cannot spam the network.<br/>
            <br/>You can even win some Eth if you are lucky enough! &#128521;
          </p> 
        </div>

        <div>
        <input type="text" name="tweet" id="tweet" value={message} onChange={handleChange}/>
        </div>

        <button className="waveButton" disabled={loading || !message ? true : false} onClick={handleSubmit}>
          Send a Tweet!
        </button>

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {
          allWaves.map((wave, key) => {
            return (
              <div key = {key} style={ {backgroundColor: "OldLace", marginTop: "16px", padding: "8px"} }>
                <div>Message: {wave.message}</div>
                <div>Address: {wave.address}</div>
                <div>Timestamp: {wave.timestamp.toString()}</div>
              </div>
            )
          })
        }
      </div>
    </div>
    );
  }
export default App
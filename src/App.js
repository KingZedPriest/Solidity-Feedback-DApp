import { ethers } from "ethers";
import abi from "./utils/FeedBack.json";
import React, { useEffect, useState } from "react";

import "./App.css";

const App = () => {
  const contractABI = abi.abi;
  const [allFeedbacks, setAllFeedbacks] = useState([]);
  const [message, setMessage] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");
  const contractAddress = "0x394573C83c7E4272C16Bd1A19fD270959e5c6c90";

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      /*
       * First make sure we have access to the Ethereum object.
       */
      if (!ethereum) {
        console.error("Make sure you have Metamask!");
        return;
      } else {
        console.log("We have the Ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Wallet Implementation

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };
  const newFeedback = async (message) => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const feedbackContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        let count = await feedbackContract.getTotalFeedback();
        console.log("This is the total feedback count....", count.toNumber());
        const feedbackTxn = await feedbackContract.newFeedback(message, {
          gasLimit: 3000000,
        });
        console.log("Mining...", feedbackTxn.hash);
        await feedbackTxn.wait();
        console.log("Mined -- ", feedbackTxn.hash);
        count = await feedbackContract.getTotalFeedback();
        console.log("This is the total feedback count....", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getAllFeedback = async () => {
    const { ethereum } = window;
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const feedbackContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        //Call the getAllFeedback method from your Smart Contract

        const feedbackArray = await feedbackContract.getAllFeedback();

        // We only need address, timestamp, and message in our UI so let's collect them.

        const feedbacksCleaned = feedbackArray.map((feedback) => {
          return {
            address: feedback.waver,
            timestamp: new Date(feedback.timestamp * 1000),
            message: feedback.message,
          };
        });

        //Store our data in React State

        setAllFeedbacks(feedbacksCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getAllFeedback();
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    let feedbackContract;
    const onNewFeedback = (from, timestamp, message) => {
      console.log("NewFeedback", from, timestamp, message);
      setAllFeedbacks((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const feedbackContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      feedbackContract.on("NewFeedback", onNewFeedback);
    }
    return () => {
      if (feedbackContract) {
        feedbackContract.off("NewFeedback", onNewFeedback);
      }
    };
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">FeedBack DApp</div>

        <div className="intro">
          Hello, I am <span> Charles Chukwuemeka </span> (A.K.A Priest). So,
          this is a smart contract for writing your feedback in a way that
          doesn't concern anyone.{" "}
          <p>
            {" "}
            Connect your <span>Ethereum wallet</span> and send me that
            feedback!!!.
          </p>
          <span>P.S </span>You will need to send a Feedback, in order to see
          other peoples' Feedback, after connecting your WALLET by the way.
        </div>
        <input
          className="feedbackInput"
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Give Me That Feedback!"
        />

        <button className="btn" onClick={() => newFeedback(message)}>
          Enter Feedback
        </button>

        {/* If there is no currentAccount this button gets rendered. */}

        {!currentAccount && (
          <button className="btn" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allFeedbacks.map((feedback, index) => {
          return (
            <div key={index} className="feedbackdiv">
              <div className="address">Address: {feedback.address}</div>
              <div className="time">Time: {feedback.timestamp.toString()}</div>
              <div className="message">Message: {feedback.message}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default App;

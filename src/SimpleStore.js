import React, { useState } from 'react';

import SimpleStore_abi from './SimpleStore_abi.json';
const { ethers } = require('ethers');

const SimpleStorage = () => {
  // deploy simple storage contract and paste deployed contract address here. This value is local ganache chain
  let contractAddress = '0xCF31E7c9E7854D7Ecd3F3151a9979BC2a82B4fe3';

  const [errorMessage, setErrorMessage] = useState(null);
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [connButtonText, setConnButtonText] = useState('Connect Wallet');

  const [currentContractVal, setCurrentContractVal] = useState(null);

  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const connectWalletHandler = () => {
    if (window.ethereum && window.ethereum.isMetaMask) {
      window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then((result) => {
          accountChangedHandler(result[0]);
          setConnButtonText('Wallet Connected');

          // Initialize the contract here
          updateEthers();
        })
        .catch((error) => {
          setErrorMessage(error.message);
        });
    } else {
      console.log('Need to install MetaMask');
      setErrorMessage('Please install MetaMask browser extension to interact');
    }
  };

  // update account, will cause component re-render
  const accountChangedHandler = (newAccount) => {
    setDefaultAccount(newAccount);
    updateEthers();
  };

  const chainChangedHandler = () => {
    // reload the page to avoid any errors with chain change mid use of application
    window.location.reload();
  };

  // listen for account changes
  window.ethereum.on('accountsChanged', accountChangedHandler);

  window.ethereum.on('chainChanged', chainChangedHandler);

  const updateEthers = async () => {
    if (!window.ethereum) {
      console.error('No Ethereum provider available.');
      return;
    }

    try {
      const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(tempProvider);

      const tempSigner = tempProvider.getSigner();
      setSigner(tempSigner);

      const tempContract = new ethers.Contract(
        contractAddress,
        SimpleStore_abi,
        tempSigner
      );
      setContract(tempContract);

      console.log('Contract initialized successfully.');
    } catch (error) {
      console.error('Error initializing contract:', error);
    }
  };

  const getCurrentVal = async () => {
    if (contract) {
      try {
        let val = await contract.get();
        setCurrentContractVal(val);
      } catch (error) {
        console.error('Error getting current value:', error);
      }
    } else {
      console.log('Contract is not initialized.');
    }
  };

  const setHandler = async (event) => {
    event.preventDefault();
    if (contract) {
      try {
        console.log(
          'Sending ' + event.target.setText.value + ' to the contract'
        );
        await contract.set(event.target.setText.value);
        console.log('Transaction successful.');
      } catch (error) {
        console.error('Error sending transaction:', error);
      }
    } else {
      console.log('Contract is not initialized.');
    }
  };

  return (
    <div>
      <h4> {'Get/Set Contract interaction'} </h4>
      <button onClick={connectWalletHandler}>{connButtonText}</button>
      <div>
        <h3>Address: {defaultAccount}</h3>
      </div>
      <form onSubmit={setHandler}>
        <input id='setText' type='text' />
        <button type={'submit'}> Update Contract </button>
      </form>
      <div>
        <button onClick={getCurrentVal} style={{ marginTop: '5em' }}>
          {' '}
          Get Current Contract Value{' '}
        </button>
      </div>
      {currentContractVal}
      {errorMessage}
    </div>
  );
};

export default SimpleStorage;

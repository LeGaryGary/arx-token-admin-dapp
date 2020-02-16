import Web3 from "web3";

function metaMaskInit() {

  window.ethInitSuccess = false;
  if (window.ethereum) {
    // Modern dapp browsers...
    window.web3 = new Web3(window.ethereum);
    try {
      // Request account access if needed
      window.ethereum.enable();

    } catch (error) {
      console.log("Init Metamask fail");
    }
  } else {
    console.log("Metamask is not detected");
  }

}

export { metaMaskInit }

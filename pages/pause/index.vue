<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-card outlined :elevation="0">
        <v-card-title class="headline">Pause / Resume System</v-card-title>
        <v-card-text>
          <div class="ma-2" v-if="isSystemPaused">
            <v-alert :value="true" type="warning">SMART CONTRACT IS CURRENTLY PAUSED</v-alert>
          </div>

          <div class="ma-2" v-if="!isSystemPaused">
            <v-alert :value="true" type="success">SMART CONTRACT IS CURRENTLY RUNNING</v-alert>
          </div>

          <v-btn v-on:click="pauseSystem" color="red" class="white--text">
            PAUSE SYSTEM
            <v-icon right dark>pause_circle_filled</v-icon>
          </v-btn>
          <v-btn v-on:click="resumeSystem" color="green" class="white--text">
            RESUME SYSTEM
            <v-icon right dark>play_circle_filled</v-icon>
          </v-btn>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import { ABI } from "../../contracts/constants";
import { metaMaskInit } from "../../utils/metamaskInit.js";

export default {
  data() {
    return {
      networkVersion: "",
      networkName: "",
      selectedAddress: "",
      ethBalance: 0,
      sync: "",
      instance: undefined,
      isSystemPaused: false
    };
  },
  watch: {
    networkVersion: function(val) {
      if (val == "1") {
        this.networkName = "Mainnet";
        return;
      }
      if (val == "50") {
        this.networkName = "GANACHE";
        return;
      }
      this.networkName = "! YOU ARE NOT CONNECTED TO THE CORRECT NETWORK";
      this.$toast.error("Please connect to Mainenet blockchain (id: 1)");
    },
    ethBalance: function(val) {
      if (val == 0) {
        this.$toast.error(
          "You don't have any ETH! You need some in order to write on the blockchain"
        );
      }
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    async init() {
      metaMaskInit();
      await this.getDetails();
      this.loadContract();
    },
    async getDetails() {
      this.networkVersion = window.web3.currentProvider.networkVersion;
      this.selectedAddress = window.web3.currentProvider.selectedAddress;
      this.ethBalance = await window.web3.eth.getBalance(this.selectedAddress);
      this.sync = await window.web3.eth.isSyncing();
    },
    loadContract() {
      console.log("loading the contract...");
      this.instance = new window.web3.eth.Contract(
        ABI,
        localStorage.getItem("contract_address"),
        {
          defaultAccount: this.selectedAddress, // default from address
          defaultGasPrice: "20000000000" // default gas price in wei, 20 gwei in this case
        }
      );

      // check if the address is a pauser
      this.instance.methods
        .pauser()
        .call({ from: this.selectedAddress }, (error, result) => {
          console.log("error :", error);
          if (error) {
            console.log(
              "error calling the pauser() method. this should never happen"
            );
            return;
          }
          if (result.toLowerCase() != this.selectedAddress.toLowerCase()) {
            this.$toast.error("The Pauser address is: " + result);
          } else {
            this.$toast.success("You have WRITE access");
          }
        });

      this.checkSystemStatus();
    },
    checkSystemStatus() {
      // get the current status of the system
      this.instance.methods
        .paused()
        .call({ from: this.selectedAddress }, (error, result) => {
          console.log("error :", error);
          if (error) {
            console.log(
              "error calling the paused() method. this should never happen"
            );
            return;
          }
          this.isSystemPaused = result;
        });
    },
    pauseSystem() {
      console.log("PAUSING THE SYSTEM");

      this.instance.methods
        .pause()
        .send({ from: this.selectedAddress })
        .on("transactionHash", hash => {
          console.log("transactionHash :", hash);
        })
        .on("receipt", receipt => {
          console.log("receipt", receipt);
        })
        .on("confirmation", (confirmationNumber, receipt) => {
          console.log("confirmationNumber", confirmationNumber);
          console.log("receipt", receipt);

          this.checkSystemStatus();
        })
        .on("error", err => {
          this.$toast.error(err);
        });
    },
    resumeSystem() {
      console.log("RESUME THE SYSTEM");

      this.instance.methods
        .unpause()
        .send({ from: this.selectedAddress })
        .on("transactionHash", hash => {
          console.log("transactionHash :", hash);
        })
        .on("receipt", receipt => {
          console.log("receipt", receipt);
        })
        .on("confirmation", (confirmationNumber, receipt) => {
          console.log("confirmationNumber", confirmationNumber);
          console.log("receipt", receipt);

          this.checkSystemStatus();
        })
        .on("error", err => {
          this.$toast.error(err);
        });
    }
  }
};
</script>

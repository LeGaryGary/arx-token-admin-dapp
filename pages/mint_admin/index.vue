<template>
  <v-layout justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-card class="mt-5 pa-3" outlined :elevation="0">
        <v-card-title class="headline">Check is Minter</v-card-title>
        <v-form class="pa-5" ref="form">
          <v-text-field v-model="checkIsMinterAddress" label="Check is Minter" required></v-text-field>

          <v-btn color="success" @click="checkIsMinter">CHECK</v-btn>
        </v-form>
      </v-card>

      <v-card class="mt-5 pa-3" outlined :elevation="0">
        <v-card-title class="headline">Add Minter</v-card-title>
        <v-card-text>Remember to add 6 zeroes after the allowance!</v-card-text>
        <v-form class="pa-5" ref="form">
          <v-text-field v-model="minterAddress" label="Minter Address" required></v-text-field>

          <v-text-field v-model="allowance" label="allowance" required></v-text-field>

          <v-btn color="success" @click="addNewMinter">ADD NEW MINTER</v-btn>
        </v-form>
      </v-card>

      <v-card class="mt-5 pa-3" outlined :elevation="0">
        <v-card-title class="headline">Remove Minter</v-card-title>

        <v-form class="pa-5" ref="form">
          <v-text-field v-model="removeMinterAddress" label="Minter Address" required></v-text-field>

          <v-btn color="success" @click="removeMinter">REMOVE MINTER</v-btn>
        </v-form>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import { ABI, contractAddr } from "../../contracts/constants";
import { metaMaskInit } from "../../utils/metamaskInit.js";

export default {
  data() {
    return {
      removeMinterAddress: "",
      checkIsMinterAddress: "",
      minterAddress: "",
      allowance: "",
      networkVersion: "",
      networkName: "",
      selectedAddress: "",
      ethBalance: 0,
      instance: undefined
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
      this.networkName = "! YOU ARE NOT CONNECTED TO MAINNET!";
      this.$toast.error("Please connect to MAINNET (id: 1)");
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
      this.instance = new window.web3.eth.Contract(ABI, contractAddr, {
        defaultAccount: this.selectedAddress, // default from address
        defaultGasPrice: "20000000000" // default gas price in wei, 20 gwei in this case
      });

      // check if the address is masterminter
      this.instance.methods
        .masterMinter()
        .call({ from: this.selectedAddress }, (error, result) => {
          console.log("error :", error);
          if (error) {
            console.log(
              "error calling the masterMinter() method. this should never happen"
            );
            return;
          }
          if (result.toLowerCase() != this.selectedAddress.toLowerCase()) {
            this.$toast.error("The MasterMinter Address is: " + result);
          } else {
            this.$toast.success("You have WRITE access");
          }
        });
    },
    addNewMinter() {
      this.instance.methods
        .configureMinter(this.minterAddress, this.allowance)
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

          this.$toast.success("You've added successfully a new minter");
        })
        .on("error", err => {
          this.$toast.error(err);
        });
    },
    removeMinter() {
      this.instance.methods
        .removeMinter(this.removeMinterAddress)
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

          this.$toast.success("You've added successfully removed this minter");
        })
        .on("error", err => {
          this.$toast.error(err);
        });
    },
    checkIsMinter() {
      this.instance.methods
        .isMinter(this.checkIsMinterAddress)
        .call({ from: this.selectedAddress }, (error, result) => {
          console.log("error :", error);
          if (error) {
            console.log(
              "error calling the isMinter() method. this should never happen"
            );
            return;
          }
          if (result) {
            this.$toast.success("The Account is a Minter");
          } else {
            this.$toast.error("It is not a minter");
          }
        });
    }
  }
};
</script>

<template>
  <v-layout justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-card class="mt-5 pa-3" outlined :elevation="0">
        <v-card-title class="headline">Check is Address Blacklisted</v-card-title>

        <v-form class="pa-5" ref="form">
          <v-text-field v-model="address_to_check" label="Address" required></v-text-field>

          <v-btn color="success" @click="checkIsBlacklisted">CHECK IS BLACKLISTED</v-btn>
        </v-form>
      </v-card>

      <v-card class="mt-5 pa-3" outlined :elevation="0">
        <v-card-title class="headline">Blacklist</v-card-title>

        <v-form class="pa-5" ref="form">
          <v-text-field v-model="address_to_blacklist" label="Address" required></v-text-field>

          <v-btn color="success" @click="addBlacklist">ADD TO BLACKLIST</v-btn>
        </v-form>
      </v-card>

      <v-card class="mt-5 pa-3" outlined :elevation="0">
        <v-card-title class="headline">Remove From Blacklist</v-card-title>

        <v-form class="pa-5" ref="form">
          <v-text-field v-model="address_to_remove_blacklist" label="Address" required></v-text-field>

          <v-btn color="success" @click="removeBlacklist">REMOVE FROM BLACKLIST</v-btn>
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
      address_to_check: "",
      address_to_blacklist: "",
      address_to_remove_blacklist: "",
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
        .blacklister()
        .call({ from: this.selectedAddress }, (error, result) => {
          console.log("error :", error);
          if (error) {
            console.log(
              "error calling the masterMinter() method. this should never happen"
            );
            return;
          }
          if (result.toLowerCase() != this.selectedAddress.toLowerCase()) {
            this.$toast.error("The Blacklister Address is: " + result);
          } else {
            this.$toast.success("You have WRITE access");
          }
        });
    },
    addBlacklist() {
      this.instance.methods
        .blacklist(this.address_to_blacklist)
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

          this.$toast.success("You've blacklisted successfully this address");
        })
        .on("error", err => {
          this.$toast.error(err);
        });
    },
    removeBlacklist() {
      this.instance.methods
        .unBlacklist(this.address_to_remove_blacklist)
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

          this.$toast.success(
            "You've added successfully removed the blacklist"
          );
        })
        .on("error", err => {
          this.$toast.error(err);
        });
    },
    checkIsBlacklisted() {
      this.instance.methods
        .isBlacklisted(this.address_to_check)
        .call({ from: this.selectedAddress }, (error, result) => {
          console.log("error :", error);
          if (error) {
            console.log(
              "error calling the isMinter() method. this should never happen"
            );
            return;
          }
          if (result) {
            this.$toast.info("The Account is Blacklisted!");
          } else {
            this.$toast.info("The Account is NOT Blacklisted!");
          }
        });
    }
  }
};
</script>

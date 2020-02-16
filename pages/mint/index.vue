<template>
  <v-layout justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-card class="mt-5 pa-3" outlined :elevation="0">
        <v-card-title class="headline">Your Allowance</v-card-title>
        <v-layout column justify-center align-center>
          <p class="allowance" v-if="allowance">
            <span class="allowance_amount">{{ allowance }}</span>ARX
          </p>
        </v-layout>
      </v-card>

      <v-card class="mt-5 pa-3" outlined :elevation="0">
        <v-card-title class="headline">Mint</v-card-title>
        <v-card-text>Remember to add 6 zeroes after the amount</v-card-text>
        <v-form class="pa-5" ref="form">
          <v-text-field v-model="to_address" label="To Address" required></v-text-field>

          <v-text-field v-model="amount" label="Amount" required></v-text-field>

          <v-btn color="success" @click="mint">MINT</v-btn>
        </v-form>
      </v-card>

      <v-card class="mt-5 pa-3" outlined :elevation="0">
        <v-card-title class="headline">Check ARX Balance</v-card-title>

        <v-form class="pa-5" ref="form">
          <v-text-field v-model="balance_address" label="Address" required></v-text-field>
          <v-btn color="success" @click="checkBalance">CHECK BALANCE</v-btn>
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
      balance_address: "",
      allowance: 0,
      to_address: "",
      amount: 0,
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
      this.networkName = "! YOU ARE NOT CONNECTED TO MAINNET";
      this.$toast.error("Please connect to Mainnet (id: 1)");
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
        .isMinter(this.selectedAddress)
        .call({ from: this.selectedAddress }, (error, result) => {
          console.log("error :", error);
          if (error) {
            console.log(
              "error calling the masterMinter() method. this should never happen"
            );
            return;
          }
          if (!result) {
            this.$toast.error("You are not in the minter's list");
          } else {
            this.$toast.success("You have WRITE access");
            this.checkAllowance();
          }
        });
    },
    mint() {
      this.instance.methods
        .mint(this.to_address, this.amount)
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

          this.$toast.success("You've successfully minted ARX");
          this.checkAllowance();
        })
        .on("error", err => {
          this.$toast.error(err);
        });
    },
    checkAllowance() {
      this.instance.methods
        .minterAllowance(this.selectedAddress)
        .call({ from: this.selectedAddress }, (error, result) => {
          console.log("error :", error);
          if (error) {
            console.log(
              "error calling the isMinter() method. this should never happen"
            );
            return;
          }
          this.allowance = result;
        });
    },
    checkBalance() {
      this.instance.methods
        .balanceOf(this.balance_address)
        .call({ from: this.selectedAddress }, (error, result) => {
          console.log("error :", error);
          if (error) {
            console.log(
              "error calling the balanceOf() method. this should never happen"
            );
            return;
          }
          this.$toast.success(result + " ARX");
        });
    }
  }
};
</script>

<style scoped>
.allowance {
  font-size: 1.2em;
  padding: 15px;
}
.allowance_amount {
  margin-right: 10px;
  color: #333;
  font-weight: bold;
  font-size: 1.1em;
  background: lightgreen;
  padding: 5px;
}
</style>

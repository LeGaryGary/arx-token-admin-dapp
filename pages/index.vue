<template>
  <v-layout justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-card outlined :elevation="0">
        <v-card-title class="headline">ARX Admin Panel v1</v-card-title>
        <v-card-text>
          <p>Metamask with the correct accounts is needed in order to operate it.</p>
          <p v-if="networkName">Connected to: {{ networkName }}</p>
          <p v-if="selectedAddress">Your address from Metamask: {{ selectedAddress }}</p>
          <p v-if="selectedAddress">Contract address: {{ new_contract_address }}</p>
          <p
            v-if="ethBalance"
          >Your ETH Balance: {{ (ethBalance * Math.pow(10,-18)).toFixed(5) }} ETH</p>
          <p
            class="caption warning--text"
            v-if="ethBalance && ethBalance == 0"
          >you can't interact with the smart contract if your balance is 0</p>
          <p v-if="totalSupply">
            ARX Total Supply:
            <span
              class="total_supply"
            >{{ (totalSupply * Math.pow(10,-6)).toFixed(6) }}</span>
          </p>
          <div v-if="sync" class="text-xs-right">
            <em>
              <small>&mdash; ATTENTION CURRENT NODE IS SYNCING</small>
            </em>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <a color="primary" target="_blank" href="https://metamask.io/">Download Metamask</a>
        </v-card-actions>
      </v-card>

      <v-card class="mt-5 pa-3" outlined :elevation="0">
        <v-card-title class="headline">Change Contract Address</v-card-title>

        <v-card-text>
          You can doublecheck with the address from
          <a
            target="_blank"
            href="https://github.com/ARCA-Arweave/arx-token"
          >OFFICIAL GITHUB REPO</a>
        </v-card-text>

        <v-form class="pa-5" ref="form">
          <v-text-field v-model="new_contract_address" label="ARX Contract Address" required></v-text-field>

          <v-btn color="success" @click="changeContractAddress">Change Contract Address</v-btn>
        </v-form>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import { metaMaskInit } from "../utils/metamaskInit.js";
import { contractAddr, ABI } from "../contracts/constants.js";

export default {
  data() {
    return {
      totalSupply: 0,
      new_contract_address: "",
      networkVersion: "",
      networkName: "",
      selectedAddress: "",
      ethBalance: 0,
      sync: "",
      instance: undefined
    };
  },
  watch: {
    networkVersion: function(val) {
      console.log("val :", val);
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
    }
  },
  mounted() {
    this.init();
    this.new_contract_address =
      localStorage.getItem("contract_address") || contractAddr;
  },
  methods: {
    async init() {
      metaMaskInit();
      await this.getDetails();
      this.loadContract();
    },
    loadContract() {
      console.log("loading the contract...");
      this.instance = new window.web3.eth.Contract(
        ABI,
        this.new_contract_address,
        {
          defaultAccount: this.selectedAddress, // default from address
          defaultGasPrice: "20000000000" // default gas price in wei, 20 gwei in this case
        }
      );

      this.getTotalSupply();
    },
    async getDetails() {
      console.log("....");
      this.networkVersion = window.web3.currentProvider.networkVersion;
      this.selectedAddress = window.web3.currentProvider.selectedAddress;
      this.ethBalance = await window.web3.eth.getBalance(this.selectedAddress);
      this.sync = await window.web3.eth.isSyncing();
    },
    getTotalSupply() {
      this.instance.methods
        .totalSupply()
        .call({ from: this.selectedAddress }, (error, result) => {
          console.log("error :", error);
          if (error) {
            console.log(
              "error calling the paused() method. this should never happen"
            );
            return;
          }
          this.totalSupply = result;
        });
    },
    changeContractAddress() {
      localStorage.setItem("contract_address", this.new_contract_address);
      this.$toast.info("Contract Address Set");
      this.init();
    }
  }
};
</script>

<style scoped>
.total_supply {
  margin-right: 10px;
  color: #333;
  font-weight: bold;
  font-size: 1.1em;
  background: lightgreen;
  padding: 5px;
}
</style>

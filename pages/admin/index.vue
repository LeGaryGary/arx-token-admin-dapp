<template>
  <v-layout justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-card class="mt-5 pa-3" outlined :elevation="0">
        <v-card-title class="headline">Update Master Minter</v-card-title>

        <v-form class="pa-5" ref="form">
          <v-text-field v-model="new_master_minter_address" label="New Master Minter" required></v-text-field>
          <v-btn color="success" @click="updateMasterMinter">UPDATE MASTER MINTER</v-btn>
        </v-form>
      </v-card>

      <v-card class="mt-5 pa-3" outlined :elevation="0">
        <v-card-title class="headline">Update Blacklister</v-card-title>

        <v-form class="pa-5" ref="form">
          <v-text-field v-model="new_blacklister_address" label="New Blacklister" required></v-text-field>
          <v-btn color="success" @click="updateBlacklister">UPDATE BLACKLISTER</v-btn>
        </v-form>
      </v-card>

      <v-card class="mt-5 pa-3" outlined :elevation="0">
        <v-card-title class="headline">Update Pauser</v-card-title>

        <v-form class="pa-5" ref="form">
          <v-text-field v-model="new_pauser_address" label="New PAUSER" required></v-text-field>
          <v-btn color="success" @click="updatePauser">UPDATE PAUSER</v-btn>
        </v-form>
      </v-card>

      <v-card class="mt-5 pa-3" outlined :elevation="0">
        <v-card-title class="headline">Transfer Ownership</v-card-title>

        <v-form class="pa-5" ref="form">
          <v-text-field v-model="new_owner" label="New OWNER" required></v-text-field>
          <v-btn color="red" @click="transferOwnership">!!! TRANSFER OWNERSHIP !!!</v-btn>
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
      new_pauser_address: "",
      new_blacklister_address: "",
      new_master_minter_address: "",
      new_owner: "",
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
        .owner()
        .call({ from: this.selectedAddress }, (error, result) => {
          console.log("test:owner()", { error, result });
          // if (error) {
          //   console.log(
          //     "error calling the masterMinter() method. this should never happen"
          //   );
          //   return;
          // }
          // if (result.toLowerCase() != this.selectedAddress.toLowerCase()) {
          //   this.$toast.error("The Owner Address is: " + result);
          // } else {
          //   this.$toast.success("You have WRITE access");
          // }
        });
    },
    updateMasterMinter() {
      this.instance.methods
        .updateMasterMinter(this.new_master_minter_address)
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
            "You've added successfully change the master minter"
          );
        })
        .on("error", err => {
          this.$toast.error(err);
        });
    },
    transferOwnership() {
      this.instance.methods
        .transferOwnership(this.new_owner)
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

          this.$toast.success("You've successfully transfered the ownership");
        })
        .on("error", err => {
          this.$toast.error(err);
        });
    },
    updateBlacklister() {
      this.instance.methods
        .updateBlacklister(this.new_blacklister_address)
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

          this.$toast.success("You've successfully changed the blacklister");
        })
        .on("error", err => {
          this.$toast.error(err);
        });
    },
    updatePauser() {
      this.instance.methods
        .updatePauser(this.new_pauser_address)
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

          this.$toast.success("You've successfully changed the pauser");
        })
        .on("error", err => {
          this.$toast.error(err);
        });
    }
  }
};
</script>

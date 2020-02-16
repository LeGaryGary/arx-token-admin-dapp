<template>
  <v-layout>
    <v-flex text-xs-center>
      <img src="/v.png" alt="Vuetify.js" class="mb-5">
      <blockquote class="blockquote">&#8220;Users.&#8221;</blockquote>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  created() {
    this.fetchSomething();
  },
  methods: {
    async fetchSomething() {
      this.$toast.success("Loading your IP...");
      //this.$toast.success('Successfully authenticated')
      const ip = await this.$axios.$get("http://icanhazip.com");
      console.log("My ip is: " + ip);
    }
  }
};
</script>

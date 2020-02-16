<template>
  <v-app dark>
    <v-layout>
      <v-flex text-xs-center>
        <div class="error_page">
          <h1 v-if="error.statusCode === 404">{{ pageNotFound }}</h1>
          <h1 v-else>{{ otherError }}</h1>
          <v-spacer/>
          <v-btn flat to="/" nuxt>go to home page</v-btn>
        </div>
      </v-flex>
    </v-layout>
  </v-app>
</template>

<script>
export default {
  layout: "empty",
  props: {
    error: {
      type: Object,
      default: null
    }
  },
  head() {
    const title =
      this.error.statusCode === 404 ? this.pageNotFound : this.otherError;
    return {
      title
    };
  },
  data() {
    return {
      pageNotFound: "404 Not Found",
      otherError: "An error occurred"
    };
  }
};
</script>

<style scoped>
h1 {
  font-size: 20px;
}
.error-page {
  margin: 0 auto;
  max-width: 800px;
}
</style>

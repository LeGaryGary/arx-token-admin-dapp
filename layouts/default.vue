<template>
  <v-app dark style="background: #12171a;">
    <v-navigation-drawer
      v-model="drawer"
      mobile-break-point="800"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      dark
      app
    >
      <v-list>
        <v-list-tile v-for="(item, i) in items" :key="i" :to="item.to" router exact>
          <v-list-tile-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title" />
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar :clipped-left="clipped" fixed app flat dark>
      <v-toolbar-title v-text="title" />
      <v-spacer />
    </v-toolbar>
    <v-content>
      <v-container>
        <nuxt />
      </v-container>
    </v-content>
    <v-footer :fixed="fixed" app>
      <span style="position: absolute; right: 16px; ">&nbsp;ARCA DAO &copy; 2020</span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      clipped: false,
      drawer: true,
      fixed: false,
      items: [
        {
          icon: "apps",
          title: "Dashboard",
          to: "/"
        },
        {
          icon: "security",
          title: "Admin",
          to: "/admin"
        },
        {
          icon: "account_balance",
          title: "Minting Admin",
          to: "/mint_admin"
        },
        {
          icon: "monetization_on",
          title: "Minting",
          to: "/mint"
        },
        {
          icon: "block",
          title: "Blacklist",
          to: "/blacklist"
        },
        {
          icon: "ac_unit",
          title: "Pause / Resume",
          to: "/pause"
        }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: "ARX Dashboard"
    };
  }
};
</script>

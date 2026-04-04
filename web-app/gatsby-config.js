require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})

function throwError() {
  throw new Error()
}

const GATSBY_SITE_URL = process.env.GATSBY_SITE_URL || throwError();

module.exports = {
  siteMetadata: {
    title: `8Land`,
    siteUrl: GATSBY_SITE_URL
  },
  // More easily incorporate content into your pages through automatic TypeScript type generation and better GraphQL IntelliSense.
  // If you use VSCode you can also use the GraphQL plugin
  // Learn more at: https://gatsby.dev/graphql-typegen
  graphqlTypegen: true,
  plugins: ["gatsby-plugin-sass"],
  flags: {
    DEV_SSR: true
  },
};


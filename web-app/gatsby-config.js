const path = require('path');

function throwError() {
  throw new Error()
}

const HOST_URL = process.env.HOST_URL || throwError();
const SENTRY_DSN = process.env.SENTRY_DSN;
const GOOGLE_ANALYTICS_TRACKING_ID = process.env.GOOGLE_ANALYTICS_TRACKING_ID

module.exports = {
  siteMetadata: {
    siteUrl: HOST_URL,
    title: "8Land",
  },
  plugins: [
    {
      resolve: `gatsby-plugin-sass`,
    },
    /*
      Enable these two plugins below when SEO becomes a requirement
    */
    `gatsby-plugin-sitemap`,
    'gatsby-plugin-robots-txt',
    //
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-image`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,

    /*
      WARNING:
      do not point a gatsby-source-filesystem instance to the root of the project,
      as it will listen for file changes in Gatsby internal directories like .cache
      and will start looping.
    */
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `src`,
        path: path.join(process.cwd(), 'src'),
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: PROJECT_NAME,
        start_url: `/`,
        background_color: `#262626`,
        theme_color: `#262626`,
        display: `browser`,
        icon: 'src/logo.png',
      },
    },
    //
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // Must be placed after gatsby-plugin-manifest
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
    // {
    //   resolve: 'gatsby-plugin-webpack-bundle-analyser-v2',
    //   options: {
    //     openAnalyzer: !EnvironmentVariables.CI,
    //     analyzerMode: 'static',
    //     defaultSizes: 'gzip',
    //     reportFilename: path.join(
    //       process.cwd(),
    //       '.webpack-bundle-analyzer',
    //       'report.html',
    //     ),
    //   },
    // },
    {
      resolve: `gatsby-plugin-netlify`,
      options: {
        mergeSecurityHeaders: false,
      },
    },
    ...(SENTRY_DSN
      ? [
          {
            resolve: '@sentry/gatsby',
            options: {
              dsn: SENTRY_DSN,
            },
          },
        ]
      : []),
    ...(GOOGLE_ANALYTICS_TRACKING_ID
      ? [
          {
            resolve: `gatsby-plugin-google-analytics`,
            options: {
              trackingId: GOOGLE_ANALYTICS_TRACKING_ID,
              anonymize: true,
              respectDNT: true,
            },
          },
        ]
      : []),
  ],
};

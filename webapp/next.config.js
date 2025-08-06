/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: ['raw.githubusercontent.com', 'arweave.net', 'ipfs.io'],
    },
    env: {
      DEMO_MODE: process.env.HELIUS_API_KEY ? 'false' : 'true'
    }
  }
  
  module.exports = nextConfig
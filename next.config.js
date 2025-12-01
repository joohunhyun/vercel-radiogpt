/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "openai",
      "langchain",
      "@langchain/openai",
      "pdf-parse",
      "beautiful-soup-js",
    ],
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    "openai",
    "langchain",
    "@langchain/openai",
    "pdf-parse",
    "beautiful-soup-js",
  ],
};

module.exports = nextConfig;

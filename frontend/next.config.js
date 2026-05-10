/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  output: process.env.DOCKER_BUILD === '1' ? 'standalone' : undefined,
  turbopack: {
    root: '.',
  },
};

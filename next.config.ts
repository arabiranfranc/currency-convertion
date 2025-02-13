/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // Ensures static export
  images: {
    unoptimized: true, // Fixes image issues with static exports
  },
};

module.exports = nextConfig;

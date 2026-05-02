/** @type {import('next').NextConfig} */
const nextConfig = {
  // FIX 16: ignoreBuildErrors was true — this silently hides TypeScript errors
  // and prevents catching broken API calls, missing fields, and type mismatches
  // before deployment. Set to false so build fails fast on real errors.
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  // Allow API Gateway and CloudFront domains for Image Optimization
  // (add your actual domains here when deploying)
  // images: {
  //   domains: ['d1a4o1u09j3suo.cloudfront.net'],
  // },
};

export default nextConfig;

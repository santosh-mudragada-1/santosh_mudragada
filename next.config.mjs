import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    // Lets every *.module.scss do `@use 'variables' as *;` without deep relative paths.
    includePaths: [path.join(dir, 'styles')],
  },
};

export default nextConfig;

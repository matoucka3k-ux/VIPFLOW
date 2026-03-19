/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: 'api.qrserver.com' },
    ],
  },
  async rewrites() {
    return [
      // /{username} → /tipster-profile/{username}
      {
        source: '/:username((?!api|auth|dashboard|admin|explore|_next|favicon)\\w+)',
        destination: '/tipster-profile/:username',
      },
      // /{username}/join/{code} → /tipster-profile/{username}/join/{code}
      {
        source: '/:username((?!api|auth|dashboard|admin|explore|_next|favicon)\\w+)/join/:code',
        destination: '/tipster-profile/:username/join/:code',
      },
    ];
  },
};

module.exports = nextConfig;

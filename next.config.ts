import type { NextConfig } from 'next';

const ensureHttps = (value: string) => (value.startsWith('http') ? value : `https://${value}`);

const PROFILE_PICTURE_S3_TARGET =
  process.env.PROFILE_PICTURE_S3_TARGET || process.env.PROFILE_PICTURE_CLOUD_UPLOAD_URL;
const PROFILE_PICTURE_S3_REGION =
  process.env.PROFILE_PICTURE_S3_REGION ||
  process.env.AWS_REGION ||
  process.env.AWS_DEFAULT_REGION ||
  'us-east-1';
const PROFILE_PICTURE_PUBLIC_BASE_URL = process.env.PROFILE_PICTURE_PUBLIC_BASE_URL;

const remotePatterns: NonNullable<NextConfig['images']>['remotePatterns'] = [];

const addHostPattern = (hostname?: string) => {
  if (!hostname) return;
  if (remotePatterns.some((pattern) => pattern.hostname === hostname)) {
    return;
  }
  remotePatterns.push({ protocol: 'https', hostname, pathname: '/**' });
};

if (PROFILE_PICTURE_PUBLIC_BASE_URL) {
  try {
    const url = new URL(ensureHttps(PROFILE_PICTURE_PUBLIC_BASE_URL.trim()));
    addHostPattern(url.hostname);
  } catch (error) {
    console.warn('Invalid PROFILE_PICTURE_PUBLIC_BASE_URL; skipping image host allow-list.', error);
  }
}

const parseBucketName = (target?: string) => {
  if (!target) return undefined;
  const withoutScheme = target.replace(/^s3:\/\//, '');
  const [bucket] = withoutScheme.split('/');
  return bucket || undefined;
};

const bucket = parseBucketName(PROFILE_PICTURE_S3_TARGET);
if (bucket) {
  if (!PROFILE_PICTURE_S3_REGION || PROFILE_PICTURE_S3_REGION === 'us-east-1') {
    addHostPattern(`${bucket}.s3.amazonaws.com`);
  }
  addHostPattern(`${bucket}.s3.${PROFILE_PICTURE_S3_REGION}.amazonaws.com`);
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;

import { NextResponse } from 'next/server';
import path from 'path';
import crypto from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { S3Client, PutObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3';

const NODE_ENV = process.env.NODE_ENV || 'development';
const PROJECT_ROOT = process.cwd();
const LOCAL_UPLOAD_DIRECTORY = path.join(PROJECT_ROOT, 'public', 'static');
const PROFILE_PICTURE_PUBLIC_BASE_URL = process.env.PROFILE_PICTURE_PUBLIC_BASE_URL;
const PROFILE_PICTURE_S3_REGION =
  process.env.PROFILE_PICTURE_S3_REGION ||
  process.env.AWS_REGION ||
  process.env.AWS_DEFAULT_REGION ||
  'us-east-1';
const PROFILE_PICTURE_S3_TARGET =
  process.env.PROFILE_PICTURE_S3_TARGET ||
  process.env.PROFILE_PICTURE_CLOUD_UPLOAD_URL;
const S3_CANNED_ACLS = new Set([
  'private',
  'public-read',
  'public-read-write',
  'authenticated-read',
  'aws-exec-read',
  'bucket-owner-read',
  'bucket-owner-full-control',
  'log-delivery-write',
]);

const normalizeS3Acl = (value?: string): ObjectCannedACL | undefined => {
  if (!value) {
    return undefined;
  }

  const isValidAcl = S3_CANNED_ACLS.has(value);
  if (!isValidAcl) {
    console.warn(`Ignored unsupported PROFILE_PICTURE_S3_ACL value: ${value}`);
    return undefined;
  }

  return value as ObjectCannedACL;
};

const PROFILE_PICTURE_S3_ACL = normalizeS3Acl(process.env.PROFILE_PICTURE_S3_ACL);
const s3Client = PROFILE_PICTURE_S3_TARGET
  ? new S3Client({
      region: PROFILE_PICTURE_S3_REGION,
      credentials:
        process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
          ? {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            }
          : undefined,
    })
  : null;

const MAX_FILE_SIZE_BYTES = 250 * 1024; // 250 KB
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png']);
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);

type UploadResult = {
  storedPath: string;
  publicUrl?: string;
  strategy: 'local' | 'cloud';
};

const trimSlashes = (value: string) => value.replace(/^\/+/, '').replace(/\/+$/, '');

const parseS3Target = (target: string) => {
  const normalized = target?.trim();
  if (!normalized) {
    throw new Error('PROFILE_PICTURE_S3_TARGET is not configured.');
  }
  const withoutScheme = normalized.replace(/^s3:\/\//, '');
  const [bucket, ...rest] = withoutScheme.split('/');
  if (!bucket) {
    throw new Error('S3 upload target must include a bucket name.');
  }
  const prefix = trimSlashes(rest.join('/'));
  return { bucket, prefix };
};

const buildS3PublicBase = (bucket: string) => {
  if (PROFILE_PICTURE_PUBLIC_BASE_URL) {
    const base = PROFILE_PICTURE_PUBLIC_BASE_URL.trim();
    const hasProtocol = /^https?:\/\//i.test(base);
    return hasProtocol ? base : `https://${base}`;
  }
  if (!PROFILE_PICTURE_S3_REGION || PROFILE_PICTURE_S3_REGION === 'us-east-1') {
    return `https://${bucket}.s3.amazonaws.com/`;
  }
  return `https://${bucket}.s3.${PROFILE_PICTURE_S3_REGION}.amazonaws.com/`;
};

const uploadToLocalFilesystem = async (fileName: string, buffer: Buffer): Promise<UploadResult> => {
  await mkdir(LOCAL_UPLOAD_DIRECTORY, { recursive: true });
  const destinationPath = path.join(LOCAL_UPLOAD_DIRECTORY, fileName);
  await writeFile(destinationPath, buffer);
  const publicUrl = `/static/${fileName}`;
  return { storedPath: destinationPath, publicUrl, strategy: 'local' };
};

const uploadToS3 = async (fileName: string, buffer: Buffer, mimeType: string): Promise<UploadResult> => {
  if (!PROFILE_PICTURE_S3_TARGET) {
    throw new Error('S3 upload target is not configured. Set PROFILE_PICTURE_S3_TARGET in the environment.');
  }
  if (!s3Client) {
    throw new Error('S3 uploads are not configured. Set PROFILE_PICTURE_S3_REGION or AWS_REGION.');
  }

  const { bucket, prefix } = parseS3Target(PROFILE_PICTURE_S3_TARGET);
  const normalizedPrefix = prefix ? `${prefix}/` : '';
  const key = `${normalizedPrefix}${fileName}`.replace(/\/\/+/g, '/');
  const normalizedKey = key.replace(/^\/+/g, '');

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    ...(PROFILE_PICTURE_S3_ACL ? { ACL: PROFILE_PICTURE_S3_ACL } : {}),
  });

  await s3Client.send(command);

  const publicBase = buildS3PublicBase(bucket);
  const normalizedBase = publicBase.endsWith('/') ? publicBase : `${publicBase}/`;
  const accessiblePath = PROFILE_PICTURE_PUBLIC_BASE_URL
    ? fileName.replace(/^\/+/g, '')
    : normalizedKey;
  const publicUrl = new URL(accessiblePath, normalizedBase).toString();

  return {
    storedPath: `s3://${bucket}/${key}`,
    publicUrl,
    strategy: 'cloud',
  };
};

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Only JPG and PNG files are allowed.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: 'File exceeds the 250 KB limit.' }, { status: 400 });
    }

    const extensionFromName = path.extname(file.name || '').toLowerCase();
    if (extensionFromName && !ALLOWED_EXTENSIONS.has(extensionFromName)) {
      return NextResponse.json({ error: 'Unsupported file extension.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = extensionFromName || (file.type === 'image/png' ? '.png' : '.jpg');
    const uniqueName = `profile-${Date.now()}-${crypto.randomUUID()}${extension}`;

    const uploadResult =
      NODE_ENV === 'production'
        ? await uploadToS3(uniqueName, buffer, file.type)
        : await uploadToLocalFilesystem(uniqueName, buffer);

    return NextResponse.json({
      path: uploadResult.storedPath,
      publicUrl: uploadResult.publicUrl ?? null,
      strategy: uploadResult.strategy,
    });
  } catch (error) {
    console.error('Profile picture upload failed:', error);
    return NextResponse.json({ error: 'Failed to upload picture.' }, { status: 500 });
  }
}

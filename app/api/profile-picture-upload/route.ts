import { NextResponse } from 'next/server';
import path from 'path';
import crypto from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { Blob } from 'buffer';

const NODE_ENV = process.env.NODE_ENV || 'development';
const PROJECT_ROOT = process.cwd();
const LOCAL_UPLOAD_DIRECTORY = path.join(PROJECT_ROOT, 'public', 'static');
const CLOUD_UPLOAD_ENDPOINT = process.env.PROFILE_PICTURE_CLOUD_UPLOAD_URL;
const CLOUD_UPLOAD_API_KEY = process.env.PROFILE_PICTURE_CLOUD_UPLOAD_API_KEY;

const MAX_FILE_SIZE_BYTES = 250 * 1024; // 250 KB
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png']);
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);

type UploadResult = {
  storedPath: string;
  publicUrl?: string;
  strategy: 'local' | 'cloud';
};

const uploadToLocalFilesystem = async (fileName: string, buffer: Buffer): Promise<UploadResult> => {
  await mkdir(LOCAL_UPLOAD_DIRECTORY, { recursive: true });
  const destinationPath = path.join(LOCAL_UPLOAD_DIRECTORY, fileName);
  await writeFile(destinationPath, buffer);
  const publicUrl = `/static/${fileName}`;
  return { storedPath: destinationPath, publicUrl, strategy: 'local' };
};

const uploadToCloudStorage = async (
  fileName: string,
  buffer: Buffer,
  mimeType: string,
): Promise<UploadResult> => {
  if (!CLOUD_UPLOAD_ENDPOINT) {
    throw new Error(
      'Cloud upload endpoint is not configured. Set PROFILE_PICTURE_CLOUD_UPLOAD_URL in the environment.',
    );
  }

  const formData = new FormData();
  formData.append('file', new Blob([buffer], { type: mimeType }), fileName);

  const response = await fetch(CLOUD_UPLOAD_ENDPOINT, {
    method: 'POST',
    headers: CLOUD_UPLOAD_API_KEY ? { 'x-api-key': CLOUD_UPLOAD_API_KEY } : undefined,
    body: formData,
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.error || 'Failed to upload to cloud storage.');
  }

  const location = body?.url || body?.path;
  if (!location) {
    throw new Error('Cloud upload response did not include a file location.');
  }

  return {
    storedPath: body?.path || location,
    publicUrl: body?.url || location,
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
        ? await uploadToCloudStorage(uniqueName, buffer, file.type)
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

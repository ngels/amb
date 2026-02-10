import { NextResponse } from 'next/server';
import path from 'path';
import crypto from 'crypto';
import { mkdir, writeFile } from 'fs/promises';

const UPLOAD_DIRECTORY = '/home/wslngels/AMB/old/static';
const MAX_FILE_SIZE_BYTES = 250 * 1024; // 250 KB
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png']);
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);

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
    const destinationPath = path.join(UPLOAD_DIRECTORY, uniqueName);

    await mkdir(UPLOAD_DIRECTORY, { recursive: true });
    await writeFile(destinationPath, buffer);

    return NextResponse.json({ path: destinationPath });
  } catch (error) {
    console.error('Profile picture upload failed:', error);
    return NextResponse.json({ error: 'Failed to upload picture.' }, { status: 500 });
  }
}

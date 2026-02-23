import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { readFile } from 'fs/promises';

const LEGACY_STORAGE_BASE_DIR = process.env.LEGACY_PROFILE_PICTURE_DIR || '/home/wslngels/AMB/old/static';
const LOCAL_PUBLIC_STATIC_DIR = path.join(process.cwd(), 'public', 'static');
const STORAGE_BASE_DIRS = [LEGACY_STORAGE_BASE_DIR, LOCAL_PUBLIC_STATIC_DIR];
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);

const resolveStaticPath = (relative: string) =>
  path.join(LOCAL_PUBLIC_STATIC_DIR, relative.replace(/^\/+/, ''));

const resolveTargetPath = (inputPath: string) => {
  if (!inputPath) return null;
  if (path.isAbsolute(inputPath)) {
    return inputPath;
  }
  if (inputPath.startsWith('/static/')) {
    return resolveStaticPath(inputPath.slice('/static/'.length));
  }
  return path.join(LEGACY_STORAGE_BASE_DIR, inputPath.startsWith('/') ? inputPath.slice(1) : inputPath);
};

const isPathAllowed = (targetPath: string) => {
  const normalizedTarget = path.resolve(targetPath);
  return STORAGE_BASE_DIRS.some((base) => {
    if (!base) return false;
    const normalizedBase = path.resolve(base);
    return normalizedTarget.startsWith(normalizedBase);
  });
};

const getMimeType = (filePath: string) => {
  const ext = path.extname(filePath).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) return 'application/octet-stream';
  return ext === '.png' ? 'image/png' : 'image/jpeg';
};

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filePathParam = searchParams.get('path');

  if (!filePathParam) {
    return NextResponse.json({ error: 'Missing path parameter.' }, { status: 400 });
  }

  const resolvedPath = resolveTargetPath(filePathParam);
  if (!resolvedPath) {
    return NextResponse.json({ error: 'Invalid path.' }, { status: 400 });
  }

  if (!isPathAllowed(resolvedPath)) {
    return NextResponse.json({ error: 'Invalid path.' }, { status: 400 });
  }

  try {
    const fileBuffer = await readFile(resolvedPath);
    const mimeType = getMimeType(resolvedPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=604800, immutable',
      },
    });
  } catch (error) {
    console.error('Failed to read profile picture:', error);
    return NextResponse.json({ error: 'File not found.' }, { status: 404 });
  }
}

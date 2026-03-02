import React from 'react';
import { NextResponse } from 'next/server';
import { Document, Page, StyleSheet, Text, View, renderToStream } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 20,
    marginBottom: 12,
    fontWeight: 700,
  },
  section: {
    marginBottom: 16,
  },
  heading: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: 600,
  },
  paragraph: {
    lineHeight: 1.5,
  },
  listItem: {
    marginLeft: 12,
    lineHeight: 1.4,
  },
});

const el = React.createElement;

const tutorialDocument = el(
  Document,
  null,
  el(
    Page,
    { size: 'A4', style: styles.page },
    el(
      View,
      { style: styles.section },
      el(Text, { style: styles.title }, 'AMB Quick Tutorial'),
      el(
        Text,
        { style: styles.paragraph },
        'This short guide walks through the essentials of signing in, navigating the dashboard, and collaborating with your team. Replace this sample document with your production-ready walkthrough when available.'
      )
    ),
    el(
      View,
      { style: styles.section },
      el(Text, { style: styles.heading }, '1. Sign in securely'),
      el(
        Text,
        { style: styles.paragraph },
        'Use your work email and password. If you forget your password, use the Forgot Password link to receive a time-boxed reset email.'
      )
    ),
    el(
      View,
      { style: styles.section },
      el(Text, { style: styles.heading }, '2. Explore the dashboard'),
      el(
        Text,
        { style: styles.paragraph },
        'The navigation rail groups the Identification, Documents, and Reports modules. Numbers next to each label show pending actions.'
      )
    ),
    el(
      View,
      { style: styles.section },
      el(Text, { style: styles.heading }, '3. Upload identification packages'),
      el(
        Text,
        { style: styles.paragraph },
        'Prepare JPEG or PDF files before you begin. Drag files into the drop zone or use the Add files button. Each upload is virus-scanned automatically.'
      )
    ),
    el(
      View,
      { style: styles.section },
      el(Text, { style: styles.heading }, '4. Collaborate with teammates'),
      el(Text, { style: styles.paragraph }, 'Share context when you assign work:'),
      el(Text, { style: styles.listItem }, '• Mention the milestone you are targeting.'),
      el(Text, { style: styles.listItem }, '• Call out blockers that could delay approval.'),
      el(Text, { style: styles.listItem }, '• Note any compliance deadlines.')
    ),
    el(
      View,
      { style: styles.section },
      el(Text, { style: styles.heading }, '5. Need help?'),
      el(
        Text,
        { style: styles.paragraph },
        'Visit the help center for tutorials, search the FAQ, or send us a bug report directly from the Support tab in the product.'
      )
    )
  )
);

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

export const runtime = 'nodejs';

export async function GET() {
  try {
    const pdfStream = await renderToStream(tutorialDocument);
    const buffer = await streamToBuffer(pdfStream);

    const uint8Array = new Uint8Array(buffer);
    return new Response(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="amb-tutorial.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json({ message: 'Unable to generate the tutorial PDF.' }, { status: 500 });
  }
}

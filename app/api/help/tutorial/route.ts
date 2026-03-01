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

function TutorialDocument() {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>AMB Quick Tutorial</Text>
          <Text style={styles.paragraph}>
            This short guide walks through the essentials of signing in, navigating the dashboard, and collaborating
            with your team. Replace this sample document with your production-ready walkthrough when available.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>1. Sign in securely</Text>
          <Text style={styles.paragraph}>
            Use your work email and password. If you forget your password, use the Forgot Password link to receive a
            time-boxed reset email.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>2. Explore the dashboard</Text>
          <Text style={styles.paragraph}>
            The navigation rail groups the Identification, Documents, and Reports modules. Numbers next to each label
            show pending actions.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>3. Upload identification packages</Text>
          <Text style={styles.paragraph}>
            Prepare JPEG or PDF files before you begin. Drag files into the drop zone or use the Add files button. Each
            upload is virus-scanned automatically.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>4. Collaborate with teammates</Text>
          <Text style={styles.paragraph}>Share context when you assign work:</Text>
          <Text style={styles.listItem}>• Mention the milestone you are targeting.</Text>
          <Text style={styles.listItem}>• Call out blockers that could delay approval.</Text>
          <Text style={styles.listItem}>• Note any compliance deadlines.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>5. Need help?</Text>
          <Text style={styles.paragraph}>
            Visit the help center for tutorials, search the FAQ, or send us a bug report directly from the Support tab
            in the product.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

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
    const pdfStream = await renderToStream(<TutorialDocument />);
    const buffer = await streamToBuffer(pdfStream);

    return new NextResponse(buffer, {
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

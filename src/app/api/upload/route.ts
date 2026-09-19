import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary using server-side environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: Request) {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      return NextResponse.json(
        { error: 'Cloudinary Cloud Name is not configured on the server environment.' },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || 'application/octet-stream';
    const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;

    // Upload directly using authenticated Cloudinary SDK
    const uploadRes = await cloudinary.uploader.upload(base64Data, {
      folder: 'humane-touch-portal',
      resource_type: 'auto',
    });

    return NextResponse.json({
      success: true,
      secure_url: uploadRes.secure_url,
    });
  } catch (error: any) {
    console.error('Server Upload Handler Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload document to Cloudinary' },
      { status: 500 }
    );
  }
}
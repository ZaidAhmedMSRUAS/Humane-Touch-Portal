import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Configure Cloudinary from server environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Please log in before uploading documents.' }, { status: 401 });
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: 'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME in Netlify environment variables.' },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'File size exceeds the 10 MB limit.' }, { status: 413 });
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) return NextResponse.json({ error: 'Only PDF, JPG, and PNG documents are accepted.' }, { status: 415 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || 'application/octet-stream';
    const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;

    // Upload directly using authenticated Cloudinary SDK
    const uploadRes = await cloudinary.uploader.upload(base64Data, {
      folder: 'humane-touch-portal/student-documents',
      resource_type: 'auto',
    });

    return NextResponse.json({
      success: true,
      secure_url: uploadRes.secure_url,
      url: uploadRes.secure_url,
      public_id: uploadRes.public_id,
    });
  } catch (error: any) {
    console.error('Server Upload Handler Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload document.' },
      { status: 500 }
    );
  }
}

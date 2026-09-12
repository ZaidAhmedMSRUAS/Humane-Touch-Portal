/**
 * Utility helper to upload student documents to Cloudinary via Next.js API route
 * @param file - The HTML File object selected from <input type="file" />
 * @param folder - Cloudinary folder destination (defaults to 'udaan_student_docs')
 * @returns The permanent HTTPS URL string to store in PostgreSQL
 */
export async function uploadDocument(file: File, folder: string = 'udaan_student_docs'): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (response.ok && data.success) {
    console.log('✓ Document uploaded to Cloudinary:', data.url);
    return data.url;
  } else {
    throw new Error(data.error || 'Failed to upload document.');
  }
}
/**
 * Admin endpoint to manually refresh exam cache
 * Useful when Microsoft Learn updates an exam
 * Usage:
 * - POST /api/admin/refresh-exam-cache?code=AZ-900 (refresh one exam)
 * - POST /api/admin/refresh-exam-cache (refresh all exams)
 *
 * In production, add authentication before deploying!
 */

import { clearExamCache } from '@/lib/microsoft-learn.js';

export async function POST(request) {
  // TODO: Add authentication (e.g., API key, JWT token)
  // For now, this is open for development. Add security in production!

  try {
    const { searchParams } = new URL(request.url);
    const examCode = searchParams.get('code');

    if (examCode) {
      // Refresh specific exam
      clearExamCache(examCode);
      return Response.json({
        success: true,
        message: `Cache cleared for exam ${examCode}. Next fetch will get fresh data from Microsoft Learn.`,
        examCode,
      });
    } else {
      // Refresh all exams
      clearExamCache();
      return Response.json({
        success: true,
        message: 'Cache cleared for all exams. All fetches will get fresh data from Microsoft Learn.',
      });
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  return Response.json({
    info: 'Cache refresh endpoint',
    usage: {
      'POST /api/admin/refresh-exam-cache?code=AZ-900': 'Refresh cache for specific exam',
      'POST /api/admin/refresh-exam-cache': 'Refresh cache for all exams',
    },
    warning: 'Add authentication before deploying to production!',
  });
}

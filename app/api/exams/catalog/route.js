/**
 * Dynamic Exam Catalog Endpoint
 * Returns all available Microsoft certification exams
 * Automatically discovers new exams from Microsoft Learn (no code changes needed!)
 */

import { fetchExamCatalog } from '@/lib/microsoft-learn.js';

export async function GET(request) {
  try {
    const exams = await fetchExamCatalog();

    if (!exams || exams.length === 0) {
      return Response.json(
        { error: 'No exams available', exams: [] },
        { status: 200 }
      );
    }

    return Response.json(
      {
        success: true,
        total: exams.length,
        exams: exams,
        categories: [...new Set(exams.map(e => e.category))],
      },
      {
        headers: {
          // Cache for 1 hour on client, revalidate on demand
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching exam catalog:', error);
    return Response.json(
      { error: error.message, exams: [] },
      { status: 500 }
    );
  }
}

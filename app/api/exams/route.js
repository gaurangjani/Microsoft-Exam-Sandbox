import { fetchExamCatalog } from '@/lib/microsoft-learn';

export async function GET() {
  try {
    const exams = await fetchExamCatalog();
    return Response.json(exams, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=259200',
      },
    });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

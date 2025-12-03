import { NextRequest, NextResponse } from 'next/server';
import { getArchivedEvents } from '@/lib/larkbase-client';

/**
 * アーカイブ一覧API
 *
 * LarkBaseの多元表からアーカイブ動画付きのイベントを取得
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // クエリパラメータ
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sort = searchParams.get('sort') || 'date'; // date, title
    const order = searchParams.get('order') || 'desc'; // asc, desc

    // LarkBaseからアーカイブイベントを取得
    const allEvents = await getArchivedEvents();

    // ソート
    let sorted = [...allEvents];
    switch (sort) {
      case 'title':
        sorted.sort((a, b) => {
          const comparison = a.title.localeCompare(b.title, 'ja');
          return order === 'asc' ? comparison : -comparison;
        });
        break;
      case 'date':
      default:
        sorted.sort((a, b) => {
          const timeA = new Date(a.scheduled_at).getTime();
          const timeB = new Date(b.scheduled_at).getTime();
          return order === 'asc' ? timeA - timeB : timeB - timeA;
        });
        break;
    }

    // ページネーション
    const offset = (page - 1) * limit;
    const paginatedEvents = sorted.slice(offset, offset + limit);

    return NextResponse.json({
      archives: paginatedEvents.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        event_date: event.scheduled_at,
        archive_url: event.archive_url,
        thumbnail_url: null, // TODO: サムネイルが必要な場合はLarkBaseに追加
        view_count: 0, // TODO: 視聴回数トラッキングが必要な場合は実装
        status: 'ready',
        created_at: event.created_at,
      })),
      pagination: {
        page,
        limit,
        total: sorted.length,
        pages: Math.ceil(sorted.length / limit),
      },
    });

  } catch (error: any) {
    console.error('Archives error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

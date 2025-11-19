import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // クエリパラメータ
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sort = searchParams.get('sort') || 'date'; // date, title, views
    const order = searchParams.get('order') || 'desc'; // asc, desc

    const offset = (page - 1) * limit;

    // ソート設定
    let orderBy: string;
    switch (sort) {
      case 'title':
        orderBy = 'title';
        break;
      case 'views':
        orderBy = 'view_count';
        break;
      case 'date':
      default:
        orderBy = 'event_date';
        break;
    }

    // アーカイブ一覧を取得
    const query = supabase
      .from('archives')
      .select('*', { count: 'exact' })
      .eq('status', 'ready')
      .order(orderBy, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Archives query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch archives', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      archives: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
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

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  try {
    // 最新の配信統計を取得
    const { data: latestStats, error: statsError } = await supabase
      .from('stream_stats')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    // 配信が稼働しているかチェック（最後の統計が5分以内）
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const isLive = latestStats &&
      new Date(latestStats.timestamp) > fiveMinutesAgo;

    // 現在のアクティブな視聴セッション数を取得
    const { count: viewerCount } = await supabase
      .from('viewer_sessions')
      .select('*', { count: 'exact', head: true })
      .is('session_end', null);

    // 稼働時間を計算（最初の配信統計から現在まで）
    const { data: firstStats } = await supabase
      .from('stream_stats')
      .select('timestamp')
      .order('timestamp', { ascending: true })
      .limit(1)
      .single();

    let uptime = 0;
    if (firstStats) {
      uptime = Math.floor((Date.now() - new Date(firstStats.timestamp).getTime()) / 1000);
    }

    // 帯域幅使用量を集計（今日分）
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: todayStats } = await supabase
      .from('stream_stats')
      .select('bandwidth_used')
      .gte('timestamp', todayStart.toISOString());

    const bandwidth_used = todayStats?.reduce((sum, stat) => sum + (stat.bandwidth_used || 0), 0) || 0;

    return NextResponse.json({
      is_live: isLive,
      viewer_count: viewerCount || 0,
      uptime,
      bandwidth_used,
      last_update: latestStats?.timestamp || null,
    });

  } catch (error: any) {
    console.error('Stream status error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// POST: 配信統計を記録（VPSから定期的に送信）
export async function POST(req: NextRequest) {
  try {
    const { viewer_count, current_video_id, bandwidth_used } = await req.json();

    const { error } = await supabase
      .from('stream_stats')
      .insert({
        timestamp: new Date().toISOString(),
        viewer_count: viewer_count || 0,
        current_video_id,
        bandwidth_used: bandwidth_used || 0,
      });

    if (error) {
      console.error('Insert stats error:', error);
      return NextResponse.json(
        { error: 'Failed to insert stats', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Post stream status error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

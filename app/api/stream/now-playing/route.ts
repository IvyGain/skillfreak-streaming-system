import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  try {
    // 最新の配信統計から現在再生中の動画IDを取得
    const { data: statsData, error: statsError } = await supabase
      .from('stream_stats')
      .select('current_video_id')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (statsError || !statsData || !statsData.current_video_id) {
      // 統計がない場合は、最初のアーカイブを返す
      const { data: firstArchive, error: archiveError } = await supabase
        .from('archives')
        .select('*')
        .eq('status', 'ready')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (archiveError || !firstArchive) {
        return NextResponse.json(
          { error: 'No videos available' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        video_id: firstArchive.video_id,
        title: firstArchive.title,
        speaker: firstArchive.speaker,
        thumbnail_url: firstArchive.thumbnail_url,
        duration: firstArchive.duration,
        elapsed_time: 0,
      });
    }

    // 現在再生中の動画情報を取得
    const { data: archiveData, error: archiveError } = await supabase
      .from('archives')
      .select('*')
      .eq('video_id', statsData.current_video_id)
      .single();

    if (archiveError || !archiveData) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // 簡易的な経過時間計算（実際のVPSからのリアルタイム情報が理想）
    const elapsed_time = 0; // TODO: VPSから実際の再生位置を取得

    return NextResponse.json({
      video_id: archiveData.video_id,
      title: archiveData.title,
      speaker: archiveData.speaker,
      thumbnail_url: archiveData.thumbnail_url,
      duration: archiveData.duration,
      elapsed_time,
    });

  } catch (error: any) {
    console.error('Now playing error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

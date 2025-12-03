/**
 * 自動アーカイブAPI
 *
 * POST /api/archive/auto
 *
 * 終了したイベントのYouTube動画を自動でLark Driveにアーカイブし、
 * LarkBaseの「アーカイブ動画」フィールドにURLを登録する
 *
 * Vercel Cronで毎時呼び出し可能
 */

import { NextRequest, NextResponse } from 'next/server';
import { getEventsToArchive, getRecentlyEndedEvents, getEventEndTime } from '@/lib/larkbase-scheduler';
import { registerArchiveUrl } from '@/lib/portalapp-sync';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5分タイムアウト

interface ArchiveResult {
  eventId: string;
  eventTitle: string;
  status: 'success' | 'skipped' | 'error';
  message: string;
  fileToken?: string;
}

export async function POST(request: NextRequest) {
  try {
    // 認証チェック（Vercel Cronまたは管理者からのリクエストのみ許可）
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // リクエストボディからオプション取得
    let hours = 1;
    let dryRun = false;

    try {
      const body = await request.json();
      hours = body.hours || 1;
      dryRun = body.dryRun || false;
    } catch {
      // ボディなしの場合はデフォルト値を使用
    }

    console.log(`🎬 自動アーカイブ開始 (過去${hours}時間, dryRun=${dryRun})`);

    // アーカイブ対象のイベントを取得
    const events = hours === 1
      ? await getEventsToArchive()
      : await getRecentlyEndedEvents(hours);

    if (events.length === 0) {
      return NextResponse.json({
        message: 'No events to archive',
        events: [],
        processed: 0,
        success: 0,
        failed: 0,
      });
    }

    const results: ArchiveResult[] = [];

    for (const event of events) {
      const result: ArchiveResult = {
        eventId: event.id,
        eventTitle: event.title,
        status: 'skipped',
        message: '',
      };

      if (dryRun) {
        result.status = 'skipped';
        result.message = 'Dry run - no action taken';
        results.push(result);
        continue;
      }

      try {
        // 注意: サーバーサイドではyt-dlpが使えないため、
        // ここでは「アーカイブ対象としてマーク」のみ行う
        // 実際のダウンロードはGitHub Actionsまたはローカルで実行

        result.status = 'skipped';
        result.message = 'Marked for archive - run CLI script to complete';

        console.log(`📋 アーカイブ対象: ${event.title} (${event.youtube_url})`);

      } catch (error) {
        result.status = 'error';
        result.message = error instanceof Error ? error.message : String(error);
      }

      results.push(result);
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const failedCount = results.filter(r => r.status === 'error').length;

    return NextResponse.json({
      message: `Processed ${events.length} events`,
      events: results,
      processed: events.length,
      success: successCount,
      failed: failedCount,
      note: 'サーバーレス環境ではダウンロード不可。GitHub ActionsまたはCLIで実行してください。',
    });

  } catch (error) {
    console.error('Auto archive error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET: アーカイブ対象のイベント一覧を取得（確認用）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get('hours') || '1', 10);

    const events = hours === 1
      ? await getEventsToArchive()
      : await getRecentlyEndedEvents(hours);

    return NextResponse.json({
      count: events.length,
      events: events.map(e => ({
        id: e.id,
        title: e.title,
        youtube_url: e.youtube_url,
        scheduled_at: e.scheduled_at,
        duration: e.duration,
        end_time: new Date(getEventEndTime(e)).toISOString(),
        archive_file_token: e.archive_file_token || null,
      })),
    });

  } catch (error) {
    console.error('Get archive candidates error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

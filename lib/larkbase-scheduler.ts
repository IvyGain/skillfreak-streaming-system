/**
 * LarkBase イベントスケジューラー
 *
 * イベント終了時刻を計算し、アーカイブ対象のイベントを検出
 */

import { getAllEvents, Event } from './larkbase-client';

/**
 * イベントの終了時刻を計算
 * @param event イベント
 * @returns 終了時刻（ミリ秒）
 */
export function getEventEndTime(event: Event): number {
  const startTime = new Date(event.scheduled_at).getTime();
  const durationMs = (event.duration || 60) * 60 * 1000; // デフォルト60分
  return startTime + durationMs;
}

/**
 * イベントが終了しているか判定
 * @param event イベント
 * @param now 現在時刻（ミリ秒）
 */
export function isEventEnded(event: Event, now: number = Date.now()): boolean {
  return getEventEndTime(event) <= now;
}

/**
 * 終了後1時間以内のイベントを取得（アーカイブ対象）
 *
 * 条件:
 * - イベント終了時刻 < 現在時刻
 * - イベント終了時刻 > 現在時刻 - 1時間
 * - YouTube URLがある
 * - アーカイブファイルトークンがない（未アーカイブ）
 */
export async function getEventsToArchive(): Promise<Event[]> {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  const events = await getAllEvents({ status: 'published' });

  return events.filter(event => {
    const endTime = getEventEndTime(event);

    // 終了後1時間以内
    const isRecentlyEnded = endTime <= now && endTime > oneHourAgo;

    // YouTube URLがある
    const hasYouTubeUrl = !!event.youtube_url && event.youtube_url.trim() !== '';

    // まだアーカイブされていない
    const notArchived = !event.archive_file_token || event.archive_file_token.trim() === '';

    return isRecentlyEnded && hasYouTubeUrl && notArchived;
  });
}

/**
 * 指定時間以内に終了したイベントを取得（より柔軟なバージョン）
 * @param hoursAgo 何時間前まで遡るか（デフォルト: 24時間）
 */
export async function getRecentlyEndedEvents(hoursAgo: number = 24): Promise<Event[]> {
  const now = Date.now();
  const cutoffTime = now - hoursAgo * 60 * 60 * 1000;

  const events = await getAllEvents({ status: 'published' });

  return events.filter(event => {
    const endTime = getEventEndTime(event);

    // 指定時間以内に終了
    const isRecentlyEnded = endTime <= now && endTime > cutoffTime;

    // YouTube URLがある
    const hasYouTubeUrl = !!event.youtube_url && event.youtube_url.trim() !== '';

    // まだアーカイブされていない
    const notArchived = !event.archive_file_token || event.archive_file_token.trim() === '';

    return isRecentlyEnded && hasYouTubeUrl && notArchived;
  });
}

/**
 * 今後24時間以内に終了予定のイベントを取得（予告用）
 */
export async function getUpcomingEndEvents(): Promise<Event[]> {
  const now = Date.now();
  const next24Hours = now + 24 * 60 * 60 * 1000;

  const events = await getAllEvents({ status: 'published' });

  return events.filter(event => {
    const endTime = getEventEndTime(event);

    // 今後24時間以内に終了
    const isEndingSoon = endTime > now && endTime <= next24Hours;

    // YouTube URLがある
    const hasYouTubeUrl = !!event.youtube_url && event.youtube_url.trim() !== '';

    return isEndingSoon && hasYouTubeUrl;
  });
}

export default {
  getEventEndTime,
  isEventEnded,
  getEventsToArchive,
  getRecentlyEndedEvents,
  getUpcomingEndEvents,
};

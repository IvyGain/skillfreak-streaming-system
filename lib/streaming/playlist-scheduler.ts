/**
 * Playlist Scheduler - 24時間VOD配信用スケジューラー（改善版）
 *
 * プレイリストを管理し、現在再生中の動画と再生位置を追跡
 * スムーズな動画切り替えと24時間ループ再生をサポート
 */

export interface VideoItem {
  id: string;
  title: string;
  url: string;  // 動画URL（YouTube, Lark Drive, or direct URL）
  duration?: number;  // 秒
}

export interface PlaybackState {
  currentVideoIndex: number;
  currentVideo: VideoItem | null;
  position: number;  // 秒
  startedAt: Date;
  isPlaying: boolean;
  nextVideo?: VideoItem | null;  // 次の動画（プリロード用）
  remainingTime?: number;  // 現在の動画の残り時間
}

export class PlaylistScheduler {
  private playlist: VideoItem[] = [];
  private currentIndex: number = 0;
  private startTime: Date = new Date();
  private videoDurations: Map<string, number> = new Map();
  private defaultDuration: number = 3600;  // デフォルト1時間

  constructor(playlist: VideoItem[] = []) {
    this.playlist = playlist;
    this.startTime = new Date();
  }

  /**
   * プレイリストを設定
   */
  setPlaylist(playlist: VideoItem[]): void {
    this.playlist = playlist;
    this.currentIndex = 0;
    this.startTime = new Date();
  }

  /**
   * 動画の長さを設定
   */
  setVideoDuration(videoId: string, duration: number): void {
    this.videoDurations.set(videoId, duration);
  }

  /**
   * 現在の再生状態を取得（改善版 - 次の動画情報と残り時間も返す）
   */
  getPlaybackState(): PlaybackState {
    if (this.playlist.length === 0) {
      return {
        currentVideoIndex: -1,
        currentVideo: null,
        position: 0,
        startedAt: this.startTime,
        isPlaying: false,
        nextVideo: null,
        remainingTime: 0,
      };
    }

    // 経過時間を計算
    const now = new Date();
    const elapsedSeconds = Math.floor((now.getTime() - this.startTime.getTime()) / 1000);

    // 24時間ループ対応: プレイリスト全体の長さで割った余りを使用
    const totalPlaylistDuration = this.getTotalDuration();
    const loopedElapsed = totalPlaylistDuration > 0 ? elapsedSeconds % totalPlaylistDuration : 0;

    // 現在再生中の動画と位置を計算
    let totalDuration = 0;
    let currentIndex = 0;
    let position = 0;

    for (let i = 0; i < this.playlist.length; i++) {
      const video = this.playlist[i];
      const duration = this.videoDurations.get(video.id) || video.duration || this.defaultDuration;

      if (totalDuration + duration > loopedElapsed) {
        currentIndex = i;
        position = loopedElapsed - totalDuration;

        // 次の動画を取得
        const nextIndex = (i + 1) % this.playlist.length;
        const nextVideo = this.playlist[nextIndex];

        // 残り時間を計算
        const remainingTime = duration - position;

        return {
          currentVideoIndex: currentIndex,
          currentVideo: this.playlist[currentIndex],
          position,
          startedAt: this.startTime,
          isPlaying: true,
          nextVideo,
          remainingTime,
        };
      }

      totalDuration += duration;
    }

    // フォールバック（理論的にはここには到達しない）
    return {
      currentVideoIndex: 0,
      currentVideo: this.playlist[0],
      position: 0,
      startedAt: this.startTime,
      isPlaying: true,
      nextVideo: this.playlist.length > 1 ? this.playlist[1] : null,
      remainingTime: this.videoDurations.get(this.playlist[0].id) || this.playlist[0].duration || this.defaultDuration,
    };
  }

  /**
   * 経過時間から再生位置を計算（ループ対応・改善版）
   */
  private calculatePositionFromElapsed(elapsed: number): PlaybackState {
    let totalDuration = 0;

    for (let i = 0; i < this.playlist.length; i++) {
      const video = this.playlist[i];
      const duration = this.videoDurations.get(video.id) || video.duration || this.defaultDuration;

      if (totalDuration + duration > elapsed) {
        const position = elapsed - totalDuration;
        const nextIndex = (i + 1) % this.playlist.length;
        const remainingTime = duration - position;

        return {
          currentVideoIndex: i,
          currentVideo: this.playlist[i],
          position,
          startedAt: this.startTime,
          isPlaying: true,
          nextVideo: this.playlist[nextIndex],
          remainingTime,
        };
      }

      totalDuration += duration;
    }

    // フォールバック
    return {
      currentVideoIndex: 0,
      currentVideo: this.playlist[0],
      position: 0,
      startedAt: this.startTime,
      isPlaying: true,
      nextVideo: this.playlist.length > 1 ? this.playlist[1] : null,
      remainingTime: this.videoDurations.get(this.playlist[0].id) || this.playlist[0].duration || this.defaultDuration,
    };
  }

  /**
   * 次の動画を取得
   */
  getNextVideo(): VideoItem | null {
    if (this.playlist.length === 0) return null;
    const state = this.getPlaybackState();
    const nextIndex = (state.currentVideoIndex + 1) % this.playlist.length;
    return this.playlist[nextIndex];
  }

  /**
   * プレイリストの全長（秒）
   */
  getTotalDuration(): number {
    return this.playlist.reduce((total, video) => {
      return total + (this.videoDurations.get(video.id) || video.duration || this.defaultDuration);
    }, 0);
  }

  /**
   * 全プレイリストを取得
   */
  getPlaylist(): VideoItem[] {
    return this.playlist;
  }

  /**
   * JSONエクスポート（クライアント同期用）
   */
  toJSON() {
    const state = this.getPlaybackState();
    return {
      playlist: this.playlist,
      currentIndex: state.currentVideoIndex,
      currentVideo: state.currentVideo,
      position: state.position,
      totalDuration: this.getTotalDuration(),
      startedAt: this.startTime.toISOString(),
    };
  }
}

// シングルトンインスタンス
let schedulerInstance: PlaylistScheduler | null = null;

export function getScheduler(): PlaylistScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new PlaylistScheduler();
  }
  return schedulerInstance;
}

export function resetScheduler(): void {
  schedulerInstance = null;
}

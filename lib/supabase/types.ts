/**
 * Supabase Database Types
 *
 * データベーステーブルの型定義
 * docs/SYSTEM_DESIGN.md セクション4.1 参照
 */

/**
 * archives テーブル型定義
 */
export interface Archive {
  id: string;
  video_id: string;
  title: string;
  speaker: string | null;
  description: string | null;
  event_date: string | null;
  file_path: string;
  file_size: number | null;
  duration: number | null; // 秒
  thumbnail_url: string | null;
  status: 'ready' | 'processing' | 'error';
  view_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * download_jobs テーブル型定義
 */
export interface DownloadJob {
  id: string;
  job_id: string;
  youtube_url: string;
  video_id: string;
  title: string | null;
  speaker: string | null;
  event_date: string | null;
  lark_record_id: string | null;
  status: 'pending' | 'downloading' | 'uploading' | 'completed' | 'failed';
  error_message: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

/**
 * playlists テーブル型定義
 */
export interface Playlist {
  id: string;
  name: string;
  description: string | null;
  video_order: PlaylistItem[] | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlaylistItem {
  video_id: string;
  position: number;
}

/**
 * stream_stats テーブル型定義
 */
export interface StreamStats {
  id: string;
  timestamp: string;
  viewer_count: number;
  current_video_id: string | null;
  bandwidth_used: number | null; // bytes
  created_at: string;
}

/**
 * viewer_sessions テーブル型定義
 */
export interface ViewerSession {
  id: string;
  user_id: string | null;
  session_start: string;
  session_end: string | null;
  duration: number | null; // 秒
  videos_watched: VideoWatched[] | null;
  device_info: Record<string, unknown> | null;
  created_at: string;
}

export interface VideoWatched {
  video_id: string;
  watched_duration: number; // 秒
}

/**
 * Database型定義（Supabase自動生成用テンプレート）
 */
export interface Database {
  public: {
    Tables: {
      archives: {
        Row: Archive;
        Insert: Omit<Archive, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Archive, 'id' | 'created_at'>>;
      };
      download_jobs: {
        Row: DownloadJob;
        Insert: Omit<DownloadJob, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DownloadJob, 'id' | 'created_at'>>;
      };
      playlists: {
        Row: Playlist;
        Insert: Omit<Playlist, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Playlist, 'id' | 'created_at'>>;
      };
      stream_stats: {
        Row: StreamStats;
        Insert: Omit<StreamStats, 'id' | 'created_at'>;
        Update: Partial<Omit<StreamStats, 'id'>>;
      };
      viewer_sessions: {
        Row: ViewerSession;
        Insert: Omit<ViewerSession, 'id' | 'created_at'>;
        Update: Partial<Omit<ViewerSession, 'id'>>;
      };
    };
  };
}

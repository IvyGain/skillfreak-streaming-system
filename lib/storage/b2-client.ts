/**
 * Backblaze B2 Storage Client
 *
 * S3互換APIを使用してB2ストレージにアクセス
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import type { PutObjectCommandInput, GetObjectCommandInput } from '@aws-sdk/client-s3';

/**
 * B2クライアント設定
 */
export interface B2Config {
  endpoint: string;
  region: string;
  keyId: string;
  applicationKey: string;
  bucketName: string;
}

/**
 * ファイルアップロードオプション
 */
export interface UploadOptions {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType?: string;
  metadata?: Record<string, string>;
}

/**
 * Backblaze B2 Storage Client
 *
 * @example
 * ```typescript
 * import { createB2Client } from '@/lib/storage/b2-client';
 *
 * const b2 = createB2Client({
 *   endpoint: process.env.B2_ENDPOINT!,
 *   region: 'us-west-004',
 *   keyId: process.env.B2_KEY_ID!,
 *   applicationKey: process.env.B2_APP_KEY!,
 *   bucketName: process.env.B2_BUCKET_NAME!,
 * });
 *
 * // ファイルアップロード
 * await b2.upload({
 *   key: 'videos/abc123.mp4',
 *   body: videoBuffer,
 *   contentType: 'video/mp4',
 * });
 * ```
 */
export class B2Client {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(config: B2Config) {
    this.s3Client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.keyId,
        secretAccessKey: config.applicationKey,
      },
    });
    this.bucketName = config.bucketName;
  }

  /**
   * ファイルをB2にアップロード
   *
   * @param options - アップロードオプション
   * @returns アップロード結果
   *
   * @example
   * ```typescript
   * await b2.upload({
   *   key: 'videos/video123.mp4',
   *   body: fileBuffer,
   *   contentType: 'video/mp4',
   *   metadata: {
   *     'x-amz-meta-video-id': 'video123',
   *     'x-amz-meta-title': 'My Video',
   *   },
   * });
   * ```
   */
  async upload(options: UploadOptions) {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: options.key,
      Body: options.body,
      ContentType: options.contentType,
      Metadata: options.metadata,
    });

    const result = await this.s3Client.send(command);
    return {
      success: true,
      etag: result.ETag,
      key: options.key,
    };
  }

  /**
   * ファイルをB2からダウンロード
   *
   * @param key - ファイルキー
   * @returns ファイルデータ
   */
  async download(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const result = await this.s3Client.send(command);
    const body = await result.Body?.transformToByteArray();

    return {
      body,
      contentType: result.ContentType,
      metadata: result.Metadata,
    };
  }

  /**
   * ファイルを削除
   *
   * @param key - ファイルキー
   */
  async delete(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
    return { success: true, key };
  }

  /**
   * ディレクトリ内のファイル一覧を取得
   *
   * @param prefix - ディレクトリプレフィックス
   * @param maxKeys - 最大取得件数
   * @returns ファイル一覧
   *
   * @example
   * ```typescript
   * // videos/ディレクトリ内のファイル一覧
   * const files = await b2.list('videos/', 100);
   * ```
   */
  async list(prefix?: string, maxKeys: number = 1000) {
    const command = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: prefix,
      MaxKeys: maxKeys,
    });

    const result = await this.s3Client.send(command);
    return {
      files: result.Contents?.map(obj => ({
        key: obj.Key!,
        size: obj.Size!,
        lastModified: obj.LastModified!,
      })) || [],
      count: result.KeyCount || 0,
    };
  }

  /**
   * ファイルの公開URLを生成（B2バケットがpublicの場合）
   *
   * @param key - ファイルキー
   * @returns 公開URL
   */
  getPublicUrl(key: string): string {
    // B2の公開URLフォーマット
    const endpoint = this.s3Client.config.endpoint;
    if (typeof endpoint === 'string') {
      return `${endpoint}/${this.bucketName}/${key}`;
    }
    throw new Error('Invalid endpoint configuration');
  }
}

/**
 * B2クライアントインスタンスを作成
 *
 * @param config - B2設定
 * @returns B2Clientインスタンス
 */
export function createB2Client(config: B2Config): B2Client {
  return new B2Client(config);
}

/**
 * 環境変数からB2クライアントを作成
 *
 * @returns B2Clientインスタンス
 */
export function createB2ClientFromEnv(): B2Client {
  const config: B2Config = {
    endpoint: process.env.B2_ENDPOINT!,
    region: 'us-west-004',
    keyId: process.env.B2_KEY_ID!,
    applicationKey: process.env.B2_APP_KEY!,
    bucketName: process.env.B2_BUCKET_NAME!,
  };

  return new B2Client(config);
}

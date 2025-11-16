/**
 * Backblaze B2 Native API Client
 *
 * B2の公式SDKを使用（S3互換APIではなくNative API）
 */

import B2 from 'backblaze-b2';

/**
 * B2 Native Client設定
 */
export interface B2NativeConfig {
  applicationKeyId: string;
  applicationKey: string;
  bucketId?: string;
  bucketName?: string;
}

/**
 * ファイルアップロードオプション
 */
export interface B2UploadOptions {
  fileName: string;
  data: Buffer | string;
  contentType?: string;
  info?: Record<string, string>;
}

/**
 * Backblaze B2 Native Client
 *
 * @example
 * ```typescript
 * import { createB2NativeClient } from '@/lib/storage/b2-native-client';
 *
 * const b2 = await createB2NativeClient({
 *   applicationKeyId: process.env.B2_KEY_ID!,
 *   applicationKey: process.env.B2_APP_KEY!,
 *   bucketName: 'skillfreak-archives',
 * });
 *
 * // ファイルアップロード
 * await b2.upload({
 *   fileName: 'videos/test.mp4',
 *   data: videoBuffer,
 *   contentType: 'video/mp4',
 * });
 * ```
 */
export class B2NativeClient {
  private b2: B2;
  private bucketId?: string;
  private bucketName?: string;
  private authorized = false;

  constructor(private config: B2NativeConfig) {
    // デバッグ: 認証情報を確認
    console.log('[B2Client] Key ID:', config.applicationKeyId?.substring(0, 12) + '...');
    console.log('[B2Client] App Key length:', config.applicationKey?.length);

    this.b2 = new B2({
      applicationKeyId: config.applicationKeyId,
      applicationKey: config.applicationKey,
    });
    this.bucketId = config.bucketId;
    this.bucketName = config.bucketName;
  }

  /**
   * B2 APIに認証
   */
  async authorize(): Promise<void> {
    if (this.authorized) return;

    await this.b2.authorize();
    this.authorized = true;

    // bucketNameからbucketIdを取得
    if (this.bucketName && !this.bucketId) {
      const response = await this.b2.listBuckets({
        bucketName: this.bucketName,
      });

      if (response.data.buckets.length > 0) {
        this.bucketId = response.data.buckets[0].bucketId;
      } else {
        throw new Error(`Bucket "${this.bucketName}" not found`);
      }
    }
  }

  /**
   * ファイルをB2にアップロード
   */
  async upload(options: B2UploadOptions): Promise<any> {
    await this.authorize();

    if (!this.bucketId) {
      throw new Error('Bucket ID not set');
    }

    // アップロードURL取得
    const uploadUrlResponse = await this.b2.getUploadUrl({
      bucketId: this.bucketId,
    });

    const uploadUrl = uploadUrlResponse.data.uploadUrl;
    const authorizationToken = uploadUrlResponse.data.authorizationToken;

    // ファイルアップロード
    const data = Buffer.isBuffer(options.data)
      ? options.data
      : Buffer.from(options.data);

    const response = await this.b2.uploadFile({
      uploadUrl,
      uploadAuthToken: authorizationToken,
      fileName: options.fileName,
      data,
      contentType: options.contentType,
      info: options.info,
    });

    return response.data;
  }

  /**
   * ファイルをダウンロード
   */
  async download(fileName: string): Promise<Buffer> {
    await this.authorize();

    if (!this.bucketName) {
      throw new Error('Bucket name not set');
    }

    const response = await this.b2.downloadFileByName({
      bucketName: this.bucketName,
      fileName,
    });

    return Buffer.from(response.data);
  }

  /**
   * ファイルを削除
   */
  async delete(fileName: string, fileId: string): Promise<void> {
    await this.authorize();

    await this.b2.deleteFileVersion({
      fileName,
      fileId,
    });
  }

  /**
   * バケット内のファイル一覧
   */
  async listFiles(prefix?: string, maxFileCount: number = 1000): Promise<any> {
    await this.authorize();

    if (!this.bucketId) {
      throw new Error('Bucket ID not set');
    }

    const response = await this.b2.listFileNames({
      bucketId: this.bucketId,
      prefix,
      maxFileCount,
    });

    return response.data.files;
  }

  /**
   * ファイルのダウンロードURLを生成
   */
  getDownloadUrl(fileName: string): string {
    if (!this.bucketName) {
      throw new Error('Bucket name not set');
    }

    const downloadUrl = this.b2.getDownloadAuthorization({
      bucketId: this.bucketId!,
      fileNamePrefix: fileName,
      validDurationInSeconds: 3600,
    });

    return `https://f004.backblazeb2.com/file/${this.bucketName}/${fileName}`;
  }
}

/**
 * B2 Native Clientインスタンスを作成
 */
export async function createB2NativeClient(
  config: B2NativeConfig
): Promise<B2NativeClient> {
  const client = new B2NativeClient(config);
  await client.authorize();
  return client;
}

/**
 * 環境変数からB2 Native Clientを作成
 */
export async function createB2NativeClientFromEnv(): Promise<B2NativeClient> {
  return createB2NativeClient({
    applicationKeyId: process.env.B2_KEY_ID!,
    applicationKey: process.env.B2_APP_KEY!,
    bucketName: process.env.B2_BUCKET_NAME!,
  });
}

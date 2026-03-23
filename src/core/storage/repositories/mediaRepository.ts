import { db, type MediaAsset } from '../db';
import { createMediaId } from '../../types/ids';
import { nowISO } from '../../utils/dates';
import { createError } from '../../utils/errors';
import { APP_CONFIG } from '../../config/appConfig';

/**
 * Repository for media asset (image blob) CRUD operations.
 */
export const mediaRepository = {
  /** Get a media asset by its ID. */
  async getById(mediaId: string): Promise<MediaAsset | undefined> {
    return db.mediaAssets.get(mediaId);
  },

  /** Get all media assets for a given collection entry. */
  async getByEntryId(entryId: string): Promise<MediaAsset[]> {
    return db.mediaAssets.where('entryId').equals(entryId).toArray();
  },

  /** Save a new media asset (image blob). Returns the assigned mediaId. */
  async add(params: {
    entryId?: string;
    type: 'image' | 'thumbnail';
    mimeType: string;
    blob: Blob;
    fileName?: string;
  }): Promise<string> {
    if (params.blob.size > APP_CONFIG.limits.maxMediaSize) {
      throw createError(
        'LIMIT_EXCEEDED',
        `Media file exceeds maximum size of ${APP_CONFIG.limits.maxMediaSize} bytes`,
      );
    }

    const asset: MediaAsset = {
      mediaId: createMediaId(),
      entryId: params.entryId,
      type: params.type,
      mimeType: params.mimeType,
      blob: params.blob,
      fileName: params.fileName,
      size: params.blob.size,
      createdAt: nowISO(),
    };

    await db.mediaAssets.add(asset);
    return asset.mediaId;
  },

  /** Replace the blob for an existing media asset. */
  async updateBlob(mediaId: string, blob: Blob): Promise<void> {
    const count = await db.mediaAssets.update(mediaId, {
      blob,
      size: blob.size,
    });
    if (count === 0) {
      throw createError('NOT_FOUND', `Media asset not found: ${mediaId}`);
    }
  },

  /** Remove a media asset by ID. */
  async remove(mediaId: string): Promise<void> {
    await db.mediaAssets.delete(mediaId);
  },

  /** Remove all media assets associated with a collection entry. */
  async removeByEntryId(entryId: string): Promise<void> {
    await db.mediaAssets.where('entryId').equals(entryId).delete();
  },

  /** Count total stored media assets. */
  async count(): Promise<number> {
    return db.mediaAssets.count();
  },

  /** Clear all media assets. */
  async clear(): Promise<void> {
    await db.mediaAssets.clear();
  },
};

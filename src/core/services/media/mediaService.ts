import { mediaRepository } from '../../storage/repositories/mediaRepository';
import type { MediaAsset } from '../../storage/db';
import { createError } from '../../utils/errors';

/** Cache of object URLs to avoid duplicate allocations. */
const urlCache = new Map<string, string>();

/**
 * Service for managing media blobs (card images, thumbnails).
 * Wraps the media repository with URL generation and lifecycle management.
 */
export const mediaService = {
  /**
   * Save an image blob and return its media ID.
   */
  async saveImage(params: {
    entryId?: string;
    blob: Blob;
    mimeType?: string;
    fileName?: string;
  }): Promise<string> {
    const mimeType = params.mimeType ?? (params.blob.type || 'image/png');
    return mediaRepository.add({
      entryId: params.entryId,
      type: 'image',
      mimeType,
      blob: params.blob,
      fileName: params.fileName,
    });
  },

  /**
   * Save a thumbnail blob and return its media ID.
   */
  async saveThumbnail(params: {
    entryId?: string;
    blob: Blob;
    mimeType?: string;
  }): Promise<string> {
    const mimeType = params.mimeType ?? (params.blob.type || 'image/png');
    return mediaRepository.add({
      entryId: params.entryId,
      type: 'thumbnail',
      mimeType,
      blob: params.blob,
    });
  },

  /**
   * Load a media asset by ID.
   */
  async load(mediaId: string): Promise<MediaAsset> {
    const asset = await mediaRepository.getById(mediaId);
    if (!asset) {
      throw createError('NOT_FOUND', `Media asset not found: ${mediaId}`);
    }
    return asset;
  },

  /**
   * Generate a temporary object URL for a stored media blob.
   * URLs are cached and reused within the session.
   * Call `revokeUrl` or `revokeAll` when URLs are no longer needed.
   */
  async getObjectUrl(mediaId: string): Promise<string> {
    const cached = urlCache.get(mediaId);
    if (cached) return cached;

    const asset = await this.load(mediaId);
    const url = URL.createObjectURL(asset.blob);
    urlCache.set(mediaId, url);
    return url;
  },

  /** Revoke a previously created object URL. */
  revokeUrl(mediaId: string): void {
    const url = urlCache.get(mediaId);
    if (url) {
      URL.revokeObjectURL(url);
      urlCache.delete(mediaId);
    }
  },

  /** Revoke all cached object URLs. Call on unmount or cleanup. */
  revokeAll(): void {
    for (const url of urlCache.values()) {
      URL.revokeObjectURL(url);
    }
    urlCache.clear();
  },

  /**
   * Delete a media asset and revoke its URL if cached.
   */
  async remove(mediaId: string): Promise<void> {
    this.revokeUrl(mediaId);
    await mediaRepository.remove(mediaId);
  },

  /**
   * Delete all media assets for a collection entry.
   */
  async removeByEntryId(entryId: string): Promise<void> {
    const assets = await mediaRepository.getByEntryId(entryId);
    for (const asset of assets) {
      this.revokeUrl(asset.mediaId);
    }
    await mediaRepository.removeByEntryId(entryId);
  },
};

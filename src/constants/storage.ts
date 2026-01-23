export const IMAGE_CONFIG = {
  MAX_SIZE: 2 * 1024 * 1024, // 2MB
  ACCEPTED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
  ACCEPTED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ACCEPTED_MIME: ['image/jpeg', 'image/png', 'image/webp'],
}

export const DOCUMENT_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_EXTENSIONS: ['.pdf', '.doc', '.docx'],
  ACCEPTED_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  ACCEPTED_MIME: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
}

export const VIDEO_CONFIG = {
  MAX_SIZE: 20 * 1024 * 1024, // 20MB
  ACCEPTED_EXTENSIONS: ['.mp4', '.mov', '.avi', '.webm'],
  ACCEPTED_TYPES: [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
  ],
  ACCEPTED_MIME: [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
  ],
}

export const STORAGE_VISIBILITY = {
  PUBLIC: 'public',
  PRIVATE: 'private',
}

export type StorageVisibility =
  (typeof STORAGE_VISIBILITY)[keyof typeof STORAGE_VISIBILITY]

export type FileConfig = {
  MAX_SIZE: number
  ACCEPTED_EXTENSIONS: readonly string[]
  ACCEPTED_TYPES: readonly string[]
  ACCEPTED_MIME: readonly string[]
}

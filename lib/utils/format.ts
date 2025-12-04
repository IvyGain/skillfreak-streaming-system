/**
 * Formats file size in bytes to human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., '1.5 MB', '500 KB')
 * @example
 * formatFileSize(1024) // '1.0 KB'
 * formatFileSize(1536000) // '1.5 MB'
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 0) {
    return '0 B';
  }

  if (bytes === 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // Ensure we don't exceed the units array
  const unitIndex = Math.min(i, units.length - 1);

  const size = bytes / Math.pow(k, unitIndex);

  // Format with 1 decimal place
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

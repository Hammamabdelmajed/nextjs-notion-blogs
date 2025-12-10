import { type ExtendedRecordMap } from 'notion-types'

// Cloudflare Workers–safe stub.
// Preview images (LQIP / blurDataURL) are disabled.
export async function getPreviewImageMap(
  _recordMap: ExtendedRecordMap
): Promise<Record<string, null>> {
  return {}
}
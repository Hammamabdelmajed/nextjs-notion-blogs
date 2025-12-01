import { type GetStaticProps } from 'next'

import { NotionPage } from '@/components/NotionPage'
import { domain, isDev } from '@/lib/config'
import { getSiteMap } from '@/lib/get-site-map'
import { resolveNotionPage } from '@/lib/resolve-notion-page'
import { type PageProps, type Params } from '@/lib/types'


/*

Difference Between getStaticProps in index.tsx and [pageId.tsx]

- When they run:
index.tsx runs at build and then revalidates on demand for the home page only.
[pageId].tsx runs for each path returned by getStaticPaths (pre-rendered) and also 
at request time for uncached paths because fallback: true is used (ISR with on-demand generation).

- Input source:
index.tsx: implicit page ID from config (rootNotionPageId).
[pageId].tsx: explicit page ID/slug from the URL path segment.


*/

export const getStaticProps: GetStaticProps<PageProps, Params> = async (
  context
) => {
  const rawPageId = context.params?.pageId as string

  try {
    const props = await resolveNotionPage(domain, rawPageId)

    // revalidating is for purging the data cache and refetching the new data - you use when you want the latest information to be displayed 
    return { props, revalidate: 10 }

  } catch (err) {
    console.error('page error', domain, rawPageId, err)

    // we don't want to publish the error version of this page, so
    // let next.js know explicitly that incremental SSG failed
    throw err
  }
}

export async function getStaticPaths() {
  if (isDev) {
    return {
      paths: [],
      fallback: true
    }
  }

  const siteMap = await getSiteMap()

  const staticPaths = {
    paths: Object.keys(siteMap.canonicalPageMap).map((pageId) => ({
      params: {
        pageId
      }
    })),
    // paths: [],
    fallback: true
  }

  return staticPaths
}

export default function NotionDomainDynamicPage(props: PageProps) {
  return <NotionPage {...props} />
}

import type { PageProps } from '@/lib/types'
import { NotionPage } from '@/components/NotionPage'
import { domain } from '@/lib/config'
import { resolveNotionPage } from '@/lib/resolve-notion-page'

/*

getStaticProps is predefined function in next.js that will pre-render the page 
using the props passed onto it.
- To learn how to use it you need to understand the Docs
- if you want to fetch Data head to that section and read what does it do
- Then start using it in your code

*/


/*

Difference Between getStaticProps in index.tsx and [pageId.tsx]

- When they run:
index.tsx runs at build and then revalidates on demand for the home page only.
[pageId].tsx runs for each path returned by getStaticPaths (pre-rendered) and also at request time for uncached paths because fallback: true is used (ISR with on-demand generation).

- Input source:
index.tsx: implicit page ID from config (rootNotionPageId).
[pageId].tsx: explicit page ID/slug from the URL path segment.


*/


export const getStaticProps = async () => {
  try {
    const props = await resolveNotionPage(domain)

    return { props , revalidate: 10 }
  } catch (err) {
    console.error('page error', domain, err)

    // we don't want to publish the error version of this page, so
    // let next.js know explicitly that incremental SSG failed
    throw err
  }
}

export default function NotionDomainPage(props: PageProps) {
  return <NotionPage {...props} />
}

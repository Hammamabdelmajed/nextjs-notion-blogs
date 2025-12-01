import type * as types from 'notion-types'
import { IoMoonSharp } from '@react-icons/all-files/io5/IoMoonSharp'
import { IoSunnyOutline } from '@react-icons/all-files/io5/IoSunnyOutline'
import cs from 'classnames'
import * as React from 'react'
import { Breadcrumbs, Header, Search, useNotionContext } from 'react-notion-x'

import { isSearchEnabled, navigationLinks, navigationStyle } from '@/lib/config'
import { useDarkMode } from '@/lib/use-dark-mode'

import styles from './styles.module.css'

function ToggleThemeButton() {
  const [hasMounted, setHasMounted] = React.useState(false)
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  // Ensure we only render the button after we've mounted, to avoid hydration mismatches
  // it is used only when component is dependent on client side state - but if it is also generated on server side
  // then no need for the hasMounted check

  /*

  Concerns behind Mounting:

  Rule of thumb

  If a component:
  - touches window/document, localStorage, matchMedia, or
  - reads time/locale that differs between server and client, or
  - conditionally renders different markup based on client state that isn’t known on the server, then use one of:
  - hasMounted guard,
  - suppressHydrationWarning on a specific node (if acceptable),
  - or a server-derived initial value (preferred).

  */

  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  const onToggleTheme = React.useCallback(() => {
    toggleDarkMode()
  }, [toggleDarkMode])

  return (
    <div
      className={cs('breadcrumb', 'button', !hasMounted && styles.hidden)}
      onClick={onToggleTheme}
    >
      {hasMounted && isDarkMode ? <IoMoonSharp /> : <IoSunnyOutline />}
    </div>
  )
}

export function NotionPageHeader({
  block
}: {
  block: types.CollectionViewPageBlock | types.PageBlock
}) {

  /*
  useNotionContext parameters:
  - components.PageLink are context-supplied link primitives that respect the renderer's internal routing and styling contract
  - mapPageUrl - maps the pageID of your notion page to the URL , keeping url Consistent across the app - to keep urls consistent across the app
  */


  const { components, mapPageUrl } = useNotionContext()

  if (navigationStyle === 'default') {
    return <Header block={block} />
  }


  /*
  Navigation links rendering:
   navigationLinks comes from your site config. Each link can be:
   - Internal (link.pageId present): renders components.PageLink with href={mapPageUrl(link.pageId)}. 
   - External (link.url present): renders components.Link with href={link.url}.
   - Items without a pageId or url are ignored.
    .filter(Boolean) removes nulls for clean rendering.
  */

  return (
    <header className='notion-header'>
      <div className='notion-nav-header'>
        <Breadcrumbs block={block} rootOnly={true} /> {/* BreadCrumbs is part of react-notion-lib shows the page
        trail useful when you have nested content */}

        <div className='notion-nav-header-rhs breadcrumbs'>
          {navigationLinks
            ?.map((link, index) => {
              if (!link?.pageId && !link?.url) {
                console.log("yes");
                return null
              }

              if (link.pageId) {
                return (
                  <components.PageLink
                    href={mapPageUrl(link.pageId)}
                    key={index}
                    className={cs(styles.navLink, 'breadcrumb', 'button')}
                  >
                    {link.title}
                  </components.PageLink>
                )
              } else {
                return (
                  <components.Link
                    href={link.url}
                    key={index}
                    className={cs(styles.navLink, 'breadcrumb', 'button')}
                  >
                    {link.title}
                  </components.Link>
                )
              }
            })
            .filter(Boolean)}

          <ToggleThemeButton />

{/* Search also is notion aware search comnponent tied into renderer's search integration when enabled  */}

          {isSearchEnabled && <Search block={block} title={null} />}

        </div>
      </div>
    </header>
  )
}

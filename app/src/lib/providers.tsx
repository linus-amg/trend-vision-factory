'use client'

import theme from '@/theme'
import { CacheProvider, Link } from '@chakra-ui/next-js'
import { ColorModeScript, cookieStorageManagerSSR, forwardRef, localStorageManager } from '@chakra-ui/react'
import { SaasProvider } from '@saas-ui/react'
import { Url } from 'next/dist/shared/lib/router/router'

const NextLink = forwardRef((props, ref) => (
  <Link
    ref={ref}
    href={props.href as Url}
    {...props}
  />
))

export function Providers({
  children,

  cookies,
}: {
  children: React.ReactNode
  cookies: string | null
}) {
  const colorModeManager = typeof cookies === 'string' ? cookieStorageManagerSSR(cookies) : localStorageManager

  return (
    <CacheProvider>
      <SaasProvider
        theme={theme}
        resetCSS
        linkComponent={NextLink}
        colorModeManager={colorModeManager}
      >
        <ColorModeScript
          type="cookie"
          initialColorMode={theme.config.initialColorMode}
        />
        {children}
      </SaasProvider>
    </CacheProvider>
  )
}

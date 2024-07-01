'use client'

import { TextVariants } from '@/theme/components/text'
import { Box, Text } from '@chakra-ui/react'
import { AppShell } from '@saas-ui/react'
import Link from 'next/link'

type DefaultLayotPropType = {
  children: React.ReactNode
}

const DefaultLayout = ({ children }: DefaultLayotPropType) => {
  return (
    <AppShell
      navbar={
        <Box
          as={Link}
          borderBottomWidth="1px"
          borderBottomColor="chakra-border-color"
          py="2"
          px="4"
          href="/"
        >
          <Text variant={TextVariants.Branding.Logo}>V\S\ONARY</Text>
        </Box>
      }
      height="$100vh"
    >
      {children}
    </AppShell>
  )
}

export default DefaultLayout

/* eslint-disable @typescript-eslint/no-misused-promises */
'use client'

import { handleFormChange } from '@/actions'
import SearchForm from '@/components/SearchForm'
import { Box, Flex } from '@chakra-ui/react'

export default function Home() {
  const handleUrlLoad = () => {}

  return (
    <Flex
      justify="center"
      align="center"
      width="full"
      height="$100vh"
    >
      <Box
        bg="rgb(240, 239, 234)"
        p={8}
        rounded="16px"
      >
        <SearchForm
          onChange={handleFormChange}
          onLoad={handleUrlLoad}
        />
      </Box>
    </Flex>
  )
}

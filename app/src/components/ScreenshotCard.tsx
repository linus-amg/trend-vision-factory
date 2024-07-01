'use client'

import { Screenshot } from '@/types/Screenshot'
import { Box, Card, CardFooter, Fade, Flex, HStack, Spinner, Text } from '@chakra-ui/react'
import { BeakerIcon, CameraIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface ScreenshotCardProps {
  screenshot: Screenshot

  onClick: (screenshot: Screenshot) => () => void
}

const ScreenshotCard = ({ screenshot, onClick }: ScreenshotCardProps) => {
  return (
    <Card
      shadow={0}
      bg="rgb(240, 239, 234)"
      p={4}
      maxH="340px"
      border={0}
      onClick={onClick(screenshot)}
      cursor={screenshot.status === 3 ? 'pointer' : 'default'}
    >
      {screenshot.status === 0 && (
        <Flex
          width="full"
          justify="center"
          align="center"
          height="256px"
          rounded="md"
          bg="rgb(230, 229, 224)"
        >
          <Spinner />
        </Flex>
      )}

      {screenshot.status === 1 && (
        <Flex
          width="full"
          justify="center"
          align="center"
          height="256px"
          rounded="md"
          bg="rgb(230, 229, 224)"
        >
          <CameraIcon
            color="gray.500"
            width="32px"
          />
        </Flex>
      )}

      {screenshot.status >= 2 && (
        <Fade in>
          <Box
            width="auto"
            height="256px"
            rounded="sm"
            backgroundImage={screenshot.file_path}
            backgroundSize="cover"
          />
        </Fade>
      )}
      <CardFooter
        p={2}
        pt={6}
        h="52px"
      >
        <HStack
          w="full"
          justify="space-between"
        >
          <Text
            noOfLines={1}
            title={screenshot.title}
          >
            {screenshot.analysis ? screenshot.analysis.title : screenshot.title}
          </Text>
          {screenshot.status === 2 && (
            <Spinner
              color="gray.500"
              width="16px"
              height="16px"
            />
          )}

          {screenshot.status === 3 && (
            <Box
              as={BeakerIcon}
              color="gray.600"
              width="16px"
            />
          )}

          {screenshot.status === 4 && (
            <Box
              as={XMarkIcon}
              color="gray.600"
              width="16px"
            />
          )}
        </HStack>
      </CardFooter>
    </Card>
  )
}

export default ScreenshotCard

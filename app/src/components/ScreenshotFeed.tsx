'use client'

import { useCallback, useLayoutEffect, useRef, useState } from 'react'

import { Screenshot } from '@/types/Screenshot'
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Modal } from '@saas-ui/react'
import Pusher from 'pusher-js'
import ScreenshotCard from './ScreenshotCard'
import Vision from './Vision'

// Pusher.logToConsole = true

const Loading = () => (
  <Box
    bg="rgb(240, 239, 234)"
    p={8}
    rounded="16px"
  >
    <Spinner color="gray.500" />
  </Box>
)

interface ScreenshotFeedProps {
  job: {
    id: string
    url: string
    status: number
    vision: string
    created_at: string
  }
  incomingScreenshots: Screenshot[]
}

const ScreenshotFeed = ({ job, incomingScreenshots }: ScreenshotFeedProps) => {
  const pusherRef = useRef<Pusher | null>(null)
  const [screenshots, setScreenshots] = useState<Screenshot[]>(incomingScreenshots)
  const [activeItem, setActiveItem] = useState<Screenshot | null>(null)

  const updateScreenshots = useCallback(
    (data: Screenshot) => {
      console.log('incoming data', data)
      const screenshot = screenshots.find((screenshot) => screenshot.id === data.id)

      if (screenshot) {
        setScreenshots((screenshots) =>
          screenshots.map((screenshot) => (screenshot.id === data.id ? { ...screenshot, ...data } : screenshot))
        )
      }

      if (!screenshot) {
        setScreenshots((screenshots) => [...screenshots, data])
      }
    },
    [screenshots]
  )

  useLayoutEffect(() => {
    pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY as string, {
      cluster: 'us3',
    })

    const channel = pusherRef.current.subscribe(job.id)

    channel.bind('screenshot', updateScreenshots)

    return () => {
      if (pusherRef.current) {
        channel.unbind('screenshot')

        pusherRef.current.unsubscribe(job.id)
        pusherRef.current = null
      }
    }
  }, [job, updateScreenshots])

  const handleVisionClick = (screenshot: Screenshot) => () => {
    setActiveItem(screenshot)
  }

  if (screenshots.length === 0) {
    return (
      <VStack spacing={4}>
        <Loading />
        <Text color="gray.500">Fetching Screenshots</Text>
      </VStack>
    )
  } else {
    return (
      <>
        <Modal
          size="full"
          isOpen={!!activeItem}
          onClose={() => {
            setActiveItem(null)
          }}
        >
          <ModalOverlay />
          {activeItem && (
            <ModalContent>
              <ModalHeader>{activeItem.title}</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Vision activeItem={activeItem} />
              </ModalBody>
            </ModalContent>
          )}
        </Modal>

        <VStack
          w="full"
          align="start"
        >
          <Breadcrumb
            spacing={1}
            separator=""
            px={4}
            mt={6}
          >
            <BreadcrumbItem color="gray.500">
              <BreadcrumbLink href="/">&laquo; back </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem
              isCurrentPage
              color="gray.500"
            >
              <BreadcrumbLink href={`jobs/${job.id}`}>{job.url}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <SimpleGrid
            w="full"
            overflowY="auto"
            h="calc(100vh - 94px)"
            columns={3}
            spacing={8}
            p={4}
          >
            {screenshots.map((screenshot, index) => (
              <ScreenshotCard
                key={index}
                screenshot={screenshot}
                onClick={handleVisionClick}
              />
            ))}
          </SimpleGrid>
        </VStack>
      </>
    )
  }
}

export default ScreenshotFeed

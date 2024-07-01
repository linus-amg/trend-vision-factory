import { Screenshot } from '@/types/Screenshot'
import { Box, Divider, FormLabel, GridItem, HStack, Img, List, ListItem, SimpleGrid, Text } from '@chakra-ui/react'
import { useMemo } from 'react'

interface VisionProps {
  activeItem: Screenshot
}

function Vision({ activeItem }: VisionProps) {
  const todos = useMemo(() => {
    return activeItem.analysis?.todos
  }, [activeItem])

  const todosList = todos
    ? todos.map((todo: string, index: number) => {
        return (
          <ListItem
            key={index}
            bg="gray.50"
            p={8}
            rounded="md"
            color="gray.600"
          >
            {todo}
          </ListItem>
        )
      })
    : null

  return (
    <HStack
      align="start"
      spacing={8}
      pb={4}
    >
      <Box
        overflow="auto"
        rounded="sm"
        h="auto"
        w="50vw"
      >
        <Img
          src={activeItem.file_path}
          alt={activeItem.file_path}
          width="100%"
        />
      </Box>
      <SimpleGrid
        columns={2}
        spacing={8}
        w="full"
      >
        <GridItem>
          <FormLabel>Title</FormLabel>
          <Text color="gray.600">{activeItem.analysis?.title}</Text>
        </GridItem>
        <GridItem>
          <FormLabel>Keywords</FormLabel>
          <Text color="gray.600">{activeItem.analysis?.keywords.join(', ')}</Text>
        </GridItem>
        <GridItem>
          <FormLabel>Summary</FormLabel>
          <Text color="gray.600">{activeItem.analysis?.summary}</Text>
        </GridItem>
        <GridItem>
          <FormLabel>Description</FormLabel>
          <Text color="gray.600">{activeItem.analysis?.description}</Text>
        </GridItem>
        <GridItem
          colSpan={2}
          bg="rgb(240, 239, 234)"
          p={8}
          rounded="md"
        >
          <FormLabel>Vision</FormLabel>
          <Text
            color="gray.600"
            whiteSpace="pre-wrap"
          >
            {activeItem.analysis?.vision}
          </Text>
        </GridItem>
        <GridItem colSpan={2}>
          <FormLabel>Recommended changes to achieve the vision</FormLabel>
          <Divider mb={4} />
          <List spacing={3}>{todosList}</List>
        </GridItem>
      </SimpleGrid>
    </HStack>
  )
}

export default Vision

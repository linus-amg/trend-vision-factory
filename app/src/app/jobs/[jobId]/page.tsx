import ScreenshotFeed from '@/components/ScreenshotFeed'
import { Screenshot } from '@/types/Screenshot'
import { Box, Flex } from '@chakra-ui/react'
import { sql } from '@vercel/postgres'

interface HomeProps {
  params: {
    jobId: string
  }
}

interface Job {
  id: string
  url: string
  status: number
  vision: string
  created_at: string
}

export default async function Home({ params }: HomeProps) {
  const { jobId } = params

  const { rows: jobs } = await sql`SELECT * FROM jobs WHERE id = ${jobId}`
  const { rows: screenshots } = await sql`SELECT * FROM screenshots WHERE job_id = ${jobId}`

  const [job] = jobs

  let content

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!job) {
    content = (
      <Box
        bg="rgb(240, 239, 234)"
        p={8}
        rounded="16px"
      >
        <p>Job not found</p>
      </Box>
    )
  } else {
    content = (
      <ScreenshotFeed
        job={job as Job}
        incomingScreenshots={screenshots as Screenshot[]}
      />
    )
  }

  return (
    <Flex
      justify="center"
      align="center"
      width="full"
      height="$100vh"
    >
      {content}
    </Flex>
  )
}

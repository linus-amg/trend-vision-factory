import { sql } from '@vercel/postgres'
import recursiveScrape from './recursiveScrape'
import { JOBTYPE_YOUTUBE } from './utils/getJobType'
import watchYoutubeVideoAndScrape from './watchYoutubeVideoAndScrape'

const scrapeUrl = async (jobId: string, url: string, type: string) => {
  if (type === JOBTYPE_YOUTUBE) {
    await watchYoutubeVideoAndScrape(jobId, url)
  } else {
    await recursiveScrape(jobId, url, url, 0, 1)
  }

  await sql`UPDATE jobs SET status = 1 WHERE id = ${jobId}`
}

export default scrapeUrl

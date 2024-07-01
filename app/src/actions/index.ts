'use server'

import { sql } from '@vercel/postgres'

import { v4 as uuidv4 } from 'uuid'

import processUrlJob from '@/api/jobs/processUrlJob'
import getJobType, { JOBTYPE_UPLOAD } from '@/api/jobs/utils/getJobType'
import { Job } from '@/types/Job'
import { redirect } from 'next/navigation'
import processFileJob from '@/api/jobs/processFileJob'
import { ImageFile } from '@/types/ImageFile'

// eslint-disable-next-line @typescript-eslint/require-await
export async function handleFormChange(value: string | ImageFile[]): Promise<void> {
  const jobId: string = uuidv4()

  try {
    const type = getJobType(value as string | string[])

    if (type === JOBTYPE_UPLOAD) {
      const job: Job = {
        id: jobId,
        url: 'none',
        status: 0,
        type: type,
        createdAt: new Date().toISOString(),
      }

      await sql`INSERT INTO jobs (id, url, type, status) VALUES (${job.id}, ${job.url}, ${job.type}, ${job.status})`
      processFileJob(jobId, value as unknown as ImageFile[])
        .then(() => {
          console.log('Processing file job complete!')
        })
        .catch((error: unknown) => {
          console.error('Processing file job failed!')
          console.error(error)
        })
    } else {
      const url = value as string

      const job: Job = {
        id: jobId,
        url: url,
        status: 0,
        type: type,
        createdAt: new Date().toISOString(),
      }

      await sql`INSERT INTO jobs (id, url, type, status) VALUES (${job.id}, ${job.url}, ${job.type}, ${job.status})`

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      processUrlJob(jobId, url, type) // async
    }
  } catch (error) {
    console.error(error)
    return redirect('/not-found')
  }

  return redirect(`/jobs/${jobId}`)
}

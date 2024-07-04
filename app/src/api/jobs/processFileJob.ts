import pusher from '@/lib/pusher'
import { ImageFile } from '@/types/ImageFile'
import { put } from '@vercel/blob'
import { sql } from '@vercel/postgres'
import { v4 } from 'uuid'
import describe from './describe'
import sharp from 'sharp'

const processFileJob = async (jobId: string, imageFiles: ImageFile[]) => {
  for (const imageFile of imageFiles) {
    const screenshotId = v4()

    // create initial screenshot
    await sql`INSERT INTO screenshots (id, job_id, title, status) VALUES (${screenshotId}, ${jobId}, ${imageFile.fileName}, 0)`
    await pusher.trigger(jobId, 'screenshot', {
      id: screenshotId,
      status: 0,
      title: imageFile.fileName,
    })

    // upload image to blob
    const imageBase64Str = imageFile.data.replace(/^.+,/, '')
    const buf = Buffer.from(imageBase64Str, 'base64')

    let pngBuffer

    if (imageFile.type === 'image/png') {
      pngBuffer = buf
    } else {
      pngBuffer = await sharp(buf).toFormat('png').toBuffer()
    }

    const blob = await put(`${jobId}/${screenshotId}`, pngBuffer, { access: 'public' })

    // update screenshot with image url
    await sql`UPDATE screenshots SET status = 2, file_path = ${blob.url} WHERE id = ${screenshotId} AND job_id = ${jobId}`
    await pusher.trigger(jobId, 'screenshot', {
      id: screenshotId,
      file_path: blob.url,
      status: 2,
    })

    // describe image
    describe(jobId, screenshotId, pngBuffer)
      .then(() => {
        console.log(`Screenshot described: ${imageFile.fileName}`)
      })
      .catch((error: unknown) => {
        console.error(error)
      })
  }
}

export default processFileJob

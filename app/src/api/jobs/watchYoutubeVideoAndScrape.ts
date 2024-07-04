import pusher from '@/lib/pusher'
import { sql } from '@vercel/postgres'
import puppeteer, { Page } from 'puppeteer'
import { v4 } from 'uuid'
import describe from './describe'
import { put } from '@vercel/blob'

async function watchYoutubeVideoAndScrape(jobId: string, videoUrl: string) {
  const browser = await puppeteer.launch({ headless: true })

  const page = await browser.newPage()

  try {
    console.log(`Navigating to ${videoUrl}`)
    await page.setViewport({ width: 1280, height: 720 })
    await page.goto(videoUrl, { waitUntil: 'networkidle2' })

    console.log('Handling potential popups...')
    await handlePopups(page)

    console.log('Waiting for video player to load...')
    await page.waitForSelector('video.html5-main-video', { timeout: 30000 })

    console.log('Waiting for any ads to finish...')
    await waitForAdsToFinish(page)

    console.log('Switching to theater mode...')
    await switchToTheaterMode(page)

    console.log('Attempting to start the video...')
    await attemptToStartVideo(page)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const duration = await getVideoDuration(page)
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    console.log(`Video duration: ${duration.toString()} seconds`)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const screenshotTimes = calculateScreenshotTimes(duration)
    console.log('Screenshot times:', screenshotTimes)

    for (const time of screenshotTimes) {
      console.log(`Seeking to ${time.toString()} seconds...`)

      const screenshotId = v4()

      await sql`INSERT INTO screenshots (id, job_id, title, status) VALUES (${screenshotId}, ${jobId}, ${time.toString()}, 0)`

      await pusher.trigger(jobId, 'screenshot', {
        id: screenshotId,
        status: 1,
        title: time.toString(),
      })

      await seekToTime(page, time)

      console.log(`Taking screenshot at ${time.toString()} seconds...`)

      const screenshotData = await page.screenshot()

      const blob = await put(`${jobId}/${screenshotId}.png`, screenshotData, {
        access: 'public',
      })

      await sql`UPDATE screenshots SET status = 2, file_path = ${blob.url} WHERE id = ${screenshotId} AND job_id = ${jobId}`

      await pusher.trigger(jobId, 'screenshot', {
        id: screenshotId,
        file_path: blob.url,
        status: 2,
        title: time.toString(),
      })

      describe(jobId, screenshotId, screenshotData)
        .then(() => {
          console.log(`Screenshot described: ${time.toString()}`)
        })
        .catch((error: unknown) => {
          console.error(error)
        })
    }

    console.log('Finished taking screenshots.')
  } catch (error) {
    console.error('An error occurred:', error)
  } finally {
    await browser.close()
  }
}

async function switchToTheaterMode(page: Page) {
  try {
    await page.waitForSelector('.ytp-fullscreen-button', { timeout: 5000 })
    await page.click('.ytp-fullscreen-button')
    console.log('Switched to theater mode')
  } catch (error: unknown) {
    console.log('Could not switch to theater mode:', error)
  }
}

async function handlePopups(page: Page) {
  try {
    // Wait for and click the "Reject the use of cookies" button if it appears
    await page.waitForSelector('[aria-label="Reject the use of cookies and other data for the purposes described"]', {
      timeout: 5000,
    })
    await page.click('[aria-label="Reject the use of cookies and other data for the purposes described"]')
    console.log('Clicked "Reject the use of cookies" button')
  } catch (error) {
    console.log('No "Reject all" button found or other error occurred')
  }

  try {
    // Wait for and click the "Reject all" button if it appears
    await page.waitForSelector('[aria-label="Reject all"]', {
      timeout: 5000,
    })
    await page.click('[aria-label="Reject all"]')
    console.log('Clicked "Reject all" button')
  } catch (error) {
    console.log('No "Reject all" button found or other error occurred')
  }

  try {
    // Check for and close the "Sign in" dialog if it appears
    await page.waitForSelector('yt-upsell-dialog-renderer', { timeout: 5000 })
    await page.evaluate(() => {
      const closeButton = document.querySelector('yt-upsell-dialog-renderer #dismiss-button')
      // @ts-expect-error closeButton is not null
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      if (closeButton) closeButton.click()
    })
    console.log('Closed "Sign in" dialog')
  } catch (error) {
    console.log('No "Sign in" dialog found or other error occurred')
  }
}

async function waitForAdsToFinish(page: Page) {
  await page.waitForFunction(
    () => {
      const skipAds = document.querySelector('.ytp-skip-ad-button')
      if (skipAds) {
        // @ts-expect-error skipAds is not null
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        skipAds.click()
      }

      const adOverlay = document.querySelector('.ytp-ad-player-overlay')
      const adText = document.querySelector('.ytp-ad-text')
      return !adOverlay && !adText
    },
    { timeout: 120000, polling: 1000 }
  ) // Wait up to 2 minutes, checking every second
  console.log('Ads finished or no ads detected')
}

async function attemptToStartVideo(page: Page) {
  try {
    await page.click('.ytp-play-button')
    console.log('Clicked play button')
  } catch (error) {
    console.log('Could not click play button, video might be autoplaying or there might be an ad')
  }

  await page.waitForFunction(
    () => {
      const video = document.querySelector('video.html5-main-video')

      const chromeBottom = document.querySelector('.ytp-chrome-bottom')
      if (chromeBottom) {
        chromeBottom.remove()
      }

      // @ts-expect-error video is not null
      return video && video.currentTime > 0
    },
    { timeout: 30000 }
  )

  console.log('Video started playing')
}

async function getVideoDuration(page: Page) {
  return page.evaluate(() => {
    const video = document.querySelector('video.html5-main-video')

    // @ts-expect-error video is not null
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return video.duration
  })
}

function calculateScreenshotTimes(duration: number): number[] {
  const maxScreenshots = 9
  const startTime = 5
  const endTime = duration - 5

  if (endTime <= startTime) {
    return [Math.floor(duration / 2)] // For very short videos, take one screenshot in the middle
  }

  const interval = (endTime - startTime) / (maxScreenshots - 1)
  const times = [startTime]

  for (let i = 1; i < maxScreenshots - 1; i++) {
    times.push(Math.round(startTime + interval * i))
  }

  times.push(endTime)

  // Remove any duplicate times (can happen with short videos)
  // @ts-expect-error times is not null
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return [...new Set(times)].sort((a, b) => a - b)
}

async function seekToTime(page: Page, time: number) {
  await page.evaluate((targetTime) => {
    return new Promise((resolve) => {
      const video = document.querySelector('video.html5-main-video')
      const seekListener = () => {
        // @ts-expect-error video is not null
        video.removeEventListener('seeked', seekListener)
        setTimeout(resolve, 1000)
      }

      // @ts-expect-error video is not null
      video.addEventListener('seeked', seekListener)

      // @ts-expect-error video is not null
      video.currentTime = targetTime
    })
  }, time)
}

export default watchYoutubeVideoAndScrape

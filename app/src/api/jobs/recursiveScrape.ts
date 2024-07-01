import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

import pusher from '@/lib/pusher'
import { put } from '@vercel/blob'
import { sql } from '@vercel/postgres'
import { v4 } from 'uuid'
import describe from './describe'

function getDomain(urlString: string) {
  const parsedUrl = new URL(urlString)
  return parsedUrl.hostname
}

const LOCAL_CHROMIUM_PATH =
  '/tmp/localChromium/chromium/mac_arm-1322085/chrome-mac/Chromium.app/Contents/MacOS/Chromium'

chromium.setHeadlessMode = true
chromium.setGraphicsMode = false

const recursiveScrape = async (
  jobId: string,
  baseUrl: string,
  currentUrl: string,
  depth: number = 0,
  maxDepth: number = 3,
  visited = new Set(),
  screenshots = new Set()
) => {
  const baseDomain = getDomain(baseUrl)
  const currentDomain = getDomain(currentUrl)

  if (screenshots.size === 9) {
    return screenshots
  }

  if (depth > maxDepth || visited.has(currentUrl) || baseDomain !== currentDomain) {
    return screenshots
  }

  visited.add(currentUrl)

  try {
    // get path from url
    const pathName = new URL(currentUrl).pathname
    const screenshotId = v4()

    await sql`INSERT INTO screenshots (id, job_id, title, status) VALUES (${screenshotId}, ${jobId}, ${pathName}, 0)`

    await pusher.trigger(jobId, 'screenshot:prepare', {
      id: screenshotId,
      status: 0,
      title: pathName,
    })

    const puppeteerOptions = {
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: process.env.NODE_ENV === 'development' ? LOCAL_CHROMIUM_PATH : await chromium.executablePath(),
      headless: chromium.headless,
    }

    const browser = await puppeteer.launch(puppeteerOptions)

    const page = await browser.newPage()
    await page.goto(currentUrl, { waitUntil: 'networkidle2' })

    // Extract links from the page
    const links = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a'))
        .map((a) => a.href)
        .filter((href) => href.startsWith('http'))
    )

    await sql`UPDATE screenshots SET status = 1 WHERE id = ${screenshotId} AND job_id = ${jobId}`
    await pusher.trigger(jobId, 'screenshot:snap', {
      id: screenshotId,
      status: 1,
    })

    await page.setViewport({ width: 1024, height: 768, deviceScaleFactor: 0.5 })
    const screenshotData = await page.screenshot({ fullPage: true })

    const blob = await put(`${jobId}/${screenshotId}.png`, screenshotData, {
      access: 'public',
    })

    await browser.close()

    // Recursively scrape linked pages within the same domain
    for (const link of links) {
      if (getDomain(link) === baseDomain) {
        await recursiveScrape(jobId, baseUrl, link, depth + 1, maxDepth, visited, screenshots)
          .then(() => {})
          .catch((error: unknown) => {
            console.error(error)
          })
      }
    }

    await sql`UPDATE screenshots SET status = 2 WHERE id = ${screenshotId} AND job_id = ${jobId}`
    await pusher.trigger(jobId, 'screenshot:added', { file_path: blob.url, id: screenshotId, status: 2 })

    screenshots.add(pathName)

    describe(jobId, screenshotId, screenshotData)
      .then(() => {
        console.log(`Screenshot described: ${screenshotId}`)
      })
      .catch((error: unknown) => {
        console.error(error)
      })
  } catch (error) {
    console.error(`Error scraping ${currentUrl}:`, error)
  }

  return screenshots
}

export default recursiveScrape

import scrapeUrl from './scrapeUrl'

const processUrlJob = (jobId: string, url: string, type: string) => {
  scrapeUrl(jobId, url, type)
    .then(() => {
      console.log('Scraping complete!')
    })
    .catch((err: unknown) => {
      console.error('Scraping failed!')
      console.error(err)
    })
}

export default processUrlJob

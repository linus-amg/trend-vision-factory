import isYoutubeVideoUrl from './isYoutubeVideoUrl'

export const JOBTYPE_YOUTUBE = 'youtube'
export const JOBTYPE_WEBSITE = 'website'
export const JOBTYPE_UPLOAD = 'upload'

const getJobType = (url: string | string[]): string => {
  if (Array.isArray(url)) {
    return JOBTYPE_UPLOAD
  }

  if (isYoutubeVideoUrl(url)) {
    return JOBTYPE_YOUTUBE
  }

  return JOBTYPE_WEBSITE
}

export default getJobType

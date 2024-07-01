function isYoutubeVideoUrl(url: string) {
  // Regular expression patterns for YouTube video URLs
  const patterns = [
    /^https?:\/\/(?:www\.)?youtube\.com\/watch\?(?=.*v=\w+)(?:\S+)?$/,
    /^https?:\/\/(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
    /^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]+)/,
    /^https?:\/\/(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]+)/,
    /^https?:\/\/(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/,
  ]

  // Test the URL against each pattern
  return patterns.some((pattern) => pattern.test(url))
}

export default isYoutubeVideoUrl

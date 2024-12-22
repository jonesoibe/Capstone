const calculateReadingTime = (text) => {
  // Average reading speed: 200 words per minute
  const wordsPerMinute = 200;

  // Count the number of words in the text
  const wordCount = text.split(/\s+/).length;

  // Calculate reading time in minutes
  const readingTime = Math.ceil(wordCount / wordsPerMinute);

  return `${readingTime} min`;
};

module.exports = calculateReadingTime;

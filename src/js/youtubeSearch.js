import { YOUTUBE_API_KEY } from "./config.js";

function formatDuration(isoDuration) {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const hours = parseInt(match[1] || 0, 10);
  const minutes = parseInt(match[2] || 0, 10);
  const seconds = parseInt(match[3] || 0, 10);

  let result = "";
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m`;
  if (hours === 0 && minutes === 0) result = `${seconds}s`;

  return result.trim();
}

function getDurationInMinutes(isoDuration) {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const hours = parseInt(match[1] || 0, 10);
  const minutes = parseInt(match[2] || 0, 10);
  const seconds = parseInt(match[3] || 0, 10);
  return hours * 60 + minutes + seconds / 60;
}

export async function searchYouTube(artist, maxResults = 10) {
  const query = encodeURIComponent(`${artist} drum and bass mix`);
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&part=snippet&type=video&maxResults=${maxResults}&q=${query}&order=date`;

  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();

  if (!searchData.items || searchData.items.length === 0) return [];

  const filteredByTitle = searchData.items.filter((item) =>
    item.snippet.title.toLowerCase().includes(artist.toLowerCase())
  );

  const videoIds = filteredByTitle.map((item) => item.id.videoId).join(",");

  // Get durations
  const videosUrl = `https://www.googleapis.com/youtube/v3/videos?key=${YOUTUBE_API_KEY}&part=contentDetails,snippet&id=${videoIds}`;
  const videosRes = await fetch(videosUrl);
  const videosData = await videosRes.json();

  const filteredByDuration = videosData.items.filter((video) => {
    const minutes = getDurationInMinutes(video.contentDetails.duration);
    return minutes >= 20;
  });

  return filteredByDuration.map((item) => ({
    title: item.snippet.title,
    videoId: item.id,
    url: `https://www.youtube.com/watch?v=${item.id}`,
    publishedAt: new Date(item.snippet.publishedAt),
    duration: formatDuration(item.contentDetails.duration),
  }));
}

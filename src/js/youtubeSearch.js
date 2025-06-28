// import dayjs from "dayjs";
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

// Incoporates duration filtering so we know its a mix
export async function searchYouTubeMixes(
  artist,
  maxResults = 40,
  publishedAfter = null
) {
  let query = encodeURIComponent(
    `"${artist}" (#drumandbass OR #dnb OR #liquiddnb)`
  );

  if (!publishedAfter) {
    // Defaults to 90 days ago
    publishedAfter = dayjs().subtract(90, "day").toISOString();
  }

  // Don't include publishedAfter inside the encoded query!
  let searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&part=snippet&type=video&maxResults=${maxResults}&q=${query}&order=date&publishedAfter=${publishedAfter}`;

  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();

  if (!searchData.items || searchData.items.length === 0) {
    console.warn("No search results returned from YouTube.");
    return [];
  }

  console.log("📥 Raw Search Results:", searchData.items);

  const titleRegex = new RegExp(`\\b${artist}\\b`, "i");

  const filteredByTitle = [];
  const excludedByTitle = [];

  for (const item of searchData.items) {
    const title = item.snippet.title;
    if (titleRegex.test(title)) {
      filteredByTitle.push(item);
    } else {
      excludedByTitle.push(title);
    }
  }

  console.log("❌ Excluded by title:", excludedByTitle);
  console.log(
    "✅ Passed title filter:",
    filteredByTitle.map((v) => v.snippet.title)
  );

  const videoIds = filteredByTitle.map((item) => item.id.videoId).join(",");
  if (!videoIds) {
    console.warn("No video IDs to look up.");
    return [];
  }

  const videosUrl = `https://www.googleapis.com/youtube/v3/videos?key=${YOUTUBE_API_KEY}&part=contentDetails,snippet&id=${videoIds}`;
  const videosRes = await fetch(videosUrl);
  const videosData = await videosRes.json();

  const filteredByDuration = [];
  const excludedByDuration = [];

  for (const video of videosData.items) {
    const title = video.snippet?.title;
    const durationISO = video.contentDetails?.duration;

    if (!durationISO) {
      excludedByDuration.push(`${title || "Untitled"} (no duration)`);
      continue;
    }

    const minutes = getDurationInMinutes(durationISO);
    if (minutes >= 20) {
      filteredByDuration.push(video);
    } else {
      excludedByDuration.push(`${title} (${formatDuration(durationISO)})`);
    }
  }

  console.log("❌ Excluded by duration (< 20min):", excludedByDuration);
  console.log(
    "✅ Final mix list:",
    filteredByDuration.map((v) => v.snippet.title)
  );

  return filteredByDuration.map((item) => ({
    title: item.snippet.title,
    videoId: item.id,
    url: `https://www.youtube.com/watch?v=${item.id}`,
    publishedAt: new Date(item.snippet.publishedAt),
    duration: formatDuration(item.contentDetails.duration),
    thumbnail: item.snippet.thumbnails?.medium?.url || "", // fallback-safe
  }));
}

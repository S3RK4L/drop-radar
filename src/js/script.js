import { searchYouTubeMixes } from "./youtubeSearch.js";

document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.getElementById("searchForm");
  const artistInput = document.getElementById("artistInput");
  const resultsDiv = document.getElementById("results");

  searchForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // prevent page reload

    const artist = artistInput.value.trim();
    if (!artist) return;

    resultsDiv.innerHTML = "🔍 Searching...";

    const results = await searchYouTubeMixes(artist);

    if (results.length === 0) {
      resultsDiv.textContent = "No matching videos found.";
      return;
    }

    resultsDiv.innerHTML = "";

    for (const video of results) {
      const formattedDate = video.publishedAt.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      const div = document.createElement("div");
      div.innerHTML = `
        <div style="margin-bottom: 1em;">
          <a href="${video.url}" target="_blank">
            <img src="${video.thumbnail}" alt="Thumbnail for ${video.title}" style="width: 100%; max-width: 360px; border-radius: 8px;" />
          </a>
          <p>
            <a href="${video.url}" target="_blank">${video.title}</a><br />
            <small>
              📅 Published: ${formattedDate} <br />
              ⏱️ Duration: ${video.duration}
            </small>
          </p>
        </div>
      `;

      resultsDiv.appendChild(div);
    }
  });
});

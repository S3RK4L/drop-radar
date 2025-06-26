import { searchYouTube } from "./youtubeSearch.js";

document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("searchBtn");
  const resultsDiv = document.getElementById("results");

  const artist = "Break";

  searchBtn.addEventListener("click", async () => {
    resultsDiv.innerHTML = "🔍 Searching...";

    const results = await searchYouTube(artist);

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
    <p>
      <a href="${video.url}" target="_blank">${video.title}</a><br />
      <small>
        📅 Published: ${formattedDate} <br />
        ⏱️ Duration: ${video.duration}
      </small>
    </p>
  `;
      resultsDiv.appendChild(div);
    }
  });
});

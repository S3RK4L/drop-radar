document.addEventListener('DOMContentLoaded', function () {
  const searchBtn = document.getElementById('searchBtn');
  const resultsDiv = document.getElementById('results');

  searchBtn.addEventListener('click', function () {
    resultsDiv.innerHTML = ''; // Clear old results

    const message = document.createElement('p');
    message.textContent = '🔍 Searching for new DnB videos... (coming soon)';
    resultsDiv.appendChild(message);
  });
});

// DOM elements
const searchBox = document.getElementById('search-box');
const resultsTable = document.getElementById('results-table').querySelector('tbody');
const paginationInfo = document.getElementById('pagination-info');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const resultsLimitInput = document.getElementById('results-limit');

let currentPage = 1;
let totalResults = 0;
let limit = 5; // Default to 5 results per page

// Event listener for search input
searchBox.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    currentPage = 1; // Reset to first page
    fetchResults(searchBox.value);
  }
});

// Fetch data from your backend API
async function fetchResults(query) {
  const url = `http://localhost:3000/api/cities?namePrefix=${query}&limit=${limit}&offset=${(currentPage - 1) * limit}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
    if (data.metadata && data.metadata.totalCount !== undefined) {
      totalResults = data.metadata.totalCount;
      displayResults(data.data);
      updatePagination();
    } else {
      console.error('Metadata or totalCount is undefined:', data);
      resultsTable.innerHTML = `<tr><td colspan="3">Error: Invalid data structure returned.</td></tr>`;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    resultsTable.innerHTML = `<tr><td colspan="3">Error fetching data: ${error.message}</td></tr>`;
  }
}

// Display results in table
function displayResults(results) {
  resultsTable.innerHTML = ''; // Clear previous results
  
  if (results.length === 0) {
    resultsTable.innerHTML = `<tr><td colspan="3">No result found</td></tr>`;
    return;
  }

  results.forEach((result, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1 + (currentPage - 1) * limit}</td>
      <td>${result.city}</td>
      <td><img src="https://flagsapi.com/${result.countryCode}/flat/32.png" alt="${result.country}" /> ${result.country}</td>
    `;
    resultsTable.appendChild(row);
  });
}

// Pagination
prevPageBtn.addEventListener('click', function () {
  if (currentPage > 1) {
    currentPage--;
    fetchResults(searchBox.value);
  }
});

nextPageBtn.addEventListener('click', function () {
  if ((currentPage * limit) < totalResults) {
    currentPage++;
    fetchResults(searchBox.value);
  }
});

resultsLimitInput.addEventListener('change', function () {
  limit = Math.min(Math.max(1, resultsLimitInput.value), 10); // Ensure value is between 1 and 10
  fetchResults(searchBox.value);
});

function updatePagination() {
  paginationInfo.innerText = `Page ${currentPage}`;
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = (currentPage * limit) >= totalResults;
}

// Optional: Initial fetch for default or empty input
fetchResults(''); // Fetch results on load with an empty query to get a list of cities

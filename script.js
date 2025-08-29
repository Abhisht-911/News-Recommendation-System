// Simple debounce function to delay execution
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}

// API configurations
const NEWS_API_KEYS = [
    '05d99e5db00d46f9b344f43b85a58f59', // News API
    'a6a633b5fc8a5bac5406638c88699246', // Mediastack API
    'b0a36ecabae141029714540850eb4b4a'  // Additional API key
];
const BASE_MEDIASTACK_URL = 'http://api.mediastack.com/v1/news';

const categoryFilter = document.getElementById('categoryFilter');
const newsList = document.getElementById('newsList');
const loader = document.getElementById('loader');
const prevPageButton = document.getElementById('prevPage');
const nextPageButton = document.getElementById('nextPage');

const PAGE_SIZE = 10; // Number of articles per page
let currentPage = 1; // Tracks the current page

// Fetch news from Mediastack API
async function fetchNewsMediastack(category = '', page = 1) {
    showLoader();

    const offset = (page - 1) * PAGE_SIZE; // Calculate offset for pagination
    let url = `${BASE_MEDIASTACK_URL}?access_key=${NEWS_API_KEYS[1]}&limit=${PAGE_SIZE}&offset=${offset}`;

    if (category && category !== 'all') {
        url += `&categories=${category}`;
    }

    console.log('Requesting URL (Mediastack):', url);

    try {
        const response = await fetch(url);

        if (!response.ok) {
            const errorDetails = await response.text();
            console.error(`Mediastack API request failed: ${response.status} - ${errorDetails}`);
            throw new Error(`Mediastack API request failed: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched Data (Mediastack):', data);

        const articles = data.data || [];
        if (articles.length > 0) {
            displayNews(
                articles.map((article) => ({
                    title: article.title,
                    description: article.description,
                    url: article.url,
                    urlToImage: article.image,
                }))
            );
        } else {
            newsList.innerHTML = '<p>No news found. Please try a different category.</p>';
        }
    } catch (error) {
        console.error('Error fetching news from Mediastack:', error);
        newsList.innerHTML = `<p>Failed to fetch news. Please try again later.<br>${error.message}</p>`;
    } finally {
        hideLoader();
    }
}

// Display news articles
function displayNews(articles) {
    newsList.innerHTML = '';
    articles.forEach((article) => {
        const newsItem = document.createElement('div');
        newsItem.classList.add('news-item');
        newsItem.innerHTML = `
            <img src="${article.urlToImage || 'https://dummyimage.com/350x200/cccccc/000000&text=No+Image'}" 
                 alt="${article.title}" 
                 onerror="this.src='https://dummyimage.com/350x200/cccccc/000000&text=No+Image';">
            <h3>${article.title || 'No title available'}</h3>
            <p>${article.description || 'No description available.'}</p>
            <a href="${article.url || '#'}" target="_blank">Read more</a>
        `;
        newsList.appendChild(newsItem);
    });
}

// Show loader
function showLoader() {
    loader.style.display = 'block';
    newsList.style.display = 'none';
}

// Hide loader
function hideLoader() {
    setTimeout(() => {
        loader.style.display = 'none';
        newsList.style.display = 'block';
    }, 300); // Minimum display time
}

// Update pagination buttons state
function updatePaginationButtons() {
    prevPageButton.disabled = currentPage === 1;
}

// Category filter change listener
categoryFilter.addEventListener('change', debounce(() => {
    currentPage = 1; // Reset to the first page
    fetchNewsMediastack(categoryFilter.value, currentPage);
    updatePaginationButtons();
}, 300));

// Pagination event listeners
prevPageButton.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchNewsMediastack(categoryFilter.value, currentPage);
        updatePaginationButtons();
    }
});

nextPageButton.addEventListener('click', () => {
    currentPage++;
    fetchNewsMediastack(categoryFilter.value, currentPage);
    updatePaginationButtons();
});

// Feedback form submission
async function submitFeedback(email, feedback) {
    try {
        const response = await fetch('/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, feedback }),
        });

        if (!response.ok) throw new Error('Failed to submit feedback');
        alert('Feedback submitted successfully!');
    } catch (error) {
        alert('Error submitting feedback. Please try again.');
        console.error(error);
    }
}

// Handle feedback form submission
document.getElementById('feedbackForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form submission

    const email = document.getElementById('email').value;
    const feedback = document.getElementById('feedback').value;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Please enter a valid email address');
        return;
    }

    if (feedback.trim().length < 10) {
        alert('Feedback must be at least 10 characters long');
        return;
    }

    submitFeedback(email, feedback);

    // Reset form fields
    document.getElementById('email').value = '';
    document.getElementById('feedback').value = '';
});

// Initial load
fetchNewsMediastack('', currentPage);
updatePaginationButtons();

// Event Listeners for Login and Sign-Up Buttons
document.getElementById('loginBtn').addEventListener('click', () => {
    alert('Login functionality coming soon!');
});

document.getElementById('signUpBtn').addEventListener('click', () => {
    alert('Sign-Up functionality coming soon!');
});

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
    '05d99e5db00d46f9b344f43b85a58f59', // News API Key 1
    'dd4d03d0cec348d7b5a38cbad278ca94', // News API Key 2
    'b0a36ecabae141029714540850eb4b4a'  // News API Key 3
];
const MEDIASTACK_API_KEY = '1fa3953f4caba403289851cc01eda963';
const BASE_NEWS_API_URL = 'https://newsapi.org/v2/top-headlines';
const BASE_MEDIASTACK_URL = 'http://api.mediastack.com/v1/news';

const categoryFilter = document.getElementById('categoryFilter');
const newsList = document.getElementById('newsList');
const loader = document.getElementById('loader');

const PAGE_SIZE = 10; // Number of articles per page
let currentApiKeyIndex = 0; // Track the current API key index

// Fetch news from News API
async function fetchNewsNewsAPI(category = '', page = 1) {
    showLoader();

    while (currentApiKeyIndex < NEWS_API_KEYS.length) {
        const apiKey = NEWS_API_KEYS[currentApiKeyIndex];
        let url = `${BASE_NEWS_API_URL}?apiKey=${apiKey}&country=us&pageSize=${PAGE_SIZE}&page=${page}`;
        if (category && category !== 'all') url += `&category=${category}`;

        console.log(`Requesting URL (News API, Key ${currentApiKeyIndex + 1}):`, url);

        try {
            const response = await fetch(url);

            if (response.ok) {
                const data = await response.json();
                console.log('Fetched Data (News API):', data);

                const articles = data.articles || [];
                if (articles.length > 0) {
                    displayNews(
                        articles.map((article) => ({
                            title: article.title,
                            description: article.description,
                            url: article.url,
                            urlToImage: article.urlToImage,
                        }))
                    );
                } else {
                    newsList.innerHTML = '<p>No news found. Please try a different category.</p>';
                }

                hideLoader();
                return; // Exit if successful
            } else {
                console.warn(`News API key ${currentApiKeyIndex + 1} failed. Trying next key.`);
                currentApiKeyIndex++;
            }
        } catch (error) {
            console.error(`Error fetching news with API key ${currentApiKeyIndex + 1}:`, error);
            currentApiKeyIndex++;
        }
    }

    // If all keys fail
    newsList.innerHTML = `<p>Failed to fetch news from News API. Please try again later.</p>`;
    hideLoader();
}

// Fetch news from Mediastack API
async function fetchNewsMediastack(category = '', page = 1) {
    showLoader();

    const offset = (page - 1) * PAGE_SIZE;
    let url = `${BASE_MEDIASTACK_URL}?access_key=${MEDIASTACK_API_KEY}&limit=${PAGE_SIZE}&offset=${offset}&countries=us`;
    if (category && category !== 'all') url += `&categories=${category}`;

    console.log('Requesting URL (Mediastack):', url);

    try {
        const response = await fetch(url);

        if (response.ok) {
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
        } else {
            const errorDetails = await response.text();
            console.error(`Mediastack API request failed: ${response.status} - ${errorDetails}`);
        }
    } catch (error) {
        console.error('Error fetching news from Mediastack API:', error);
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
            <img src="${article.urlToImage || 'https://via.placeholder.com/350x200'}" 
                 alt="${article.title || 'News Image'}" 
                 onerror="this.src='https://via.placeholder.com/350x200';">
            <h3>${article.title || 'No title available'}</h3>
            <p>${article.description || 'No description available.'}</p>
            <a href="${article.url || '#'}" target="_blank" rel="noopener noreferrer">Read more</a>
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

// Category filter change listener
categoryFilter.addEventListener('change', debounce(() => {
    const category = categoryFilter.value;
    currentApiKeyIndex = 0; // Reset API key index for News API
    fetchNewsNewsAPI(category, 1);
    fetchNewsMediastack(category, 1);
}, 300));

// Initial load
fetchNewsNewsAPI('', 1);
fetchNewsMediastack('', 1);

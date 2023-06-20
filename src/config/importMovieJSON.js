const axios = require('axios');
const fs = require('fs');

const baseUrl = 'https://api.themoviedb.org/3/movie/';
const apiKey =  '043ea53b0f115cd3997dcbb3f8a46a1a';

const start = 1;
const end = 560;
const jsonUrls = [];

for (let i = start; i <= end; i++) {
    const urlLink = `${baseUrl}${i}?api_key=${apiKey}`;
    jsonUrls.push(urlLink);
}

// Function to fetch JSON from a URL
const fetchJSON = async (url) => {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching JSON from ${url}:`, error.message);
        return null;
    }
};

// Function to concatenate JSON files
const concatenateJSON = async (urls) => {
    try {
        const jsonData = [];

        // Fetch JSON from each URL and add it to the array
        for (const url of urls) {
            const json = await fetchJSON(url);
            if (json) {
                jsonData.push(json);
            }
        }

        // Write the concatenated JSON to a file
        fs.writeFile('dataMovie.json', JSON.stringify(jsonData, null, 2), (error) => {
            if (error) {
                console.error('Error writing JSON file:', error.message);
            } else {
                console.log('JSON file created successfully!');
            }
        });
    } catch (error) {
        console.error('Error concatenating JSON:', error.message);
    }
};

// Call the function to concatenate JSON files
concatenateJSON(jsonUrls);
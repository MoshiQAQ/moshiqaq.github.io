/**
 * GitHub Stars Fetcher
 * Fetches and updates the star count for GitHub repositories
 */

document.addEventListener('DOMContentLoaded', () => {
    // Repositories to track
    const repositories = [
        {
            owner: 'geekan',
            repo: 'MetaGPT',
            element: document.querySelector('.project-item:nth-child(1) .github-stars span')
        },
        {
            owner: "mannaandpoem",
            repo: "OpenManus",
            element: document.querySelector('.project-item:nth-child(2) .github-stars span')
        },
        // {
        //     owner: 'qixucen',
        //     repo: 'atom',
        //     element: document.querySelector('.project-item:nth-child(3) .github-stars span')
        // }
        // Add more repositories as needed
    ];

    // Fetch star counts for all repositories
    repositories.forEach(fetchStars);

    /**
     * Fetches star count for a GitHub repository
     * @param {Object} repository - Repository info including owner, repo name, and DOM element
     */
    async function fetchStars(repository) {
        try {
            const response = await fetch(`https://api.github.com/repos/${repository.owner}/${repository.repo}`);
            
            if (!response.ok) {
                throw new Error(`GitHub API responded with ${response.status}`);
            }
            
            const data = await response.json();
            const starCount = data.stargazers_count;
            
            // Format the star count (e.g., 6200 -> 6.2k)
            const formattedStars = formatStarCount(starCount);
            
            // Update the DOM
            if (repository.element) {
                repository.element.textContent = formattedStars;
            } else {
                console.warn(`Element not found for ${repository.owner}/${repository.repo}`);
            }
        } catch (error) {
            console.error(`Error fetching stars for ${repository.owner}/${repository.repo}:`, error);
            // Fallback to placeholder or previously cached value
            if (repository.element) {
                // Keep whatever was there or set a fallback
                if (!repository.element.textContent) {
                    repository.element.textContent = '–';
                }
            }
        }
    }

    /**
     * Formats a number as a compact representation (e.g., 1500 -> 1.5k)
     * @param {Number} count - The number to format
     * @return {String} Formatted count
     */
    function formatStarCount(count) {
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        if (count >= 1000) {
            return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
        }
        return count.toString();
    }
});
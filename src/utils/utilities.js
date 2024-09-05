module.exports.urlToFilename = (url) => {
    try {
        // Create a new URL object
        const parsedUrl = new URL(url);

        // Get the pathname (the part of the URL after the domain)
        const pathname = parsedUrl.pathname;

        // Extract the filename (the last segment after the last '/')
        const filename = pathname.split('/').pop();

        // If the filename is empty (e.g., the URL ends with a '/'), return a default value
        return filename || 'index.html';
    } catch (e) {
        // If the URL is invalid, return null or throw an error
        console.error('Invalid URL:', e);
        return null;
    }
}

module.exports.getPageLinks = (currentUrl, body) => {
    // Extract all the links from the body of the page
    const links = body.match(/href="([^"]*)"/g) || [];

    // Extract the URLs from the links
    return links.map(link => {
        // Remove the 'href="' prefix and the closing double quote
        return link.substring(6, link.length - 1);
    });
}
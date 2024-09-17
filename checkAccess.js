document.addEventListener('DOMContentLoaded', function () {
    const user = JSON.parse(localStorage.getItem('user'));
    const pageName = window.location.pathname.split('/').pop(); // Get the current page name

    // Redirect to login if the user is not logged in or not authorized to access the page
    if (!user) {
        // Redirect only if the user is not already on the login page (index.html)
        if (pageName !== 'index.html') {
            window.location.href = 'index.html';
        }
    } else if (!user.access || !user.access.includes(pageName)) {
        // If the user doesn't have access to the current page, redirect to index.html
        if (pageName !== 'index.html') {
            window.location.href = 'index.html';
        }
    }
});




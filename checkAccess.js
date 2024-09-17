document.addEventListener('DOMContentLoaded', function () {
    const user = JSON.parse(localStorage.getItem('user'));
    const pageName = window.location.pathname.split('/').pop(); // Get the current page name

    // Redirect to login if the user is not logged in or not authorized to access the page
    if (!user || !user.access.includes(pageName)) {
        // Ensure that redirection only happens once
        if (window.location.pathname !== '/index.html') {
            window.location.href = 'index.html';
        }
    }

});




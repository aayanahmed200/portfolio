(function () {
  try {
    var savedTheme = localStorage.getItem('aayan-site-theme');
    document.documentElement.dataset.siteTheme = savedTheme === 'dark' ? 'dark' : 'light';
  } catch (error) {
    document.documentElement.dataset.siteTheme = 'light';
  }
})();

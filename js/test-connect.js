(function () {
    const el = document.getElementById('tartan-app');
    if (el) {
        const msg = document.createElement('div');
        msg.id = 'netlify-connect-ok';
        msg.style.cssText = 'padding:12px; background:#e6ffe6; border:1px solid #98d698; margin:8px 0;';
        msg.textContent = 'Netlify assets loaded OK';
        el.prepend(msg);
    }
    console.log('Netlify test script loaded');
})();
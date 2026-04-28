// LEX — Google Analytics 4
// Replace G-XXXXXXXXXX below with your Measurement ID.
// Find it in Google Analytics > Admin > Data Streams > Web > Measurement ID
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-XXXXXXXXXX', {
  cookie_flags: 'SameSite=None;Secure'
});

export function register() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then(reg => console.log('Service Worker Registered:', reg))
          .catch(err => console.log('Service Worker Registration Failed:', err));
      });
    }
  }
  
  export function unregister() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then(registration => registration.unregister())
        .then(() => console.log('Service Worker Unregistered'));
    }
  }
  
import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Initialize Pusher first
window.Pusher = Pusher;

// Create Pusher instance with proper configuration
const pusher = new Pusher(import.meta.env.VITE_REVERB_APP_KEY, {
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
    cluster: import.meta.env.VITE_REVERB_APP_CLUSTER ?? 'mt1',
    authorizer: (channel: any) => ({
        authorize: (socketId: string, callback: Function) => {
            axios.post('/broadcasting/auth', {
                socket_id: socketId,
                channel_name: channel.name
            }, {
                headers: {
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                }
            })
            .then(response => {
                callback(null, response.data);
            })
            .catch(error => {
                callback(error);
            });
        }
    })
});

// Initialize Echo with the Pusher instance
window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    client: pusher
});

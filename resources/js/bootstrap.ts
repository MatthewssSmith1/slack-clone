import Pusher from 'pusher-js';
import axios from 'axios';
import Echo from 'laravel-echo';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

window.Pusher = Pusher; 
window.Echo = new Echo({
    broadcaster: 'pusher',
    key: 'e95195cb05c507f9aa3e',
    cluster: 'us2',
    forceTLS: true
});

// window.Pusher = Pusher;
// const pusher = new Pusher('q3g1wcsq7lgoorqs6hsv', {
//     wsHost: import.meta.env.APP_DEBUG ? 'localhost' : 'slack-clone-2616.fly.dev',
//     wsPort: 8080,
//     wssPort: 8080,
//     forceTLS: false,
//     enabledTransports: ['ws', 'wss'],
//     cluster: 'mt1',
//     authorizer: (channel: any) => ({
//         authorize: (socketId: string, callback: Function) => {
//             axios.post('/broadcasting/auth', {
//                 socket_id: socketId,
//                 channel_name: channel.name
//             }, {
//                 headers: {
//                     'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
//                 }
//             })
//             .then(response => {
//                 callback(null, response.data);
//             })
//             .catch(error => {
//                 callback(error);
//             });
//         }
//     })
// });

// window.Echo = new Echo({
//     broadcaster: 'pusher',
//     key: 'q3g1wcsq7lgoorqs6hsv',
//     client: pusher
// });

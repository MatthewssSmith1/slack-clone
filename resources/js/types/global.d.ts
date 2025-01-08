import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { PageProps as AppPageProps } from './';
import { route as ziggyRoute } from 'ziggy-js';
import { AxiosInstance } from 'axios';
import { Pusher } from 'pusher-js';
import { Echo } from 'laravel-echo';

declare global {
    interface Window {
        axios: AxiosInstance;
        Echo: Echo;
        Pusher: typeof Pusher;
    }

    /* eslint-disable no-var */
    var route: typeof ziggyRoute;
}

declare module '@inertiajs/core' {
    interface PageProps extends InertiaPageProps, AppPageProps {}
}

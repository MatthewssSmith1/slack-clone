import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

export function useAuth() {
    const { props } = usePage<PageProps>();
    return props.auth;
} 
import { User } from './slack';

export interface PageProps {
    auth: {
        user: User;
    };
    errors: Record<string, string>;
    status?: string;
    [key: string]: any;
}

// Common Inertia form types
export type InertiaFormErrors = Record<string, string>;

export interface InertiaForm<T> {
    data: T;
    transform: (callback: (data: T) => object) => InertiaForm<T>;
    errors: InertiaFormErrors;
    hasErrors: boolean;
    processing: boolean;
    progress: number | null;
    wasSuccessful: boolean;
    recentlySuccessful: boolean;
    setData: (key: keyof T, value: any) => InertiaForm<T>;
    post: (url: string, options?: object) => Promise<any>;
    put: (url: string, options?: object) => Promise<any>;
    patch: (url: string, options?: object) => Promise<any>;
    delete: (url: string, options?: object) => Promise<any>;
    reset: (...fields: (keyof T)[]) => InertiaForm<T>;
    clearErrors: (...fields: (keyof T)[]) => InertiaForm<T>;
    submit: (method: string, url: string, options?: object) => Promise<any>;
    get: (url: string, options?: object) => Promise<any>;
} 
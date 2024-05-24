'use client';

import { AuthProvider } from '@refinedev/core';
import { getSession, signIn, signOut } from 'next-auth/react';

export const authProvider: AuthProvider = {
    register: async ({ email, password }) => {
        const response = await fetch('/api/model/user/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: { email, password },
            }),
        });

        if (response.ok || (await isReadBackError(response))) {
            return {
                success: true,
                redirectTo: '/login',
                successNotification: {
                    message: 'User registered successfully',
                },
            };
        } else {
            return {
                success: false,
                error: {
                    name: 'RegisterError',
                    message: `Unable to register user: ${response.statusText}`,
                },
            };
        }
    },

    login: async ({ email, password }) => {
        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });
        if (result?.ok) {
            return {
                success: true,
                redirectTo: '/',
            };
        } else {
            return {
                success: false,
                error: {
                    name: 'LoginError',
                    message: 'Invalid username or password',
                },
            };
        }
    },

    logout: async () => {
        await signOut();
        return {
            success: true,
            redirectTo: '/login',
        };
    },

    check: async () => {
        const session = await getSession();
        if (session) {
            return { authenticated: true };
        } else {
            return {
                authenticated: false,
                logout: true,
                redirectTo: '/login',
            };
        }
    },

    getIdentity: async () => {
        const session = await getSession();
        if (session) {
            return session.user;
        } else {
            return null;
        }
    },

    onError: async (error) => {
        if (error.response?.status === 401) {
            return {
                logout: true,
            };
        }
        return { error };
    },
};

async function isReadBackError(response: Response) {
    return (
        response.status === 403 &&
        (await response.json()).error?.reason === 'RESULT_NOT_READABLE'
    );
}

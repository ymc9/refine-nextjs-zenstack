import { auth } from '@/auth';
import { AuthProvider } from '@refinedev/core';

export const authProviderServer: Pick<AuthProvider, 'check'> = {
    check: async () => {
        const session = await auth();
        if (session) {
            return {
                authenticated: true,
            };
        } else {
            return {
                authenticated: false,
                logout: true,
                redirectTo: '/login',
            };
        }
    },
};

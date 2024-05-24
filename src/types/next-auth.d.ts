import 'next-auth';

declare module 'next-auth' {
    // Extend User to hold the role
    interface User {
        role: string;
    }
}

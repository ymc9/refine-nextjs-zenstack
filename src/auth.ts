import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@db';
import { compare } from 'bcryptjs';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, signIn, signOut, auth } = NextAuth({
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                // add user id and role to JWT token
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },

        session({ session, token }) {
            if (session.user) {
                // add id and role to session user from JWT token
                session.user.id = token.sub!;
                session.user.role = token.role as string;
            }
            return session;
        },
    },

    adapter: PrismaAdapter(prisma),

    providers: [
        Credentials({
            credentials: {
                email: { type: 'email' },
                password: { type: 'password' },
            },

            authorize: async (credentials) => {
                if (typeof credentials.email !== 'string') {
                    throw new Error('Invalid email');
                }

                if (typeof credentials.password !== 'string') {
                    throw new Error('Invalid password');
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        password: true,
                    },
                });

                if (
                    user &&
                    (await compare(credentials.password, user.password))
                ) {
                    return { id: user.id, email: user.email, role: user.role };
                } else {
                    return null;
                }
            },
        }),
    ],

    pages: {
        signIn: '/login',
        newUser: '/register',
    },
});

import { auth } from '@/auth';
import { prisma } from '@/db';
import { enhance } from '@zenstackhq/runtime';
import { NextRequestHandler } from '@zenstackhq/server/next';

// create an enhanced Prisma client with user context
async function getPrisma() {
    const session = await auth();
    const user = session?.user?.id
        ? { id: session.user.id, role: session.user.role }
        : undefined;
    return enhance(prisma, { user });
}

const handler = NextRequestHandler({ getPrisma, useAppDir: true });

export {
    handler as DELETE,
    handler as GET,
    handler as PATCH,
    handler as POST,
    handler as PUT,
};

'use client';

import {
    AccessControlProvider,
    CanParams,
    CanReturnType,
} from '@refinedev/core';

export const accessControlProvider: AccessControlProvider = {
    can: async ({ resource, action }: CanParams): Promise<CanReturnType> => {
        if (action === 'create') {
            // make a request to "/api/model/:resource/check?q={operation:'create'}"
            let url = `/api/model/${resource}/check`;
            url +=
                '?q=' +
                encodeURIComponent(
                    JSON.stringify({
                        operation: 'create',
                    })
                );
            const resp = await fetch(url);
            if (!resp.ok) {
                return { can: false };
            } else {
                const { data } = await resp.json();
                return { can: data };
            }
        }

        return { can: true };
    },

    options: {
        buttons: {
            enableAccessControl: true,
            hideIfUnauthorized: false,
        },
    },
};

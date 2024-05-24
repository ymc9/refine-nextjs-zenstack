'use client';

import {
    BaseRecord,
    CreateParams,
    CreateResponse,
    CrudFilter,
    DataProvider,
    DeleteOneParams,
    DeleteOneResponse,
    GetListParams,
    GetListResponse,
    GetOneParams,
    GetOneResponse,
    UpdateParams,
    UpdateResponse,
} from '@refinedev/core';
import { P, match } from 'ts-pattern';

const API_URL = '/api/model';

export const dataProvider: DataProvider = {
    getList: async function <TData extends BaseRecord = BaseRecord>(
        params: GetListParams
    ): Promise<GetListResponse<TData>> {
        const queryArgs: any = {};

        // filtering
        if (params.filters && params.filters.length > 0) {
            const filters = params.filters.map((filter) =>
                transformFilter(filter)
            );
            if (filters.length > 1) {
                queryArgs.where = { AND: filters };
            } else {
                queryArgs.where = filters[0];
            }
        }

        // sorting
        if (params.sorters && params.sorters.length > 0) {
            queryArgs.orderBy = params.sorters.map((sorter) => ({
                [sorter.field]: sorter.order,
            }));
        }

        // pagination
        if (
            params.pagination?.mode === 'server' &&
            params.pagination.current !== undefined &&
            params.pagination.pageSize !== undefined
        ) {
            queryArgs.take = params.pagination.pageSize;
            queryArgs.skip =
                (params.pagination.current - 1) * params.pagination.pageSize;
        }

        const [data, count] = await Promise.all([
            fetchData(params.resource, '/findMany', queryArgs),
            fetchData(params.resource, '/count', queryArgs),
        ]);

        return { data, total: count };
    },

    getOne: async function <TData extends BaseRecord = BaseRecord>(
        params: GetOneParams
    ): Promise<GetOneResponse<TData>> {
        const data = await fetchData(params.resource, '/findUnique', {
            where: { id: params.id },
        });
        return { data };
    },

    create: async function <
        TData extends BaseRecord = BaseRecord,
        TVariables = {}
    >(params: CreateParams<TVariables>): Promise<CreateResponse<TData>> {
        return mutateData(params.resource, 'create', 'POST', {
            data: params.variables,
        });
    },

    update: async function <
        TData extends BaseRecord = BaseRecord,
        TVariables = {}
    >(params: UpdateParams<TVariables>): Promise<UpdateResponse<TData>> {
        const data = await mutateData(params.resource, 'update', 'PUT', {
            where: { id: params.id },
            data: params.variables,
        });
        return { data };
    },

    deleteOne: async function <
        TData extends BaseRecord = BaseRecord,
        TVariables = {}
    >(params: DeleteOneParams<TVariables>): Promise<DeleteOneResponse<TData>> {
        const data = await deleteData(params.resource, 'delete', {
            where: { id: params.id },
        });
        return { data };
    },

    getApiUrl: function (): string {
        return '/api/model';
    },
};

function makeQuery(resource: string, endpoint: string, args?: unknown) {
    let url = `${API_URL}/${resource}${
        endpoint.startsWith('/') ? endpoint : '/' + endpoint
    }`;
    if (args) {
        url += `?q=${encodeURIComponent(JSON.stringify(args))}`;
    }
    return url;
}

async function fetchData(resource: string, endpoint: string, args?: unknown) {
    const resp = await fetch(makeQuery(resource, endpoint, args));
    if (!resp.ok) {
        throw new Error(`Failed to fetch ${resource}: ${resp.statusText}`);
    }
    return (await resp.json()).data;
}

async function mutateData(
    resource: string,
    endpoint: string,
    method: 'POST' | 'PUT',
    args?: unknown
) {
    const resp = await fetch(makeQuery(resource, endpoint), {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args),
    });
    if (!resp.ok) {
        throw new Error(`Failed to post ${resource}: ${resp.statusText}`);
    }
    return (await resp.json()).data;
}

async function deleteData(resource: string, endpoint: string, args?: unknown) {
    const resp = await fetch(makeQuery(resource, endpoint, args), {
        method: 'DELETE',
    });
    if (!resp.ok) {
        throw new Error(`Failed to fetch ${resource}: ${resp.statusText}`);
    }
    return (await resp.json()).data;
}

// transform the given refine filter into prisma format
// https://refine.dev/docs/core/interface-references/#crudoperators
// https://www.prisma.io/docs/orm/reference/prisma-client-reference#filter-conditions-and-operators
function transformFilter(filter: CrudFilter): any {
    return match(filter)
        .with({ operator: 'eq' }, (f) => ({ [f.field]: f.value }))
        .with({ operator: 'ne' }, (f) => ({ NOT: { [f.field]: f.value } }))
        .with({ operator: 'in' }, (f) => ({ [f.field]: { in: f.value } }))
        .with({ operator: 'nin' }, (f) => ({ [f.field]: { notIn: f.value } }))
        .with(
            { operator: P.union('gt', 'lt', 'gte', 'lte', 'contains') },
            (f) => ({ [f.field]: { [f.operator]: f.value } })
        )
        .with({ operator: 'between' }, (f) => ({
            [f.field]: { gte: f.value[0], lte: f.value[1] },
        }))
        .with({ operator: 'nbetween' }, (f) => ({
            NOT: transformFilter({ ...f, operator: 'between' }),
        }))
        .with({ operator: 'startswith' }, (f) => ({
            [f.field]: { startsWith: f.value, mode: 'insensitive' },
        }))
        .with({ operator: 'endswith' }, (f) => ({
            [f.field]: { endsWith: f.value, mode: 'insensitive' },
        }))
        .with({ operator: 'containss' }, (f) => ({
            [f.field]: { contains: f.value, mode: 'insensitive' },
        }))
        .with({ operator: 'startswiths' }, (f) => ({
            [f.field]: { startsWith: f.value },
        }))
        .with({ operator: 'endswiths' }, (f) => ({
            [f.field]: { endsWith: f.value },
        }))
        .with({ operator: 'ncontains' }, (f) => ({
            NOT: {
                ...transformFilter({ ...f, operator: 'contains' }),
                mode: 'insensitive',
            },
        }))
        .with({ operator: 'nstartswith' }, (f) => ({
            NOT: {
                ...transformFilter({ ...f, operator: 'startswith' }),
                mode: 'insensitive',
            },
        }))
        .with({ operator: 'nendswith' }, (f) => ({
            NOT: {
                ...transformFilter({ ...f, operator: 'endswith' }),
                mode: 'insensitive',
            },
        }))
        .with({ operator: 'ncontainss' }, (f) => ({
            NOT: transformFilter({ ...f, operator: 'contains' }),
        }))
        .with({ operator: 'nstartswiths' }, (f) => ({
            NOT: transformFilter({ ...f, operator: 'startswith' }),
        }))
        .with({ operator: 'nendswiths' }, (f) => ({
            NOT: transformFilter({ ...f, operator: 'endswith' }),
        }))
        .with({ operator: 'null' }, (f) => ({ [f.field]: null }))
        .with({ operator: 'nnull' }, (f) => ({ NOT: { [f.field]: null } }))
        .with({ operator: 'and' }, (f) => ({
            AND: f.value.map(transformFilter),
        }))
        .with({ operator: 'or' }, (f) => ({ OR: f.value.map(transformFilter) }))
        .exhaustive();
}

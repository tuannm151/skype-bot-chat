const { DIRECTUS_URL, DIRECTUS_TOKEN } = process.env;

if (!DIRECTUS_URL || !DIRECTUS_TOKEN) {
    throw new Error('Missing required env variables for directus');
}

import { createDirectus, graphql, rest, staticToken } from '@directus/sdk';
import { DirectusSchema } from '~/types/directus';

const directus = createDirectus<DirectusSchema>(DIRECTUS_URL).with(staticToken(DIRECTUS_TOKEN)).with(rest()).with(graphql());


export {
    directus,
};

import * as z from 'zod';

const CreateShopifyAppBodySchema = z.object({
    partnerId: z.string().min(1),
    appInfo: z.object({
        name: z.string().min(1),
    }),
});

const UpdateShopifyAppBodySchema = z.object({
    partnerId: z.string().min(1),
    appInfo: z.object({}).refine((data) => {
        return Object.keys(data).length > 0;
    }, {
        message: 'At least one field is required'
    }),
});

export {
    CreateShopifyAppBodySchema,
    UpdateShopifyAppBodySchema,
};



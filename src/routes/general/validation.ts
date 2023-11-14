import * as z from 'zod';

const SendMessageBodySchema = z.object({
    text: z.string(),
    conversationId: z.string().min(1),
    mentions: z.array(z.object({
        id: z.string().min(1),
        name: z.string().min(1),
    })).optional(),
});

interface SendMessageBody extends z.infer<typeof SendMessageBodySchema> {}

export {
    SendMessageBody,
    SendMessageBodySchema,
};




import * as z from 'zod';

const SendMessageBodySchema = z.object({
    text: z.string(),
    conversationId: z.string().min(1),
});

interface SendMessageBody extends z.infer<typeof SendMessageBodySchema> {}

export {
    SendMessageBody,
    SendMessageBodySchema,
};




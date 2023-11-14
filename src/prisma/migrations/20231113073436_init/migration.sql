-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "isGroup" BOOLEAN DEFAULT false,
    "type" TEXT,
    "reference" JSONB NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

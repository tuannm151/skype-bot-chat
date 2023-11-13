-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isGroup" BOOLEAN NOT NULL,
    "type" TEXT NOT NULL,
    "reference" JSONB NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

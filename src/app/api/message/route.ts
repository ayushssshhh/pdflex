import { db } from "@/db";
import { sendMessageValidator } from "@/lib/validator/SendMessageValidator";
import { NextRequest } from "next/server";
import { pinecone } from "@/lib/validator/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { openai } from "@/lib/openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { cookies } from "next/headers";

export const POST = (async (req: NextRequest) => {
    const body = await req.json();

    // making sure user is authenticated
    const cookieStore = cookies();
    const user = cookieStore.get("user")?.value.toString();

    if (!user) {
        return new Response("Unauthorized", { status: 401 });
    }

    // extracting fileId and message from request body
    const { fileId, message } = sendMessageValidator.parse(body);

    // fetching file associated with the request
    const file = await db.file.findFirst({
        where: {
            id: fileId,
            userId: user,
        }
    });

    if (!file) {
        return new Response("Not Found", { status: 404 });
    }

    // storing user message in database
    await db.message.create({
        data: {
            text: message,
            isUserMessage: true,
            userId: user,
            fileId,
        }
    });

    // initializing Pinecone index
    const pineconeIndex = pinecone.Index("pdflex2");

    // generate vector embeddings from text
    const embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // search for most relevant vector pages
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
        namespace: file.id,
    });

    const results = await vectorStore.similaritySearch(message, 4);

    // retrieve previous 6 messages for context
    const prevMessages = await db.message.findMany({
        where: { fileId },
        orderBy: { createdAt: "asc" },
        take: 6,
    });

    const formattedPrevMessages = prevMessages.map((msg) => ({
        role: msg.isUserMessage ? "user" : "assistant",
        content: msg.text,
    }));

    // generating AI response
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        temperature: 0,
        stream: true,
        messages: [
            {
                role: "system",
                content: "Use the following pieces of context (or previous conversation if needed) to answer the user's question in markdown format.",
            },
            {
                role: "user",
                content: `
                    Use the following pieces of context (or previous conversation if needed) to answer the user's question in markdown format.
                    If you don't know the answer, just say that you don't know.
                    
                    ----------------
                    PREVIOUS CONVERSATION:
                    ${formattedPrevMessages.map((m) => `${m.role}: ${m.content}\n`).join("")}
                    
                    ----------------
                    CONTEXT:
                    ${results.map((r) => r.pageContent).join("\n\n")}
                    
                    USER INPUT: ${message}
                `,
            },
        ],
    });

    // streaming response
    const stream = OpenAIStream(response, {
        async onCompletion(completion) {
            await db.message.create({
                data: {
                    text: completion,
                    isUserMessage: false,
                    fileId,
                    userId: user,
                },
            });
        },
    });

    return new StreamingTextResponse(stream);
});

import { db } from "@/db";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { pinecone } from "@/lib/validator/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { cookies } from "next/headers";

// Now you can use PineconeVectorStore in your code


const f = createUploadthing();


export const ourFileRouter = {
    pdfUploader: f({ pdf: { maxFileSize: "16MB" } })
        // middleware will run when someone req to upload dile from client
        .middleware(async ({ req }) => {
            // checking user is auth or not(kinde)

            const cookieStore = cookies();

            const user = cookieStore.get('user')?.value.toString();
            const email = cookieStore.get('email')?.value.toString();


            if (!user || !email) {
                throw new Error("Unauthorized")
            }

            return { userId: user };
        })
        // callback called once file upload is completed
        // use to add file url on our fileDb 
        .onUploadComplete(async ({ metadata, file }) => {
            const createdFile = await db.file.create({
                data: {
                    key: file.key,
                    name: file.name,
                    userId: metadata.userId,
                    url: file.url,
                    uploadStatus: 'PROCESSING',
                }
            })

            try {
                const response = await fetch(file.url)

                // creating blob object from pdf
                // blob -> Blobs represent data that isn't necessarily in a JavaScript-native format , hey can be read as text or binary data, or converted into a ReadableStream
                const blob = await response.blob()

                // now index blob object
                const loader = new PDFLoader(blob)

                // extracting page level text from pdf
                const pageLevelDocs = await loader.load()

                // extracting no. of pages
                const pagesAmt = pageLevelDocs.length

                // vectorizing and indexing entire pdf
                const pineconeIndex = pinecone.Index("pdflex2")

                // use to generate vector from text
                const embeddings = new OpenAIEmbeddings({
                    openAIApiKey: process.env.OPENAI_API_KEY
                })

                await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
                    pineconeIndex,
                    namespace: createdFile.id
                })

                // updating file upload status
                await db.file.update({
                    data: {
                        uploadStatus: "SUCCESS"
                    },
                    where: {
                        id: createdFile.id
                    }
                })

            } catch (err) {
                await db.file.update({
                    data: {
                        uploadStatus: "FAILED"
                    },
                    where: {
                        id: createdFile.id
                    }
                })

                console.debug("core.ts : error file saving file : ", err)
            }
        }),

} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
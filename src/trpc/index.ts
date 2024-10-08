import { privateProcedure, publicProcedure, router } from './trpc';
import { db } from '@/db';
import { z } from 'zod'
import { TRPCError } from '@trpc/server';
import { INFINITE_QUERY_LIMIT } from '@/config/infinite.querry';
import { NOTFOUND } from 'dns';
import { PLANS } from '@/config/stripe';
import { getUserSubscriptionPlan, stripe } from '@/lib/stripe';
import { cookies } from 'next/headers';

export const appRouter = router({
    // important querry is like getReq and input is like postReq

    // authCallback trpc query(to add user in db)
    authCallback: publicProcedure.query(async () => {

        const cookieStore = cookies();

        const user = cookieStore.get('user')?.value.toString();
        const email = cookieStore.get('email')?.value.toString();

        if (!user) {
            return { success: false }
        }

        // check if user in db
        const dbUser = await db.user.findFirst({
            where: {
                id: user
            }
        })

        // if not in db then create user
        if (!dbUser && typeof user !== 'undefined' && typeof email !== 'undefined') {
            try {
                await db.user.create({
                    data: {
                        id: user,
                        email: email
                    }
                });
                console.log('saved successfully');
            } catch (error) {
                console.log('no');
                console.error('fail', error);
            }
        }

        return { success: true }
    }),

    logOutCallback: publicProcedure.query(async () => {

        const cookieStore = cookies();

        cookieStore.delete('user')
        cookieStore.delete('email')

        return { success: true }
    }),

    //pass in uId and fetch all the user file (only for logged in feature)
    getUserFiles: privateProcedure.query(async ({ ctx }) => {
        const { userId } = ctx
        console.log("----------------- Fetching User File ------------- ")
        return await db.file.findMany({
            where: {
                userId
            },
        })
    }),

    // to delete userFile 
    deleteFile: privateProcedure
        .input(
            z.object({ id: z.string() })  //z.object means whenever we call apiReq as postReq body we need to pass an object containg id of type string (enfocing type at runtime)
        )
        .mutation(async ({ ctx, input }) => {  //inside mutation define api logic , 

            // input is decalred using z.object
            // since it's a privateProcedure define by us using middleware(isAuth) userId and user is passed as object ctx
            const { userId } = ctx;

            const file = await db.file.findFirst({
                where: {
                    id: input.id, //fileId
                    userId, //userId
                }
            })

            if (!file) {
                throw new TRPCError({ code: 'NOT_FOUND' })
            }

            await db.file.delete({
                where: {
                    id: input.id
                }
            })

            return file
        }),

    // fetch file from db
    getFile: privateProcedure
        .input(z.object({ key: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx

            const file = await db.file.findFirst({
                where: {
                    key: input.key,
                    userId
                }
            })

            if (!file) {
                throw new TRPCError({ code: "NOT_FOUND" })
            }
        }),

    getFileUploadStatus: privateProcedure
        .input(z.object({ fileId: z.string() })) //use to declare type of input
        .query(async ({ input, ctx }) => {
            // input-> is passed while calling querry
            // ctx -> is passed by private procedure (auth)
            const file = await db.file.findFirst({
                where: {
                    id: input.fileId,
                    userId: ctx.userId,
                },
            })

            // if file doesnt exit means its still uploading
            if (!file) {
                return { status: 'PENDING' as const }
            }


            return { status: file.uploadStatus }
        }),

    // fecthing file messgaes
    getFileMessages: privateProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).nullish(),  //setting limit  to number of message to fetch
                cursor: z.string().nullish(), //use to implement infiniet scrolling
                fileId: z.string()
            })
        )
        .query(async ({ ctx, input }) => {
            const { userId } = ctx
            const { fileId, cursor } = input
            const limit = input.limit ?? INFINITE_QUERY_LIMIT

            const file = await db.file.findFirst({
                where: {
                    id: fileId,
                    userId
                }
            })

            if (!file) {
                throw new TRPCError({ code: 'NOT_FOUND' })
            }

            // console.log("file")
            // console.log(file)

            const messages = await db.message.findMany({
                take: limit + 1, //+1 is use to set cursor and determine from where to fetch meessages
                where: {
                    fileId
                },
                orderBy: {
                    createdAt: 'desc'
                },
                cursor: cursor ? { id: cursor } : undefined,

                // selecting only coustom property
                select: {
                    id: true,
                    isUserMessage: true,
                    createdAt: true,
                    text: true,
                }
            })

            // determining logic for next cursor

            let nextCursor: typeof cursor | undefined = undefined

            if (messages.length > limit) {
                const nextItem = messages.pop()
                nextCursor = nextItem?.id
            }

            return { messages, nextCursor }
        }),
});

export type AppRouter = typeof appRouter;



// getFileMsg: privateProcedure
//     .input(z.object({ fileId: z.string() }))
//     .query(async ({ ctx, input }) => {
//         const { userId } = ctx
//         const { fileId } = input

//         const file = await db.file.findFirst({
//             where: {
//                 id: fileId,
//                 userId,
//             },
//         })

//         if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

//         const messages = await db.message.findMany({
//             where: {
//                 fileId,
//             },
//             orderBy: {
//                 createdAt: 'desc',
//             },
//             select: {
//                 id: true,
//                 isUserMessage: true,
//                 createdAt: true,
//                 text: true,
//             },
//         })

//         return { messages }
//     })
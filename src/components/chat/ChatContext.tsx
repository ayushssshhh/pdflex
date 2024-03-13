import { ReactNode, createContext, useRef, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite.querry";

type StreamResponse = {
    // use to add message
    addMessage: () => void,

    // currently adding message
    message: string,

    // handle change in input new msg box
    handleChatInput: (
        event: React.ChangeEvent<HTMLTextAreaElement> //event use to change content of html textarea  
    ) => void,

    // handle loading state
    isLoading: boolean
}

export const ChatContext = createContext<StreamResponse>({
    addMessage: () => { },
    message: '',
    handleChatInput: () => { },
    isLoading: false
})

interface Props {
    fileId: string,
    children: ReactNode
}

export const ChatContextProvider = ({ fileId, children }: Props) => {
    // handeling message state
    const [message, setMessage] = useState<string>('')

    // handle loading state
    const [isLoading, setIsLoading] = useState<boolean>(false)

    // handeling toast notification
    const { toast } = useToast()

    // handleing optimistic update
    const utils = trpc.useUtils()

    // backing up curr message
    const backupMessage = useRef('')

    // using react-query to create mutation to send over api end-point
    //why not using trpc -> because we need to stream back response from api to client side and with trpc that doesnt work it onl work wit jason
    const { mutate: sendMessage } = useMutation({
        mutationFn: async ({ message }: { message: string }) => {
            const response = await fetch('/api/message', {
                method: 'POST',
                body: JSON.stringify({
                    fileId,
                    message,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to send message')
            }

            return response.body
        },

        // executed as soon as we press the button
        // use to handle adding new message from user otimistically  
        onMutate: async () => {
            // creating backup of current entered message
            backupMessage.current = message
            // setting cur message empty
            setMessage('')

            // setting optimistic update

            // step 1 - cancel any outgoing query refetches so they don't clobber your optimistic update when outgoing query is finally resolved
            await utils.getFileMessages.cancel()
            // step 2 - snapshoting prev messages
            const previousMessages = utils.getFileMessages.getInfiniteData()
            // step 3 optimisticaly add new message
            utils.getFileMessages.setInfiniteData(
                { fileId, limit: INFINITE_QUERY_LIMIT },
                (old) => {
                    if (!old) {
                        return { pages: [], pageParams: [] }
                    }

                    let newPages = [...old.pages]
                    let latestPage = newPages[0]!

                    latestPage.messages = [
                        {
                            createdAt: new Date().toISOString(),
                            id: crypto.randomUUID(),
                            text: message,
                            isUserMessage: true
                        },
                        ...latestPage.messages
                    ]

                    newPages[0] = latestPage

                    return {
                        ...old,
                        pages: newPages
                    }
                }
            )

            setIsLoading(true)

            return {
                previousMessages: previousMessages?.pages.flatMap((page) => page.messages) ?? []
            }
        },

        // use to handle adding new message from api otimistically  
        onSuccess: async (stream) => {
            setIsLoading(false)

            // if response is null
            if (!stream) {
                return toast({
                    title: 'There was a problem sending this message',
                    description:
                        'Please refresh this page and try again',
                    variant: 'destructive',
                })
            }

            const reader = stream.getReader()
            const decoder = new TextDecoder()
            let done = false

            // accumulated response
            let accResponse = ''

            // reading response on realtime
            while (!done) {
                // reading entire response chunkbychunk
                const { value, done: doneReading } = await reader.read()
                
                // setting current doneReading status to done
                // doneReading -> true when entire chunk is readed
                done = doneReading

                // decoding currently read chunk
                const chunkValue = decoder.decode(value)

                // adding currently decoded chunk to accumalated response 
                accResponse += chunkValue

                // append chunk to the actual message
                utils.getFileMessages.setInfiniteData(
                    { fileId, limit: INFINITE_QUERY_LIMIT },
                    (old) => {
                        if (!old) return { pages: [], pageParams: [] }

                        let isAiResponseCreated = old.pages.some(
                            (page) =>
                                page.messages.some(
                                    (message) => message.id === 'ai-response'
                                )
                        )

                        let updatedPages = old.pages.map((page) => {
                            if (page === old.pages[0]) {
                                let updatedMessages

                                if (!isAiResponseCreated) {
                                    updatedMessages = [
                                        {
                                            createdAt: new Date().toISOString(),
                                            id: 'ai-response',
                                            text: accResponse,
                                            isUserMessage: false,
                                        },
                                        ...page.messages,
                                    ]
                                } else {
                                    updatedMessages = page.messages.map(
                                        (message) => {
                                            if (message.id === 'ai-response') {
                                                return {
                                                    ...message,
                                                    text: accResponse,
                                                }
                                            }
                                            return message
                                        }
                                    )
                                }

                                return {
                                    ...page,
                                    messages: updatedMessages,
                                }
                            }

                            return page
                        })

                        return { ...old, pages: updatedPages }
                    }
                )
            }
        },

        onError: (_, __, context) => {
            // setting previuos entered message back to input
            setMessage(backupMessage.current)

            // rollback to previous messages
            utils.getFileMessages.setData(
                { fileId },
                { messages: context?.previousMessages ?? [] }
            )
        },

        onSettled: async () => {
            setIsLoading(false)

            // forcing to refresh data
            await utils.getFileMessages.invalidate({ fileId })
        },
    })

    // send message to api end point
    const addMessage = () => sendMessage({ message })

    // setting message 
    const handleChatInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value)
    }

    return (
        <ChatContext.Provider value={({
            addMessage,
            message,
            handleChatInput,
            isLoading
        })}>
            {children}
        </ChatContext.Provider>
    )
}
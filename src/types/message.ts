import { AppRouter } from '@/trpc'
import { inferRouterOutputs } from '@trpc/server'

type RouterOutput = inferRouterOutputs<AppRouter> //getting type of our entire trpc

// getting type of messages from getFileMessages(messages , cursor)
type Messages = RouterOutput['getFileMessages']['messages']

// omititng existing messages text type
type OmitText = Omit<Messages[number], 'text'>

// adding new messages type
type ExtendedText = {
  text: string | JSX.Element
}

export type ExtendedMessage = OmitText & ExtendedText

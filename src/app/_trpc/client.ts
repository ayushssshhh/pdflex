// creating tRPC instance (object)

import {createTRPCReact} from "@trpc/react-query"
import { AppRouter } from "@/trpc"

export const trpc = createTRPCReact<AppRouter>({})
// createTRPCReact<type: pass type of main router>({})
// it gives type safety across app

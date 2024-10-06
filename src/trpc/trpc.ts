import { TRPCError, initTRPC } from '@trpc/server';
import { cookies } from 'next/headers';

const t = initTRPC.create();
const middleware = t.middleware

// querry only for authenticated user
const isAuth = middleware(async (opts) => {
  const cookieStore = cookies();

  const user = cookieStore.get('user')?.value.toString();


  if (!user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  // / opts.next use to pass any value from this middleware directly to our private api-route as props
  return opts.next({
    ctx: {
      userId: user,
      user : user,
    },
  })
})

export const router = t.router;

// this api can be called by anyone wether authenticated or not
export const publicProcedure = t.procedure;
// private api-procedure
export const privateProcedure = t.procedure.use(isAuth)
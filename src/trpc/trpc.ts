import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { TRPCError, initTRPC } from '@trpc/server';

const t = initTRPC.create();
const middleware = t.middleware

// querry only for authenticated user
const isAuth = middleware(async (opts) => {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user || !user.id) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  // / opts.next use to pass any value from this middleware directly to our private api-route as props
  return opts.next({
    ctx: {
      userId: user.id,
      user,
    },
  })
})

export const router = t.router;

// this api can be called by anyone wether authenticated or not
export const publicProcedure = t.procedure;
// private api-procedure
export const privateProcedure = t.procedure.use(isAuth)
import { redirect } from 'next/navigation';

import { db } from '@/db';
import Dashboard from '@/components/Dashboard';
import { cookies } from 'next/headers';

const Page = async () => {
  const cookieStore = cookies();

  const user = cookieStore.get('user')?.value.toString();
  const email = cookieStore.get('email')?.value.toString();

  if (!user || !email) {
    redirect('/auth-callback')
    // auth-callback will sync new user logedin for first time to our db
    // origin enable navigate back to page once callback is completed 
  }

  // checking user in db
  const dbUser = await db.user.findFirst({
    where: {
      id: user
    }
  })

  if (!dbUser) {
    redirect('/auth-callback')
    // auth-callback will sync new user logedin for first time to our db
    // origin enable navigate back to page once callback is completed 
  }

  return (
    <>
      <Dashboard />
      <div className='h-20'></div>
    </>
  )
}

export default Page
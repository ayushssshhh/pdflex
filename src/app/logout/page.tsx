"use client"

import { cookies } from "next/headers";
import { useRouter } from "next/navigation";
import { trpc } from "../_trpc/client";

const Page = () => {
    const router = useRouter()

    const { data: authData } = trpc.logOutCallback.useQuery(undefined , {
        retry: true,
        retryDelay : 500
    });

    if (authData?.success === true) {
        router.push('/');
    }


    return (
        <div></div>
    )
}

export default Page
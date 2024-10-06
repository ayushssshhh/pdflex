"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { getCookie } from "@/lib/util"

import MaxWidthWrapper from "./MaxWidthWrapper"
import { buttonVariants } from "./ui/button"
import MobileNav from "./MobileNav"
import { Icons } from "./Icons"

const Navbar = () => {
    const [user, setUser] = useState<string | undefined>(undefined);
    const pathname = usePathname();

    useEffect(() => {
        setUser(getCookie('user'));
    }, [pathname]);

    return (
        <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
            <MaxWidthWrapper>
                <div className="flex h-14 items-center justify-between border-b border-zinc-200">
                    <Link href='/' className='flex z-40 font-semibold'>
                        <div className='relative flex h-6 w-6 aspect-square items-center justify-center bg-blue-600 rounded-sm'>
                            <Icons.logo className='fill-white h-3/4 w-3/4' />
                        </div>
                        <span className='mx-2'>PDFlex</span>
                    </Link>

                    <MobileNav isAuth={!!user} />

                    {/* desktop navBar */}
                    <div className="hidden items-center space-x-4 sm:flex">
                        <Link href='/pricing'
                            className={buttonVariants({
                                variant: 'ghost',
                                size: 'sm',
                            })}
                        >
                            Pricing
                        </Link>

                        <Link href='/support'
                            className={buttonVariants({
                                variant: 'ghost',
                                size: 'sm',
                            })}
                        >
                            Support
                        </Link>

                        {user !== undefined ? (
                            <>
                                <Link
                                    className={buttonVariants({
                                        variant: 'ghost',
                                        size: 'sm',
                                    })}
                                    href='/dashboard'>
                                    Dashboard
                                </Link>
                                <Link
                                    className={buttonVariants({
                                        size: 'sm',
                                    })}
                                    href='/logout'
                                    onClick={() => setUser(getCookie('user'))}
                                >
                                    Log out
                                </Link>
                            </>
                        ) : (
                            <Link className={buttonVariants({
                                size: 'sm',
                            })}
                                href='/authentication'>
                                Get Started <ArrowRight className="ml-1.5 h-5 w-5" />
                            </Link>
                        )}
                    </div>
                </div>
            </MaxWidthWrapper>
        </nav>
    );
}

export default Navbar;

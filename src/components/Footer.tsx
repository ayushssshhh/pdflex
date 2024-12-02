import Link from 'next/link'
import classes from './Footer.module.css'
import { Icons } from './Icons'
import { buttonVariants } from './ui/button'
import { ArrowRight, ArrowRightCircle } from 'lucide-react'

const Footer = () => {
    return (
        <div className={classes.container}>
            <div className={classes.head}>
                <div className='relative flex h-10 w-10 aspect-square items-center justify-center bg-zinc-100 rounded-sm'>
                    <Icons.logo className='fill-blue-600 h-3/4 w-3/4' />
                </div>
                <h1>PDFlex</h1>
                <p>developed by KUMAR AYUSH & YASH AGRAWAL <span>|</span> 2024 </p>
            </div>
            <p className={classes.info}>A cutting-edge PDF chatbot powered by OpenAI GenAI technology. </p>

            <div className={classes.line}></div>

            <div className={classes.quickLinks}>
                <p> <ArrowRight /></p>
                <Link
                    className={buttonVariants({
                        variant: 'ghost',
                        size: 'sm',
                    })}
                    href='/'>
                    Home
                </Link>
                <p>|</p>
                <Link
                    className={buttonVariants({
                        variant: 'ghost',
                        size: 'sm',
                    })}
                    href='/pricing'>
                    Pricing
                </Link>
                <p>|</p>
                <Link
                    className={buttonVariants({
                        variant: 'ghost',
                        size: 'sm',
                    })}
                    href='/dashboard'>
                    Dashboard
                </Link>
                <p>|</p>
                <Link
                    className={buttonVariants({
                        variant: 'ghost',
                        size: 'sm',
                    })}
                    href='/support'>
                    Support
                </Link>
            </div>

            <div className={classes.line}></div>

            <div className={classes.quickLinks}>
                <p>Developer Information <ArrowRight /></p>
                <a
                    href='https://www.linkedin.com/in/kumar-ayush-3b8a27240/'
                    target='_blank' className={buttonVariants({
                        variant: 'ghost',
                        size: 'sm',
                    })}>LinkedIn</a>

                <p>|</p>
                <a
                    href='mailto:kumar-ayushssshhh@gmail.com'
                    target='_blank' className={buttonVariants({
                        variant: 'ghost',
                        size: 'sm',
                    })}>Email</a>

                <p>|</p>
                <a
                    href='https://github.com/ayushssshhh'
                    target='_blank' className={buttonVariants({
                        variant: 'ghost',
                        size: 'sm',
                    })}>Github</a>

                <p>|</p>
                <a
                    href='https://kumar-ayush.netlify.app/'
                    target='_blank' className={buttonVariants({
                        variant: 'ghost',
                        size: 'sm',
                    })}>Portfolio</a>
            </div>


        </div>
    )
}

export default Footer
import { twMerge } from "tailwind-merge"
import clsx, { ClassValue } from "clsx"
import { Metadata } from "next"

// add coustom className to generic component
export const cn = (...inputs: ClassValue[]) => {

  // twMerge two semi-similar tailwind class => px-2 py-2 ---> p-2
  // helps to resolve conflicts for same class and insure normal css behaviour (problem appear in tw only) : bg-red , bg-green
  return twMerge(clsx(inputs))
}


// used to return absolute url
export function absoluteUrl(path: string) {
  // client side
  if (typeof window !== 'undefined') return path


  // if on server side
  if (process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL}${path}`
  return `http://localhost:${process.env.PORT ?? 3000}${path}`
}

export function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
      return parts.pop()?.split(';').shift();
  }
}

export function isValidEmail(email: string | undefined): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return typeof email === 'undefined' ? false : emailRegex.test(email)
}

export function isValidPasswordFun(password: string|undefined): boolean {
  if(typeof password === 'undefined')
    return false;
  
  const minLength = 6;
  const hasNoSpaces = !/\s/.test(password);
  return password.length >= minLength && hasNoSpaces;
}

export function constructMetadata({
  title = "PDFlex - the SaaS for students",
  description = "PDFlex is an open-source software developed by Kumar Ayush to make chatting to your PDF files easy.",
  image = "/thumbnail.png",
  icons = "/favicon.ico",
  noIndex = false
}: {
  title?: string
  description?: string
  image?: string
  icons?: string
  noIndex?: boolean
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image
        }
      ]
    },
    icons,
    metadataBase: new URL('https://pdflex-psi.vercel.app/'),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false
      }
    })
  }
}
import { twMerge } from "tailwind-merge"
import clsx, {ClassValue} from "clsx"

// add coustom className to generic component
export const cn = (...inputs: ClassValue[]) => {

    // twMerge two semi-similar tailwind class => px-2 py-2 ---> p-2
    // helps to resolve conflicts for same class and insure normal css behaviour (problem appear in tw only) : bg-red , bg-green
    return twMerge(clsx(inputs))
}


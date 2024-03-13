// schema validation for message api endpoint

import {z} from 'zod'

// post req should always contain metioned schema req
export const sendMessageValidator = z.object({
    fileId : z.string(),
    message : z.string()
})
import { Response } from 'express'
import config from 'src/config'

type Redirect = {
    to: string
    toClient?: boolean
    params?: Map<string, string>
}

export function handleRedirect(res: Response, redirect: Redirect) {
    // Config
    const configService = config()
    let toRedirect = `${
        redirect.toClient
            ? `http${configService.node_env === 'prod' ? 's' : ''}://${
                  configService.client_url
              }`
            : ''
    }${redirect.to}`
    if (redirect.params) {
        let i = 0
        redirect.params.forEach((value, key) => {
            toRedirect += `${i === 0 ? '?' : '&'}${key}=${value}`
            i++
        })
    }
    return res.redirect(toRedirect)
}

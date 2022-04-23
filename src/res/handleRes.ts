import { Response } from 'express'

export default function (body: any, res: Response) {
    res.json({
        success: true,
        body,
    })
}

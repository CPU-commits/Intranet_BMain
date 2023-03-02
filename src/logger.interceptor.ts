import {
    CallHandler,
    ExecutionContext,
    Inject,
    Injectable,
    Logger,
    NestInterceptor,
} from '@nestjs/common'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { Observable, of } from 'rxjs'
import { randomUUID } from 'crypto'
import { map, catchError } from 'rxjs/operators'

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    ) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const rpcContext = context.switchToRpc()
        const UNIQUE_INTERCEPTOR_ID = randomUUID()
        this.logger.log(
            `Req NATS ${UNIQUE_INTERCEPTOR_ID} - ${
                rpcContext.getContext().args[0]
            }`,
        )

        return next.handle().pipe(
            map((data) => {
                this.logger.log(`Success Req NATS ${UNIQUE_INTERCEPTOR_ID}`)
                return data
            }),
            catchError((err) => {
                console.log(err)
                this.logger.log(
                    `Failed Req NATS ${UNIQUE_INTERCEPTOR_ID} - ${
                        err?.message ?? 'Ha ocurrido un error'
                    }`,
                )
                return of({
                    success: false,
                    message: err?.message ?? 'Ha ocurrido un error',
                    status: err?.status ?? 500,
                })
            }),
        )
    }
}

import { registerAs } from '@nestjs/config'

export default registerAs('config', () => {
    return {
        port: parseInt(process.env.PORT, 10),
        client: {
            url: process.env.CLIENT_URI,
        },
        mongo: {
            dbName: process.env.MONGO_DB,
            host: process.env.MONGO_HOST,
            user: process.env.MONGO_ROOT_USERNAME,
            password: process.env.MONGO_ROOT_PASSWORD,
            port: parseInt(process.env.MONGO_PORT, 10),
            connection: process.env.MONGO_CONNECTION,
        },
        jwtSecret: process.env.JWT_SECRET_KEY,
        node_env: process.env.NODE_ENV,
    }
})

import config from '../config'

export function getNatsServers() {
    // Config
    const configService = config()

    const hosts = configService.nats.split(',')
    const ports = configService.nats.split(',')

    return hosts.map((host, i) => {
        return `nats://${host}:${ports[i]}`
    })
}

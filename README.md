# Microservice Main - Intranet

Microservice for the purpose of managing Main
## Installation

### Docker

`Dockerfile`

- Target: Development
- Target: Production

Exposed port: `3000`
## API Reference (Swagger)

#### Docs

```http
  GET /api/docs
```


## Requirements

- NATS Server
- MongoDB

## Environment Variables

| Variable              | Description                 | Required     |
| :-------------------- | :---------------------------| :------------|
| `JWT_SECRET_KEY`      | JWT Secret Authentication   | **Required** |
| `MONGO_DB`            | MongoDB Database            | **Required** |
| `MONGO_ROOT_USERNAME` | MongoDB Root Username       | **Required** |
| `MONGO_ROOT_PASSWORD` | MongoDB Root Password       | **Required** |
| `MONGO_HOST`          | MongoDB Host                | **Required** |
| `MONGO_CONNECTION`    | MongoDB Type Connection     | **Required** |
| `NATS_HOST`           | NATS Host                   | **Required** |
| `AWS_BUCKET`          | AWS Bucket                  | **Required** |
| `CLIENT_URL`          | Public URL Client           | **Required** |
| `NATS_HOST`           | Nats Host                   | **Required** |
| `NODE_ENV`            | Node ENV                    | **Required** |
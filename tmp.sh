docker network create --driver bridge vaj

docker pull postgres:14.19-trixie
docker run -d --name vaj-postgres -e POSTGRES_PASSWORD=postgresql -p 5432:5432 --network vaj postgres

docker pull redis/redis-stack:7.4.0-v8
docker run -d --name vaj-redis -p 127.0.0.1:1231:6379 -p 127.0.0.1:1232:8001 -e REDIS_ARGS="--requirepass redis-password --appendonly yes" --network vaj redis/redis-stack

docker build -f src/be/Dockerfile.vaj-be -t vaj-be --build-arg STAGE=dev --build-arg CONTAINER_PORT=1230 .

docker run -it --rm -p 1230:1230 --network vaj --name vaj-be --env-file src/be/.env.vaj-be.dev --env DATABASE_HOST=vaj-postgres --env REDIS_HOST=vaj-redis --env REDIS_PORT=6379 --entrypoint /bin/bash vaj-be

docker run -p 1230:1230 --network vaj --name vaj-be --env-file src/be/.env.vaj-be.dev --env DATABASE_HOST=vaj-postgres --env REDIS_HOST=vaj-redis --env REDIS_PORT=6379 vaj-be

docker stop vaj-be &> /dev/null && docker stop vaj-postgres &> /dev/null && docker stop vaj-redis &> /dev/null

docker start vaj-postgres && docker start vaj-redis && docker start vaj-be
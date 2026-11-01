source src/be/.env.vaj-be.dev
docker network create --driver bridge vaj &> /dev/null

docker compose --env-file src/be/.env.vaj-be.dev -f compose.yml up --detach

docker build -f src/be/Dockerfile.vaj-be -t vaj-be --build-arg STAGE=dev --build-arg CONTAINER_PORT=1230 .
docker run -p 1230:1230 --network vaj --name vaj-be vaj-be

# Things to figure out:
- Hosts
- Start and end script

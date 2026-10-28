#!/bin/bash

for arg in $@
do
    case $x in
        "-s" )
            STAGE=$arg ;;
        "-i" )
            IMAGE=$arg ;;
    esac
    x=$arg
done

if [[ -z "${STAGE}" || -z "${IMAGE}" ]]
then
    echo "Invalid command. Try this syntax instead: "
    echo "$0 -i <image> -s <stage>"
    exit 1
fi

export DOCKER_BUILDKIT=1;

if [[ $IMAGE = "vaj-be" ]]
then
    DOCKER_PORT=1111
    source src/be/.env.vaj-be.$STAGE # enables to read in VAJ_APPLICATION_PORT

    docker build -f ./src/be/Dockerfile.vaj-be -t vaj-be --progress=plain --build-arg STAGE="${STAGE}" --build-arg DOCKER_PORT=$DOCKER_PORT .
    docker run -p $DOCKER_PORT:$VAJ_APPLICATION_PORT $IMAGE
else
    echo "Unknown docker image: \"${IMAGE}\"."
    exit 1
fi

#!/bin/bash

if node dist/be/scripts/database/database-migrate.js $ENVIRONMENT; then
    :
else
    if node dist/be/scripts/database/database-restore.js $ENVIRONMENT; then
        :
    else
        node dist/be/scripts/database/database-setup.js $ENVIRONMENT
    fi
    node dist/be/scripts/database/database-migrate.js detach $ENVIRONMENT
fi

exec node dist/be/api/server.js $ENVIRONMENT
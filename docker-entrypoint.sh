#!/bin/bash
set -e

# Prompt for stage
STAGE=""
while [ "$STAGE" != "dev" ] && [ "$STAGE" != "prod" ]; do
    read -p "Enter developmental stage [prod/dev] (default: dev): " STAGE
    STAGE=${STAGE:-dev}
    if [ "$STAGE" != "dev" ] && [ "$STAGE" != "prod" ]; then
        echo "Invalid stage: $STAGE"
        echo "Please try again."
    fi
done
echo "Selected stage: $STAGE"

# Start PostgreSQL in the background
service postgresql start

# Prompt for password
read -sp "Enter Postgres password for 'postgres' user: " POSTGRES_PASSWORD
echo

# Change postgres password
echo "ALTER USER postgres PASSWORD '${POSTGRES_PASSWORD}';" | su - postgres -c psql

# Setup the database
npm run database-setup "$STAGE"

# Load the database backup
npm run database-restore "$STAGE"

# Start server in background
npm run server "$STAGE" &

# Drop into an interactive bash shell
exec bash


#!/bin/bash
set -e

# Start PostgreSQL in the background
service postgresql start

# Prompt for password
read -sp "Enter Postgres password for 'postgres' user: " POSTGRES_PASSWORD
echo

# Change postgres password
echo "ALTER USER postgres PASSWORD '${POSTGRES_PASSWORD}';" | su - postgres -c psql

# Setup the database
npm run database-setup dev

# Load the database backup
npm run database-restore dev

# Start Node app
exec npm run server dev

# Vintage Archive Jungle

## Table of Contents

1. [Node.js](#1-nodejs)
2. [Environmental Variables](#2-environmental-variables)
3. [Database](#3-database)
   1. [Setting Up a PostgreSQL Server and Create a Client Connection With pgAdmin](#31-setting-up-a-postgresql-server-and-create-a-client-connection-with-pgadmin)
   2. [Setting Up the Database](#32-setting-up-the-database)
   3. [Restoring the Database](#33-restoring-the-database)
   4. [Backup of the Database](#34-backup-of-the-database)

## Introduction

This document provides a step-by-step guide to setting up the **Vintage Archive Jungle** development environment. It includes instructions for installing Node.js, configuring environment variables, and managing a PostgreSQL database.

> *Note: These instructions assume you are working in a Bash shell environment.*

## 1. Node.js

Most of the development in this project is made in Node.js. To get started with development in this project you will have to visit the [official Node.js website](https://nodejs.org/en), download and excute the installer for your operating system. You can control wether Node.js was correctly installed by starting a terminal and run the command:

```shell
node --version
```

Node.js comes with the node version manager (nvm), which can be used to install and switch to Node.js v22.15.0 using the following command:

```shell
nvm install 22.15.0
nvm use 22.15.0
```

It is not a madatory requirement, but you can as well use the same version (v.10.9.2) of the node package manager (npm) by running the command in your terminal:

```shell
npm install -g npm@10.9.2
```

Finally to install all the third-paty Node.js modules you will have to run the command:

```shell
npm install
```

## 2. Environmental Variables

To leverage all the functionalities of this developmental project you will have to also include one or more environmental files with the developmental variables requires in this project. All the environmental file names should comply with these two citerias: (1) start with the prefix `.env`, and (2) have either `dev` or `prod` anywhere else in the name.

To correctly setup an envronmental file it must include the following variables (e.g. `.env-dev`):

```
# Database variables
DATABASE_NAME=vintage_archive_jungle
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=administrator
```

## 3. Database

### 3.1. Setting Up a PostgreSQL Server and Create a Client Connection With pgAdmin

Follow these simple instructions for setting up a PostgreSQL server and connecting to it with pgAdmin:

1. Install the database engine (`postgres`), the command-line client (`psql`), and background services from the official [website](https://www.postgresql.org/).

2. Initialize a database cluster to generate a structured directory containing your databases and configuration files. Use the command:
   
   ```shell
   initdb -D /usr/local/pgsql/data
   ```

3. Create a `postgres` role to act as entry point into the database system for administrative tasks.
   
   ```shell
   createuser -s postgres
   ```

4. Start a PostgreSQL server process to accept database connections and handle client queries in the background:
   
   ```shell
   sudo service postgresql start
   ```
   
   By default, the server will accept connections and requests from the `localhost` on port `5432`.

5. Create a client connection between the running PostgreSQL server and pgAdmin. Install the latter from the official [website](https://www.pgadmin.org/). To connect with pgAdmin, open the app and select **Add New Server**. In the **General** tab, enter a name for the connection. In the **Connection** tab, provide the _Host_ (e.g., `localhost`), _Port_ (`5432` by default), _Username_ (e.g., `postgres`), and your _Password_. Once saved, pgAdmin will connect and display a graphical interface to manage databases and users.

6. Once terminating the client connection with pgAdmin, the server PostgreSQL server process can be terminated:
   
   ```shell
   sudo service postgresql stop
   ```

[Here](https://tableplus.com/blog/2018/10/how-to-start-stop-restart-postgresql-server.html) is some usefull link for starting up a PostgreSQL server.

### 3.2 Setting Up the Database

Whenever seting up this project for the first time on your machine it is recommended to run the database setup script. It is an `npm` script that you can run using the following command:

```shell
npm run database-setup dev
```

This script helps setting up the `vintage_archive_jungle` database, the `shop` schema, and create a new user on the database named `administrator` with certain privileges.

> *All npm scripts in this project requires to provide `dev` or `prod` as latest argument, to enable reading the variables from your corresponding `.env` files.*

### 3.3 Restoring the Database

The project includes two backups of the database: (1) _a full archive_ of the database with all its data, and (2) _a schema-only archive_ of the database. These files can be used to load a copy of the database for this project. To load such a backup you can use the database restore script. It is another `npm` script that relies on the `pg_restore` utility and which you can execute using the command:

```shell
npm run database-restore dev
```

The script will prompt you to choose which type of backup you would like to run, either the entire database or only the schema.

### 3.4 Backup of the Database

The project also provides an npm script that enables to create a backup of the database with the `pg_dump` utility and can be executed using the command:

```shell
npm run database-backup dev
```

Again, it asks whether the backup should be for the entire database including the data or just the schema.


## 4. Fly.io

https://fly.io/docs/js/the-basics/

## 5. Docker

docker build -t vaj-be:1.0.0 .
docker run -it -p 1111:1111 vaj-be:1.0.0
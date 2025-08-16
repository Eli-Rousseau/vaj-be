# Vintage Archive Jungle

## Table of Contents

1. [Introduction](#introduction)
2. [Development](#development)
   - [Dependencies](#dependencies)
     - [Cloning the Repository](#a-cloning-the-repository)
     - [Node.js](#b-nodejs)
     - [Environmental Variables](#c-environmental-variables)
     - [Database](#d-database)
       - [Setting Up a PostgreSQL Server and Creating the User](#setting-up-a-postgresql-server-and-creating-the-user)
       - [Setting Up the Database](#setting-up-the-database)
       - [Restoring the Database](#restoring-the-database)
       - [Backup of the Database](#backup-of-the-database)
     - [Cloud Storage](#e-cloud-storage)
   - [Server](#server)
     - [Authentication](#a-authentication)
     - [Rate Limiting](#b-rate-limiting)
     - [Routing](#c-routing)
3. [Container](#container)
4. [Web Application](#web-application)
   - [Domain](#domain)
   - [Email Provider](#email-provider)
   - [Hosting](#hosting)

## 1. Introduction

This repository is one of two development projects for **Vintage Archive Jungle**, a personal initiative I work on outside my regular office hours. This part focuses on the backend, with an emphasis on the database and data processing workflows. Its sister project (coming soon) will cover the frontend. Together, they form a complete webshop application for Vintage Archive Jungle.

In this README, you’ll find instructions for setting up the project for development, guidance on running it in a Docker container, and a brief look at how the project came to life. The code is version-controlled with Git and will be publicly available on my personal GitHub page.

This is my first independently developed, production-ready project, so I’m open to feedback and suggestions. Feel free to reach out if you’d like to know more.

## 2. Development

### Dependencies

This section provides a step-by-step guide for setting up the Vintage Archive Jungle development environment so you can reproduce the exact conditions I’ve been working with.

> **Note:** These instructions assume you are using a Bash shell.

#### a. Cloning the Repository

First, make sure you have **Git** installed. You can download it for free from the [official Git website](https://git-scm.com/). Download and run the installer for your operating system, then open a terminal. Navigate to the directory where you want to install the project, and run the following command to clone the repository:

```shell
gh repo clone Eli-Rousseau/vaj-be
```

If you’d like to contribute, you can fork the repository on GitHub and submit a pull request with your proposed changes.

#### b. Node.js

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

#### c. Environmental Variables

To leverage all the functionalities of this developmental project you will have to also include one or more environmental files with the developmental variables requires in this project. All the environmental file names should comply with these two citerias: (1) start with the prefix `.env`, and (2) have either `dev` or `prod` anywhere else in the name. To see the list of required variables to provide in the `.env` files, a `.dev-example` file has been added to root of the project with some mock values for each of the variables used in this project.

#### d. Database

##### Setting Up a PostgreSQL Server and Create a Client Connection With pgAdmin

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

##### Setting Up the Database

Whenever seting up this project for the first time on your machine it is recommended to run the database setup script. It is an `npm` script that you can run using the following command:

```shell
npm run database-setup dev
```

This script helps setting up the `vintage_archive_jungle` database, the `shop` schema, and create a new user on the database named `administrator` with certain privileges.

> _All npm scripts in this project requires to provide `dev` or `prod` as latest argument, to enable reading the variables from your corresponding `.env` files._

##### Restoring the Database

The project includes two backups of the database: (1) _a full archive_ of the database with all its data, and (2) _a schema-only archive_ of the database. These files can be used to load a copy of the database for this project. To load such a backup you can use the database restore script. It is another `npm` script that relies on the `pg_restore` utility and which you can execute using the command:

```shell
npm run database-restore dev
```

The script will prompt you to choose which type of backup you would like to run, either the entire database or only the schema.

##### Backup of the Database

The project also provides an npm script that enables to create a backup of the database with the `pg_dump` utility and can be executed using the command:

```shell
npm run database-backup dev
```

Again, it asks whether the backup should be for the entire database including the data or just the schema.

#### e. Cloud Storage

Backblaze B2 has been selected as the cloud storage provider for this project. B2 offers an S3-compatible bucket storage system. For this project, two buckets have been configured: one with public access and another with private access. Both are managed through a single application key configured with full privileges for both buckets.

Ensure that the required B2 environment variables are added to your `.env` files. We have also developed a set of utilities built on the native B2 API that provide basic functionality for uploading and retrieving objects from the cloud.

### Server

An API has been set up for this project to serve as the connection between the backend and the frontend. In development, the server listens for requests on `localhost` port `1111`. You can start it by running:

```bash
npm run server dev
```

Without going into full detail about the API specifications, requests, and responses, the following key points are worth noting:

#### a. Authentication

Every HTTP request must include at least one API token in the request headers as `x-api-key`. You can generate a token by running:

```bash
npm run generate-api-key dev
```

This will create a key you can copy into your `.env` file. Any request to the server must include one of the keys defined under the `VAJ_API_KEY_X` variables in `.env`.

#### b. Rate Limiting

The API enforces global rate limiting using a fixed-window counter strategy to prevent excessive usage.

#### c. Routing

The API currently acts as a gateway for two main route groups:

1. **`/database` routes** – Allow direct interaction with database tables via `GET`, `POST`, `PUT`, and `DELETE` requests.

2. **`/service` routes** – Trigger project-specific processes, typically initiated from frontend functionality. Documentation for core services will expand as the project evolves.

## 3. Container

Not everyone may want to set up the full development environment locally, so this project includes a Dockerfile that allows anyone with Docker installed to run the server inside a container. To do so, first clone the project from GitHub as described in the development section, then install Docker from the [official Docker website](https://www.docker.com/). Open a shell, navigate to the root of the project, and run the following command to build the image and start the container, respectively:

```shell
docker build -t vaj-be:1.0.0 .
docker run -it -p 1111:1111 vaj-be:1.0.0
```

The container’s entrypoint script will prompt you for interactive input (such as environment selection) before launching the server.

You can stop the server at any time by pressing `CTRL + C`, which will drop you into the container’s shell without shutting it down completely.

## 4. Web Application

In this section, I will briefly explain how the project and its full web application were brought online, along with the key steps involved in making it live.

### Domain

The domain name `vintagearchivejungle.com` was purchased through the registrar [domain.com](https://www.domain.com/).

### Email Provider

For email services, we chose [Zoho Mail](https://www.zoho.com/mail/) as the primary provider. DNS records were configured within Zoho to properly link the domain to Zoho’s mail servers, ensuring reliable delivery and domain authentication. A number of user accounts were set up on Zoho under the free plan, and all application-generated emails are sent through this service.

### Hosting

[Fly.io](https://fly.io/docs/js/the-basics/)

More documentation on this soon ...

# Vintage Archive Jungle (VAJ)

## 1. Introduction

Welcome to **Vintage Archive Jungle (VAJ)**, and thank you for your interest in the project!

Vintage Archive Jungle is a personal web application designed to serve as a customized webshop supporting the business of @urlocal_girl.

This README provides an overview of the project's architecture and technology stack, explains how to set up a local development environment, describes how to run the application using Docker, and outlines the guidelines for contributing to the project.

Whether you are here to explore the codebase, develop new features, or contribute to the project, this document should help you get started.

## 2. Technology Stack

### 2.1 Architecture

The project follows a monorepository architecture, organized into three main components:

- Backend (BE): Handles application logic, data processing, and API endpoints.

- Frontend (FE): Provides the user interface and client-side functionality.

- Core: Contains shared dependencies, utilities, and resources used across multiple components.

Each component is designed to operate independently. However, to simplify local development, dependencies are currently shared across the monorepository. In production, components are packaged and deployed independently.

### 2.2 Technologies & Services

The project relies on a collection of technologies and third-party services, grouped by their respective domains and responsibilities.

| Category            | Technology / Provider | Version |
| ------------------- | --------------------- | ------- |
| **Runtime**         | Node.js               | 24.4    |
| **Package Manager** | npm                   | —       |
| **Database**        | PostgreSQL            | 18.1    |
| **Caching**         | Redis                 | 7.4     |
| **Cloud Storage**   | Backblaze B2          | —       |
| **HTTP Server**     | Express               | 5.2.1   |
| **API**             | GraphQL Yoga          | 5.17.1  |

## 3. Development Environment

This section describes how to configure and run the project locally.

### 3.1 Prerequisites

Before getting started, make sure the following dependencies are installed on your operating system:

| Dependency | Minimum version | Required               |
| ---------- | --------------- | ---------------------- |
| Git        | 2.56            | Yes                    |
| Node.js    | 24.4            | Yes                    |
| Docker     | 29.9            | Yes                    |
| Git-Crypt  | 0.8             | Yes                    |
| PostgreSQL | 18.1            | Optional (recommended) |

Once the prerequisites are installed, open a terminal and navigate to the directory where you want to store the project.

### 3.2 Clone the Repository

Clone the repository using Git:

```
git clone <repository-url>
```

Navigate into the project directory:

```
cd vintage-archive-jungle
```

### 3.3 Install Dependencies

Install the project's Node.js dependencies from the repository root:

```
npm install
```

This will install the third-party packages defined in `package.json`.

### 3.4 Decrypt Environment Variables

Environment-specific configuration files are encrypted using Git-Crypt to protect sensitive information.

To access these files, you must request the Git-Crypt key from the project administrator.

Once you have received the key, store it in a secure location outside the repository.

Unlock the encrypted files by running:

```
git-crypt unlock /path/to/git-crypt-key
```

After successfully unlocking the repository, the encrypted environment files will become accessible.

**Important:** Never commit or share the Git-Crypt key, decrypted secrets, or other sensitive configuration files.

### 3.5 Start the Backend

Before starting the backend application, make sure the required infrastructure services are running.

#### 3.5.1 Redis

Start the Redis server using the following npm script:

```
npm run redis
```

#### 3.5.2 PostgreSQL

There are two ways to initialize the development database, depending on your needs.

**Option 1: Create a fresh database**

Use this option if you want to start with an empty database and apply the available migrations.

```
npm run database-setup
npm run database-migrate
```

**Option 2: Restore a development database**

Use this option if you prefer working with a pre-populated database containing existing development data.

```
npm run database-restore
```

**Database backup**

After completing your development work, you can create a backup of the current database state:

```
npm run database-backup
```

This allows you to preserve your development data for future use.

#### 3.5.3 Backend Application

Once Redis and PostgreSQL are running and properly configured, start the backend development server:

```
npm run vaj-be dev
```

The backend should now be running and ready to accept requests.

#### 3.5.4 Development Interfaces

The development environment also provides access to the following web-based interfaces:

| Interface        | URL                                    | Description                                                                              |
| ---------------- | -------------------------------------- | ---------------------------------------------------------------------------------------- |
| **GraphiQL**     | http://localhost:1230/api/v1/graphql   | Interactive GraphQL IDE for exploring the API, executing queries, and testing mutations. |
| **RedisInsight** | [Redis Insight](http://localhost:1232) | Web-based interface for inspecting and managing the Redis instance.                      |

Both interfaces are intended for development and debugging purposes.

## 4. Running the Project with Docker

This section describes how to run the project using Docker containers instead of installing and managing the infrastructure services directly on your host machine.

### 4.1 Prerequisites

Make sure Docker v29.9 or higher is installed and running on your operating system.

### 4.2 Clone the Repository

If you have not already cloned the repository, run:

```
git clone <repository-url>
cd vintage-archive-jungle
```

### 4.3 Decrypt Environment Variables

As described in [Section 3.4](#34-decrypt-environment-variables), request the Git-Crypt key from the project administrator.

Unlock the encrypted files:

```
git-crypt unlock /path/to/git-crypt-key
```

Ensure that the Docker environment configuration files are accessible before proceeding.

### 4.4 Create the Docker Network

Create a dedicated bridge network to allow the application containers to communicate with each other:

```
docker network create --driver bridge vaj
```

### 4.5 Start PostgreSQL

Pull the PostgreSQL image:

```
docker pull postgres:18.1
```

Create and start the PostgreSQL container:

```
docker run -d --name vaj-postgres --network vaj -e POSTGRES_PASSWORD=postgresql -p 5432:5432 -v vaj-postgres-data:/var/lib/postgresql postgres:18.1
```

The named Docker volume ensures that database data persists when the container is stopped or recreated.

### 4.6 Start Redis

Pull the Redis Stack image:

```
docker pull redis/redis-stack:7.4.0-v8
```

Create and start the Redis container:

```
docker run -d --name vaj-redis --network vaj -p 127.0.0.1:1231:6379 -p 127.0.0.1:1232:8001 -e REDIS_ARGS="--requirepass redis-password --appendonly yes" redis/redis-stack:7.4.0-v8
```

The Redis service will be accessible through the mapped host ports:

- `1231`: Redis server.

- `1232`: RedisInsight web interface.

### 4.7 Build the Backend Image

Build the backend Docker image from the repository root:

```
docker build -f src/be/Dockerfile.vaj-be -t vaj-be --build-arg STAGE=dev --build-arg CONTAINER_PORT=1230 .
```

### 4.8 Run the Backend Container

#### 4.8.1 Interactive mode

Start an interactive Bash session inside the container:

```
docker run -it --rm -p 1230:1230 --network vaj --name vaj-be --env-file src/be/.env.vaj-be.dev --env DATABASE_HOST=vaj-postgres --env REDIS_HOST=vaj-redis --env REDIS_PORT=6379 --entrypoint /bin/bash vaj-be
```

Inside the session you will be able to run a number of essential production scripts.

**Create a fresh database:**

```
node dist/be/scripts/database-setup.js
node dist/be/scripts/database-migrate.js
```

**Restore a development database:**

```
node dist/be/scripts/database-restore.js
```

#### 4.8.2 Detached mode

Finally, start the backend container in the background:

```
docker run -d -p 1230:1230 --network vaj --name vaj-be --env-file src/be/.env.vaj-be.dev --env DATABASE_HOST=vaj-postgres --env REDIS_HOST=vaj-redis --env REDIS_PORT=6379 vaj-be
```

### 4.9 Stop and Restart Containers

To stop all project containers:

```
docker stop vaj-be vaj-postgres vaj-redis
```

To restart them:

```
docker start vaj-postgres vaj-redis vaj-be
```

The infrastructure services are started before the backend to ensure that the required dependencies are available.

## 5. Community Contributions

Contributions are welcome!

To keep the development process organized and maintain a clean Git history, the project follows a feature branch workflow.

If you are unfamiliar with this approach, the following video provides a useful introduction:

[Git Feature Branch Workflow – Tutorial](https://www.youtube.com/watch?v=ZBexzpgj1GE)

### 5.1 Contribution Workflow

The general workflow consists of the following steps:

**1. Synchronize your local repository**

Start by updating your local copy of the main development branch:

```
git checkout main
git pull origin main
```

**2. Create a feature branch**

Create a dedicated branch for your contribution:

```
git checkout -b feature/your-feature-name
```

**3. Implement your changes**

Work on your feature or bug fix within the newly created branch.

Try to keep commits focused and descriptive.

```
git add .
git commit -m "feat: add product catalog"
```

**4. Push your branch**

Publish your branch to the remote repository:

```
git push -u origin feature/your-feature-name
```

**5. Open a Pull Request**

Once your changes are ready, open a Pull Request targeting the `main` branch.

Provide a short description of your changes and any relevant information needed for review.

**6. Review and merge**

The project administrator will review the proposed changes, request modifications if necessary, and merge the contribution once it is approved.

Please avoid pushing directly to the `main` branch.

# Vintage Archive Jungle

This document serves as a guide with concise guidelines to help you setting up all the requirements of this development project. Note that this guides assumes one is working in a bash shell.

## 1. Database

#### 1.1 Setting Up a PostgreSQL Server and Create a Client Connection With pgAdmin

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

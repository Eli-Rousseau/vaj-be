FROM node:24.4.1-bullseye

RUN apt-get update \
    && apt-get install -y curl gnupg lsb-release \
    && curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /usr/share/keyrings/postgres.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/postgres.gpg] http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \
       > /etc/apt/sources.list.d/postgres.list \
    && apt-get update \
    && apt-get install -y postgresql-14 postgresql-client-14 \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -r vaj && useradd -r -g vaj -d /vaj-be -s /bin/bash vaj

WORKDIR /vaj-be
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 8080

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]

FROM node:22.22.2-bookworm-slim

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml ./

RUN corepack prepare pnpm@10.14.0 --activate \
    && pnpm install --frozen-lockfile

COPY . .

EXPOSE 4000

CMD ["pnpm", "start:docker"]

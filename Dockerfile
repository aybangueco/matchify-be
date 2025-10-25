# Image to use
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Installing production dependencies
FROM base AS deps
RUN mkdir -p /temp/deps
COPY package.json bun.lock /temp/deps/
RUN cd /temp/deps && bun install --frozen-lockfile --production

# Production image release
FROM base AS production
COPY --from=deps /temp/deps/node_modules node_modules
COPY . .

# Set ENV Variables
ENV ENV=production

# Run the app
USER bun
ENTRYPOINT [ "bun", "run", "start" ]

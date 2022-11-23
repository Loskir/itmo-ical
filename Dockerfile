FROM node:18-alpine as builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile && yarn cache clean

COPY . .

RUN yarn build-ts

RUN yarn install --frozen-lockfile --prod && yarn cache clean

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app /app

CMD ["yarn", "run", "run-dist"]

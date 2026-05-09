FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
ARG VITE_WS_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app

RUN addgroup -g 1001 nodejs && adduser -u 1001 -G nodejs -S nodejs
RUN npm i -g serve

COPY --from=build /app/dist ./dist

USER nodejs
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]

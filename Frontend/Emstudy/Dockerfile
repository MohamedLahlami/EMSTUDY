# Frontend : frontend/Dockerfile
FROM node:16-alpine AS build
WORKDIR /app
COPY Frontend/Emstudy/package*.json ./
RUN npm ci
COPY Frontend/Emstudy/. .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]

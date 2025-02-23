FROM node:22.13.1-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build-prod

# Etapa de runtime con un servidor ligero (Nginx)
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist/miw-frontend-foro/browser/ ./
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

#
#> docker build -t miw-frontend-foro-prod .
#> docker run -it -p 8080:80 --name miw-frontend-foro-prod-app miw-frontend-foro-prod

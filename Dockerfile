FROM node:16-alpine AS webapp

WORKDIR /webapp/
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build


FROM gisquick/mpa-base

COPY --from=webapp /webapp/dist/ /var/www
CMD ["copy-assets", "--cleanup", "static/settings/:admin/:user/", "/var/www", "/assets/"]

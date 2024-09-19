# build environment
FROM node:22-alpine as build
WORKDIR /home/node/app
COPY . .
RUN npm install
RUN npm run build
# production environment
FROM nginx:stable-alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /home/node/app/build /usr/share/nginx/html
COPY --from=build /home/node/app/nginx/nginx.conf /etc/nginx/conf.d/default.conf
RUN chown -R nginx:nginx /usr/share/nginx/html/*
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
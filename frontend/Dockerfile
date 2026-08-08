FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf.template
COPY env.js.template /etc/nginx/env.js.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

COPY src /usr/share/nginx/html

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

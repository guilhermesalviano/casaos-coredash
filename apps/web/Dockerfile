FROM node:20-alpine

RUN apk add --no-cache tzdata

WORKDIR /app

COPY apps/web/package*.json ./

RUN npm install

COPY apps/web/ .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
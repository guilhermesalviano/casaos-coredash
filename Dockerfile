FROM node:20-alpine

RUN apk add --no-cache tzdata
ENV TZ=${TZ}

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
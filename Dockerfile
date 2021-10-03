FROM node 

WORKDIR /app

COPY package.json .

RUN npm install

EXPOSE 8000

COPY . .

CMD ["node", "server.js"]
FROM node:18
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
EXPOSE 4000
CMD ["sh", "-c", "node src/seed.js && node src/server.js"]

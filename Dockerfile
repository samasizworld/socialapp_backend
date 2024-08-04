FROM node:20.11.1-alpine

WORKDIR /usr/nestapi/

COPY . .
RUN npm install
RUN npm install -g typescript
RUN npm rebuild

CMD ["npm", "run", "start:dev"]
FROM node:10

RUN mkdir -p /src 

WORKDIR /src 

COPY app/package*.json ./

RUN npm install 

COPY /app .

EXPOSE 3000

CMD ["npm","start"]


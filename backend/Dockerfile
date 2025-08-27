FROM node:20

WORKDIR /app

COPY package*.json ./
# RUN npm install
# RUN npm install -g nodemon
RUN npm ci --omit=dev
COPY . .
ENV NODE_ENV=production
EXPOSE 5000 

# Start the app
CMD ["node", "app.js"]

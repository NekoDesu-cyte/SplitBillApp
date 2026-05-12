# Use Debian-slim (NOT Alpine) — required for @google-cloud/vision native modules
FROM node:20-slim

WORKDIR /usr/src/app

# Salin package files dulu untuk cache layer
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Salin semua source code
COPY . .

# Pastikan folder tmp tersedia untuk multer
RUN mkdir -p /tmp/uploads

EXPOSE 8080

CMD [ "node", "server.js" ]
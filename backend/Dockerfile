FROM node:20-slim

# Install tools yang diwajibkan oleh module native Node.js
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Hanya copy package.json agar build-nya fresh
COPY package.json ./
RUN npm install

# Copy sisa kode
COPY . .

# Siapkan folder multer
RUN mkdir -p /tmp/uploads

EXPOSE 8080

CMD ["node", "server.js"]
FROM node:20-alpine

WORKDIR /usr/src/app

# Salin package files
COPY package*.json ./

# Gunakan npm install jika npm ci bermasalah dengan package-lock yang tidak update
RUN npm install --only=production

# Salin semua file
COPY . .

# Pastikan folder tmp tersedia untuk multer
RUN mkdir -p /tmp/uploads

# Pastikan tidak ada hardcode ke file JSON di langkah RUN manapun
# Jika ada langkah build (seperti tsc), pastikan tidak butuh file JSON tersebut

EXPOSE 8080

# Jalankan langsung dengan node untuk melihat error lebih jelas jika start script bermasalah
CMD [ "node", "server.js" ]
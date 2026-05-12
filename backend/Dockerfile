# Gunakan image Node.js versi 20 berbasis Alpine Linux yang ringan
FROM node:20-alpine

# Buat direktori kerja di dalam kontainer
WORKDIR /usr/src/app

# Salin file konfigurasi npm
COPY package*.json ./

# Install dependensi khusus production (menghindari devDependencies jika ada)
RUN npm ci --only=production

# Salin seluruh file proyek backend, termasuk kredensial bagibayar-9f5639182963.json
COPY . .

# Buat folder penampungan sementara untuk multer agar terhindar dari error direktori tidak ditemukan
RUN mkdir -p uploads && mkdir -p /tmp/uploads

# Ekspos port standar Cloud Run
EXPOSE 8080

# Jalankan server
CMD [ "npm", "start" ]

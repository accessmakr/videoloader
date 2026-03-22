


FROM node:18

# Install system dependencies
RUN apt-get update && apt-get install -y python3 python3-pip ffmpeg

# Install LATEST yt-dlp (git master = nightly fixes for YouTube 2026)
RUN pip3 install --upgrade git+https://github.com/yt-dlp/yt-dlp.git --break-system-packages

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Copy all files
COPY . .

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server.js"]

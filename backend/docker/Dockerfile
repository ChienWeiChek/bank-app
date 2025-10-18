FROM denoland/deno:latest

WORKDIR /app

# Copy dependency files
COPY deno.json ./

# Cache dependencies
RUN deno cache deno.json

# Copy source code
COPY src/ ./src/

# Create necessary directories
RUN mkdir -p database/migrations

# Expose port
EXPOSE 8000

# Start application
CMD ["run", "--allow-net", "--allow-read", "--allow-write", "--allow-env", "src/main.ts"]

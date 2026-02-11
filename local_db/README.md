# Local Database Setup
1. Install Docker Desktop for you OS: https://www.docker.com/products/docker-desktop/
2. From the my_sql directory run this following command to run the container containing the local MySql database:\
    `docker compose up -d`
3. If you want to access the database in MySql Workbench, just use the connection string found in `backend/WebApi/appsettings.Development.json`
4. The local database container can now also be started and stopped from Docker Desktop.
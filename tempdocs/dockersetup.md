I have prepared the complete Dockerization setup for your ThinkPad X230 server workflow!
Since you'll be developing on your laptop and syncing files to the ThinkPad (192.168.1.100), I've configured the Docker setup specifically to support live-reloading over synced directories.
Here are the files I've created for your setup:
docker-compose.yml: The main orchestration file. It mounts your project directory as a volume (.:/app) so any files you copy over to the ThinkPad will instantly reflect in the running container. I also added the CHOKIDAR_USEPOLLING=true environment variable, which is crucial for ensuring Vite detects file changes reliably when syncing files via scp or rsync.
Dockerfile.dev: A lightweight development image that installs dependencies and starts the Vite dev server, exposing it on port 3000.
Dockerfile & nginx.conf: A multi-stage production build setup. It builds the static React files and serves them using a highly optimized Nginx web server (for when you're ready to run the app in production mode).
.dockerignore: Ensures that your local node_modules or build artifacts aren't accidentally copied into the Docker build context, keeping the image builds fast.
How to use this workflow:
1. Initial Setup on the ThinkPad
Copy your entire project folder to the ThinkPad. Then, SSH into the ThinkPad, navigate to the project directory, and start the development container:
code
Bash
docker compose up -d deskfit-dev
2. Access the App
On your separate laptop, open your browser and navigate to:
code
Text
http://192.168.1.100:3000
3. Syncing Changes
As you make changes on your local laptop, simply sync the files to the ThinkPad. For example, using rsync:
code
Bash
rsync -avz --exclude 'node_modules' --exclude '.git' ./ user@192.168.1.100:/path/to/deskfit/
Because of the volume mount and polling configuration in the docker-compose.yml, Vite will instantly detect the synced files and hot-reload the application in your browser!
4. Production (Optional)
When you are ready to run the highly-optimized production version instead of the dev server, you can stop the dev container and run the production one:
code
Bash
docker compose down
docker compose up -d --build deskfit-prod
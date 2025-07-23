# podcast.io

A podcast platform that records in the best quality from the browser
🎙️ podcast.io

podcast.io is a self-hosted, high-fidelity recording platform inspired by Riverside.fm. It enables remote podcast recording with local track uploads, backend processing, and final downloadable media — built using a modern, scalable stack.
⚙️ Tech Stack

    Frontend: React (media capture, chunked uploads)

    Backend: Golang (REST API, media handling & processing)

    Database: MongoDB

    Storage: MinIO (S3-compatible)

🧱 Project Structure

podcast.io/
├── client/ # React frontend
│ ├── components/
│ ├── pages/
│ ├── hooks/
│ └── utils/
├── server/ # Golang backend
│ ├── handlers/
│ ├── routes/
│ ├── services/ # Chunk logic, ffmpeg utils
│ └── main.go
└── README.md

🛠️ Features

    🎤 Local recording with chunked video/audio uploads

    🔁 Automatic retries on upload failure (coming soon)

    🧩 MinIO for raw and processed media storage

    🧪 Golang backend with ffmpeg integration

    📦 MongoDB for session and metadata tracking

    📥 Final media is downloadable after processing

✅ Prerequisites

    Go

    Node.js

    ffmpeg installed and added to your system path

    Docker (used only to run MongoDB and MinIO)

🔧 Setup
Step 1: Run MongoDB & MinIO via Docker

You can copy-paste these into your terminal to spin up MongoDB and MinIO containers.
MongoDB

docker run -d --name mongo \
 -p 27017:27017 \
 mongo:latest

MinIO

docker run -d --name minio \
 -p 9000:9000 -p 9001:9001 \
 -e "MINIO_ROOT_USER=minioadmin" \
 -e "MINIO_ROOT_PASSWORD=minioadmin" \
 quay.io/minio/minio server /data --console-address ":9001"

MinIO Console: http://localhost:9001
Access Key: minioadmin
Secret Key: minioadmin
Step 2: Start the React Frontend

cd client
npm install
npm run dev

Step 3: Start the Golang Backend

cd server
go run main.go

📌 To-Do (Next Steps)

Build 1-on-1 Video Call feature using WebRTC

Redesign the Record Page UI while integrating WebRTC

Add Failure Handling for chunk upload issues (e.g., retry or alert)

Implement Audio/Video Processing (ffmpeg) in backend after upload

    Automatically Re-upload Final Media to MinIO for frontend to access

🤝 Contributing

Contributions are welcome! Please follow these steps:

    Fork this repository

    Create a new branch:
    git checkout -b feature/your-feature-name

    Make your changes

    Commit and push:
    git commit -m "Add: Your message"
    git push origin feature/your-feature-name

    Open a Pull Request

Code Style Guidelines

    Keep frontend components modular and reusable

    Keep backend handlers and services cleanly separated

    Use clear naming and comments where needed

    Follow single-responsibility principle when possible

📝 License

This project is open-source and available under the MIT License.

Let me know if you want to add a logo/banner or badges (like build status, license, etc.)!

ChatGPT can make mistakes. Check important info. See Cookie Preferences.

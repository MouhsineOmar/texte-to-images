# Text-to-Image Generation Application

A full-stack web application that generates images from textual descriptions using AI models.

## 🚀 Features

- **Text-to-Image Generation**: Convert text prompts into high-quality images
- **Modern Web Interface**: User-friendly frontend built with React/Vue
- **RESTful API**: Scalable backend with Python/FastAPI
- **Multiple Models**: Support for various AI image generation models
- **Image Gallery**: Browse and manage generated images
- **Download Options**: Export images in multiple formats

## 📁 Project Structure
texte-to-images/
├── backend/
│ ├── app.py # Main backend application
│ ├── requirements.txt # Python dependencies
│ ├── models/ # AI models and utilities
│ ├── api/ # API routes and endpoints
│ └── config/ # Configuration files
├── frontend/
│ ├── src/ # Frontend source code
│ ├── public/ # Static assets
│ ├── package.json # Node.js dependencies
│ └── README.md # Frontend documentation
├── backend.zip # Backend archive
├── frontend.zip # Frontend archive
└── README.md # This file

text

## 🛠️ Installation

### Backend Setup

1. **Navigate to backend directory:**
   cd backend
Install Python dependencies:


pip install -r requirements.txt
Set up environment variables:

cp .env.example .env
# Edit .env with your configuration
Run the backend server:

python app.py
# or
uvicorn main:app --reload
Frontend Setup
Navigate to frontend directory:

cd frontend
Install Node.js dependencies:


npm install
Start the development server:


npm start
# or
npm run dev
🌐 API Documentation
Endpoints
POST /api/generate - Generate image from text

json
{
  "prompt": "A beautiful sunset over mountains",
  "style": "realistic",
  "size": "1024x1024"
}
GET /api/images - List generated images

GET /api/images/{id} - Get specific image

DELETE /api/images/{id} - Delete image

🔧 Configuration
Backend Configuration
Create a .env file in the backend directory:

env
API_KEY=your_ai_api_key_here
MODEL_NAME=stable-diffusion-v2.1
IMAGE_SIZE=512x512
MAX_PROMPT_LENGTH=200
PORT=5000
Frontend Configuration
Update src/config.js:

javascript
const config = {
  apiUrl: 'http://localhost:5000/api',
  defaultPrompt: 'A magical forest with glowing mushrooms',
  defaultStyle: 'fantasy',
  availableSizes: ['256x256', '512x512', '1024x1024']
};
📦 Deployment
Docker Deployment

# Build and run with Docker Compose
docker-compose up --build
Manual Deployment
Backend:


cd backend
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app:app
Frontend:


cd frontend
npm run build
# Serve the build folder with Nginx/Apache
🤝 Contributing
Fork the repository

Create a feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

👥 Authors
Mouhsine Omar - Initial work

🙏 Acknowledgments
AI model providers (Stable Diffusion, DALL-E, etc.)

Open source community

Contributors and testers

📞 Support
For support, email: [omarmouhsine2000@gmail.com] or open an issue in the repository.

# Image Generation Backend

Cette API FastAPI permet de générer des images en utilisant Stable Diffusion et LoRA.

## Installation

1. Créez un environnement virtuel :
   ```bash
   python -m venv venv
   source venv/bin/activate  # Sur Windows: venv\Scripts\activate
   ```

2. Installez les dépendances :
   ```bash
   pip install -r requirements.txt
   ```

3. Lancez le serveur :
   ```bash
   python main.py
   ```

L'API sera disponible sur `http://localhost:8000`.

## Endpoints
- `GET /health` : Vérifie l'état du serveur.
- `POST /api/generate` : Génère une image à partir d'un prompt.
- `GET /api/models` : Informations sur les modèles chargés.

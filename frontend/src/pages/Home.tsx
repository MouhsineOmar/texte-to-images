import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import "./Home.css";

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="home-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-content">
          <h1 className="logo">✨ AI Image Generator</h1>
          <Button
            onClick={() => navigate("/generate")}
            className="nav-button"
          >
            Commencer
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Générez des images magnifiques avec l'IA
          </h1>
          <p className="hero-subtitle">
            Utilisez la puissance de Stable Diffusion fine-tuné pour créer des
            images uniques et époustouflantes
          </p>
          <Button
            onClick={() => navigate("/generate")}
            className="hero-button"
          >
            <Sparkles size={20} />
            Générer une image
          </Button>
        </div>
        <div className="hero-visual">🎨</div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Fonctionnalités</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Génération Rapide</h3>
            <p>Générez des images en quelques secondes avec notre modèle optimisé</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Contrôle Précis</h3>
            <p>Ajustez les paramètres pour obtenir exactement ce que vous voulez</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💾</div>
            <h3>Téléchargement Facile</h3>
            <p>Téléchargez vos images générées en haute qualité</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <h3>Design Élégant</h3>
            <p>Interface moderne et intuitive inspirée de ChatGPT</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Prêt à créer?</h2>
        <p>Commencez à générer vos images dès maintenant</p>
        <Button
          onClick={() => navigate("/generate")}
          className="cta-button"
        >
          Accéder au générateur
        </Button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2025 AI Image Generator. Tous droits réservés.</p>
      </footer>
    </div>
  );
}

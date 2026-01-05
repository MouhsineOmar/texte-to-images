import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">404 - Page non trouvée</h1>
      <Button onClick={() => navigate("/")}>Retour à l'accueil</Button>
    </div>
  );
}

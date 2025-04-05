import { Link } from "wouter";
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HandHelping } from "lucide-react";

const Footer = () => {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Em um aplicativo real, isso enviaria o email para cadastro na newsletter
    alert("Obrigado por se inscrever em nossa newsletter!");
  };

  return (
    <footer className="bg-neutral-dark text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <HandHelping className="text-accent mr-2" size={24} />
              <h3 className="text-lg font-heading font-bold">Sou Solidário</h3>
            </div>
            <p className="text-neutral-200 text-sm">
              Plataforma que conecta doadores a pessoas necessitadas em situações de emergência e desastres naturais.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-heading font-bold mb-4">Links Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/">
                  <a className="text-neutral-200 hover:text-white transition">Início</a>
                </Link>
              </li>
              <li>
                <Link href="/campanhas">
                  <a className="text-neutral-200 hover:text-white transition">Campanhas Ativas</a>
                </Link>
              </li>
              <li>
                <Link href="/doar/campanha">
                  <a className="text-neutral-200 hover:text-white transition">Como Doar</a>
                </Link>
              </li>
              <li>
                <Link href="/admin">
                  <a className="text-neutral-200 hover:text-white transition">Área Administrativa</a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-heading font-bold mb-4">Contato</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-accent mr-2" />
                <span>contato@sousolidario.org.br</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 text-accent mr-2" />
                <span>(11) 1234-5678</span>
              </li>
              <li className="flex items-center">
                <MapPin className="w-5 h-5 text-accent mr-2" />
                <span>São Paulo, SP</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-heading font-bold mb-4">Redes Sociais</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full w-10 h-10 flex items-center justify-center transition"
                aria-label="Facebook"
              >
                <Facebook className="text-white" size={18} />
              </a>
              <a
                href="#"
                className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full w-10 h-10 flex items-center justify-center transition"
                aria-label="Instagram"
              >
                <Instagram className="text-white" size={18} />
              </a>
              <a
                href="#"
                className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full w-10 h-10 flex items-center justify-center transition"
                aria-label="Twitter"
              >
                <Twitter className="text-white" size={18} />
              </a>
              <a
                href="#"
                className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full w-10 h-10 flex items-center justify-center transition"
                aria-label="LinkedIn"
              >
                <Linkedin className="text-white" size={18} />
              </a>
            </div>

            <div className="mt-4">
              <p className="text-sm text-neutral-200">
                Inscreva-se para receber atualizações:
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex mt-2">
                <Input
                  type="email"
                  placeholder="Seu e-mail"
                  className="flex-1 rounded-r-none bg-transparent border-white/20 focus-visible:ring-accent"
                  required
                />
                <Button
                  type="submit"
                  className="bg-accent hover:bg-accent-dark text-neutral-dark rounded-l-none"
                >
                  <Send size={18} />
                </Button>
              </form>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-neutral-200">
            © {new Date().getFullYear()} Sou Solidário. Todos os direitos reservados.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-sm text-neutral-200 hover:text-white transition">
              Política de Privacidade
            </a>
            <a href="#" className="text-sm text-neutral-200 hover:text-white transition">
              Termos de Uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

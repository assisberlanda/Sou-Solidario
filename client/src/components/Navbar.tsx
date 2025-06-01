// client/src/components/Navbar.tsx

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, LogOut, UserCircle, HandHelping } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth"; // Certifique-se que este import está correto

interface NavbarProps {
  // user?: any; // Não é mais necessário receber user como prop, use useAuth() diretamente
}

const Navbar = (/* Removido prop user */) => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { user, logoutMutation } = useAuth(); // Obtém o usuário e mutação de logout do hook
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Definindo os links de navegação com base no status de autenticação
  const links = user ? [
    { href: "/", label: "Início" },
    { href: "/campanhas", label: "Campanhas" }, // <-- Adicionado link "Campanhas" para usuários logados
    { href: "/minhas-campanhas", label: "Minhas Campanhas" },
    { href: "/minha-conta", label: "Minha Conta" }
  ] : [
    { href: "/", label: "Início" },
    { href: "/sobre", label: "Sobre" },
    { href: "/campanhas", label: "Campanhas" },
  ];

  // Verifica se o link está ativo para destacar no menu
  const isLinkActive = (href: string) => {
    // Lógica para home precisa ser exata
    if (href === "/") return location === href;
    // Para outros links, verifica se a URL começa com o href
    return location.startsWith(href);
  };

  return (
    // --- CORREÇÃO 2: Aumentar z-index para z-[50] ---
    <header className="bg-primary shadow-md fixed top-0 w-full z-[50]">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/">
          <a className="flex items-center">
            <HandHelping className="text-white mr-2" size={24} />
            <h1 className="text-white text-xl font-heading font-bold">Sou Solidário</h1>
          </a>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex space-x-6">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <a
                className={cn(
                  "text-white hover:text-accent-light font-medium transition",
                  isLinkActive(link.href) && "text-accent-light"
                )}
              >
                {link.label}
              </a>
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="hidden md:flex items-center space-x-4">
              {/* Link para Minha Conta ou Perfil do Usuário */}
              <Link href="/minha-conta"> {/* Ajustado para Minha Conta */}
                <a className="text-white hover:text-accent-light font-medium transition flex items-center">
                  <UserCircle className="mr-1" size={18} />
                  <span>{user.name}</span>
                  {/* Exibindo o nome da organização */}
                  {user.organization && <span className="ml-2 text-sm text-white">({user.organization})</span>}
                </a>
              </Link>
              {/* Botão de Logout */}
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-white hover:text-accent-light"
              >
                <LogOut className="w-5 h-5" />
                <span className="sr-only">Sair</span>
              </Button>
            </div>
          ) : (
            // Botão Entrar para usuários deslogados
            <Link href="/auth" className="hidden md:block">
              <Button variant="default" className="bg-accent hover:bg-accent-dark text-neutral-dark font-accent font-semibold">
                Entrar
              </Button>
            </Link>
          )}

          {/* Mobile Menu Trigger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="md:hidden text-white"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-primary-dark">
              <nav className="flex flex-col space-y-4 mt-8">
                {links.map((link) => (
                  <SheetClose key={link.href} asChild>
                    <Link href={link.href}>
                      <a
                        className={cn(
                          "text-white hover:text-accent-light font-medium transition py-2 px-4 rounded-md",
                          isLinkActive(link.href) && "bg-[#26c485]/20 text-white font-bold"
                        )}
                      >
                        {link.label}
                      </a>
                    </Link>
                  </SheetClose>
                ))}

                {user ? (
                  <>
                    <SheetClose asChild>
                       {/* Link para Minha Conta ou Perfil do Usuário no Mobile */}
                      <Link href="/minha-conta"> {/* Ajustado para Minha Conta */}
                        <a className="text-white hover:text-accent-light font-medium transition py-2 px-4 rounded-md flex items-center">
                          <UserCircle className="mr-1" size={18} />
                          <span>{user.name}</span>
                          {/* Exibindo o nome da organização */}
                          {user.organization && <span className="ml-2 text-sm text-white">({user.organization})</span>}
                        </a>
                      </Link>
                    </SheetClose>
                    {/* Botão de Logout no Mobile */}
                    <Button
                      variant="ghost"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="text-white hover:text-accent-light py-2 px-4 rounded-md justify-start"
                    >
                      <LogOut className="mr-1" size={18} />
                      Sair
                    </Button>
                  </>
                ) : (
                  // Botão Entrar para usuários deslogados no Mobile
                  <SheetClose asChild>
                    <Link href="/auth">
                      <a className="bg-accent hover:bg-accent-dark text-neutral-dark font-accent font-semibold py-2 px-4 rounded-lg transition text-center">
                        Entrar
                      </a>
                    </Link>
                  </SheetClose>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
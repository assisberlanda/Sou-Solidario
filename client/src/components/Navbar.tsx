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
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface NavbarProps {
  user?: any;
}

const Navbar = ({ user }: NavbarProps) => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado da sua conta.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Erro ao fazer logout",
        description: "Ocorreu um erro ao tentar desconectar da sua conta.",
        variant: "destructive",
      });
    }
  };

  const links = [
    { href: "/", label: "Início" },
    { href: "/", label: "Sobre" },
    { href: "/campanhas", label: "Campanhas" },
    { href: "/doar/campanha", label: "Fazer Doação" },
  ];

  const isLinkActive = (href: string) => {
    if (href === "/") return location === href;
    return location.startsWith(href);
  };

  return (
    <header className="bg-primary shadow-md fixed top-0 w-full z-10">
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
              <Link href="/admin/dashboard">
                <a className="text-white hover:text-accent-light font-medium transition flex items-center">
                  <UserCircle className="mr-1" size={18} />
                  <span>{user.name}</span>
                </a>
              </Link>
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
            <Link href="/admin" className="hidden md:block">
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
                          isLinkActive(link.href) && "bg-primary/20 text-accent-light"
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
                      <Link href="/admin/dashboard">
                        <a className="text-white hover:text-accent-light font-medium transition py-2 px-4 rounded-md flex items-center">
                          <UserCircle className="mr-1" size={18} />
                          <span>{user.name}</span>
                        </a>
                      </Link>
                    </SheetClose>
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
                  <SheetClose asChild>
                    <Link href="/admin">
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

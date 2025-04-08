import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Alterado para Textarea para o campo sobre
import { Label } from "@/components/ui/label";

const cadastroEmpresaSchema = z.object({
  nome: z.string().min(3, "Nome da empresa é obrigatório"),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(8, "Telefone é obrigatório"),
  cidade: z.string().min(2, "Cidade é obrigatória"),
  bairro: z.string().min(2, "Bairro é obrigatório"),
  sobre: z.string().min(10, "Fale um pouco sobre a empresa"),
  senha: z.string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número")
    .regex(/[^a-zA-Z0-9]/, "A senha deve conter pelo menos um caractere especial"),
});

export default function CadastroEmpresa() {
  const [, navigate] = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(cadastroEmpresaSchema),
  });

  const onSubmit = async (data: any) => {
    const res = await fetch("/api/empresas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      alert("Empresa cadastrada com sucesso!");
      navigate("/cadastro-campanha");
    } else {
      alert("Erro ao cadastrar empresa!");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-6">Cadastro da Empresa</h2>

      <div className="space-y-2">
        <Input
          {...register("nome")}
          placeholder="Nome da Empresa"
          className="border p-2 w-full"
        />
        {errors.nome && <p className="text-red-500 text-sm">{errors.nome.message}</p>}
      </div>

      <div className="space-y-2">
        <Input
          {...register("email")}
          type="email"
          placeholder="Email"
          className="border p-2 w-full"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Input
          {...register("telefone")}
          placeholder="Telefone"
          className="border p-2 w-full"
        />
        {errors.telefone && <p className="text-red-500 text-sm">{errors.telefone.message}</p>}
      </div>

      <div className="space-y-2">
        <Input
          {...register("cidade")}
          placeholder="Cidade"
          className="border p-2 w-full"
        />
        {errors.cidade && <p className="text-red-500 text-sm">{errors.cidade.message}</p>}
      </div>

      <div className="space-y-2">
        <Input
          {...register("bairro")}
          placeholder="Bairro"
          className="border p-2 w-full"
        />
        {errors.bairro && <p className="text-red-500 text-sm">{errors.bairro.message}</p>}
      </div>

      {/* Alteração aqui - Campo "Sobre a Empresa" alterado para Textarea */}
      <div className="space-y-2">
        <Textarea
          {...register("sobre")}
          placeholder="Sobre a Empresa"
          className="border p-2 w-full"
        />
        {errors.sobre && <p className="text-red-500 text-sm">{errors.sobre.message}</p>}
      </div>

      <div className="space-y-2">
        <Input
          {...register("senha")}
          type="password"
          placeholder="Criar uma senha segura"
          className="border p-2 w-full"
        />
        {errors.senha && <p className="text-red-500 text-sm">{errors.senha.message}</p>}
      </div>

      <Button type="submit" className="bg-primary text-white px-4 py-2 rounded w-full mt-8">
        Cadastrar Empresa
      </Button>
    </form>
  );
}

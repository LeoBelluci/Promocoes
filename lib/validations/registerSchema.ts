import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome."),
  email: z.string().trim().email("Informe um email valido.").toLowerCase(),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
  registrationCode: z.string().trim().min(1, "Informe o codigo de cadastro.")
});

export type RegisterInput = z.infer<typeof registerSchema>;

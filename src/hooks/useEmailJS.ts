import { useState } from "react";
import emailjs from "@emailjs/browser";

interface EmailData {
  nome: string;
  email: string;
  empresa: string;
  patrimonio: string;
  mensagem: string;
}

interface UseEmailJSReturn {
  loading: boolean;
  success: boolean;
  error: string | null;
  sendEmail: (data: EmailData) => Promise<void>;
  reset: () => void;
}

export const useEmailJS = (): UseEmailJSReturn => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendEmail = async (data: EmailData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Inicializar EmailJS (apenas uma vez)
      if (!emailjs.init) {
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
        if (!publicKey) {
          throw new Error("EmailJS Public Key não configurada");
        }
        emailjs.init(publicKey);
      }

      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

      if (!serviceId || !templateId) {
        throw new Error("EmailJS Service ID ou Template ID não configurados");
      }

      // Enviar email
      const response = await emailjs.send(serviceId, templateId, {
        to_email: import.meta.env.VITE_EMAILJS_RECIPIENT_EMAIL,
        from_name: data.nome,
        from_email: data.email,
        empresa: data.empresa,
        patrimonio: data.patrimonio,
        mensagem: data.mensagem || "Sem mensagem adicional",
        reply_to: data.email,
      });

      if (response.status === 200) {
        setSuccess(true);
        setLoading(false);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao enviar formulário";
      setError(errorMessage);
      setLoading(false);
    }
  };

  const reset = () => {
    setSuccess(false);
    setError(null);
    setLoading(false);
  };

  return { loading, success, error, sendEmail, reset };
};

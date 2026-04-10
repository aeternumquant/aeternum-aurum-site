import Footer from "../../components/common/Footer";
import { FadeIn } from "../../components/common/FadeIn";
import { useState } from "react";
import emailjs from "@emailjs/browser";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

// Service ID e Template ID do EmailJS
const EMAILJS_SERVICE_ID = "service_eadau0k";
const EMAILJS_TEMPLATE_ID = "template_7qpvcfb";
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "xBkCxEH6hbqTg0i_j";

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  tipo: string;
  mensagem: string;
}

const tiposInvestidor = [
  { value: "latifundiario", label: "Latifundiário" },
  { value: "afiliado", label: "Afiliado" },
  { value: "trader", label: "Trader" },
  { value: "gestor", label: "Gestor de Fundos" },
  { value: "outro", label: "Outro" },
];

export default function AcessoPage() {
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    email: "",
    telefone: "",
    empresa: "",
    tipo: "",
    mensagem: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    if (error) setError(null);
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      empresa: "",
      tipo: "",
      mensagem: "",
    });
    setSuccess(false);
    setError(null);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.nome || !formData.email || !formData.empresa || !formData.tipo) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Por favor, insira um e-mail válido.");
      return;
    }

    setLoading(true);

    try {
      emailjs.init(EMAILJS_PUBLIC_KEY);

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email: "gabriel@aeternumaurum.com",
          from_name: formData.nome,
          from_email: formData.email,
          telefone: formData.telefone || "Não informado",
          empresa: formData.empresa,
          tipo: tiposInvestidor.find((t) => t.value === formData.tipo)?.label || formData.tipo,
          mensagem: formData.mensagem || "Sem mensagem adicional",
          reply_to: formData.email,
        }
      );

      if (response.status === 200) {
        setSuccess(true);
        setLoading(false);
        setTimeout(() => {
          setFormData({
            nome: "",
            email: "",
            telefone: "",
            empresa: "",
            tipo: "",
            mensagem: "",
          });
        }, 500);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao enviar formulário. Tente novamente.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <main className="pt-14 min-h-screen bg-background">
      {/* HERO SECTION */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-white/5 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/4 via-background to-background z-0" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <FadeIn>
            <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-4">
              Acesso Premium
            </p>
            <h1 className="font-display text-4xl sm:text-5xl text-primary uppercase tracking-widest mb-6">
              Solicitar Acesso
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed font-light max-w-xl mx-auto">
              O acesso à plataforma Aeternum Aurum é restrito a investidores profissionais qualificados. 
              Preencha o formulário abaixo e nossa equipe entrará em contato em até 5 dias úteis.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* FORM SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden min-h-[60vh] flex items-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/3 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-xl mx-auto w-full relative z-10">
          {/* Mensagem de Sucesso */}
          {success && (
            <FadeIn direction="none">
              <div className="border border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5 p-10 text-center rounded-sm">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto rounded-full">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h3 className="font-display text-2xl text-primary uppercase tracking-widest mb-4">
                  Solicitação Enviada com Sucesso
                </h3>
                <p className="text-muted-foreground text-sm font-light leading-relaxed mb-2">
                  Obrigado pela sua solicitação, <span className="text-primary">{formData.nome}</span>.
                </p>
                <p className="text-muted-foreground text-sm font-light leading-relaxed mb-8">
                  Nossa equipe analisará seu perfil e entrará em contato através do e-mail{" "}
                  <span className="text-primary/80">{formData.email}</span> em até 5 dias úteis.
                </p>
                <button
                  onClick={resetForm}
                  className="text-primary text-xs font-display uppercase tracking-wider border border-primary/30 hover:bg-primary/10 px-6 py-2 transition-all duration-300 rounded-sm"
                >
                  Nova Solicitação
                </button>
              </div>
            </FadeIn>
          )}

          {/* Formulário */}
          {!success && (
            <FadeIn>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Mensagem de Erro */}
                {error && (
                  <div className="border border-red-500/30 bg-red-500/5 p-4 rounded-sm flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-500 text-xs font-display uppercase tracking-wider mb-1">
                        Erro ao enviar
                      </p>
                      <p className="text-red-500/70 text-xs">{error}</p>
                    </div>
                  </div>
                )}

                {/* Campos do Formulário */}
                {[
                  { id: "nome", label: "Nome completo", type: "text", placeholder: "Seu nome" },
                  { id: "email", label: "E-mail institucional", type: "email", placeholder: "email@instituicao.com" },
                  { id: "telefone", label: "Telefone", type: "tel", placeholder: "Ex: +55 (11) 9999-9999" },
                  { id: "empresa", label: "Empresa / Instituição", type: "text", placeholder: "Nome da instituição" },
                ].map((field) => (
                  <div key={field.id}>
                    <label htmlFor={field.id} className="block text-[10px] text-muted-foreground tracking-[0.2em] uppercase mb-2 font-sans">
                      {field.label}
                    </label>
                    <input
                      id={field.id}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.id as keyof FormData]}
                      onChange={handleChange}
                      disabled={loading}
                      required={field.id !== "telefone"}
                      className="w-full bg-card border border-white/8 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 transition-colors font-sans disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                ))}

                {/* Campo Tipo - Select */}
                <div>
                  <label htmlFor="tipo" className="block text-[10px] text-muted-foreground tracking-[0.2em] uppercase mb-2 font-sans">
                    Tipo de Investidor
                  </label>
                  <select
                    id="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    disabled={loading}
                    required
                    className="w-full bg-card border border-white/8 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 transition-colors font-sans disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
                  >
                    <option value="" disabled>
                      Selecione seu perfil
                    </option>
                    {tiposInvestidor.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Textarea */}
                <div>
                  <label htmlFor="mensagem" className="block text-[10px] text-muted-foreground tracking-[0.2em] uppercase mb-2 font-sans">
                    Mensagem (opcional)
                  </label>
                  <textarea
                    id="mensagem"
                    rows={4}
                    placeholder="Descreva brevemente seu perfil ou interesse específico..."
                    value={formData.mensagem}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full bg-card border border-white/8 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 transition-colors resize-none font-sans disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Disclaimer */}
                <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
                  Ao enviar, confirmo ser investidor profissional qualificado nos termos da regulamentação vigente. Seus dados serão tratados conforme nossa política de privacidade.
                </p>

                {/* Botão Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 border border-primary text-primary text-[10px] tracking-[0.25em] uppercase font-sans bg-primary/0 hover:bg-primary hover:text-background transition-all duration-300 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <span className="relative z-10">Enviar Solicitação</span>
                    </>
                  )}
                </button>
              </form>
            </FadeIn>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

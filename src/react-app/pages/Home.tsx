import { useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "@/react-app/hooks/useAuth";
import {
  Loader2,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  BarChart3,
  Users,
  Wallet,
} from "lucide-react";

export default function Home() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate("/expenses");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="animate-spin">
          <Loader2 className="w-10 h-10 text-violet-500" />
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Registro Inteligente",
      description: "Carga gastos en segundos con soporte multi-divisa y adjuntos automáticos",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Categorización Pro",
      description: "Organiza automáticamente tus gastos por categorías personalizables",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Tiempo real",
      description: "Visualiza tus gastos y reportes actualizados al instante 24/7",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Analytics Avanzado",
      description: "Gráficos interactivos y reportes detallados para decisiones inteligentes",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Multi-divisa",
      description: "Gestiona gastos en ARS, USD, EUR, BRL y más monedas",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Gestión de Equipos",
      description: "Control de permisos, aprobaciones y balance por usuario",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                ExpenseFlow
              </span>
            </div>
            <Link
              to="/login"
              className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg font-medium hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-purple-600/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-8">
              <Zap className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-violet-300">
                La plataforma más moderna para gestionar gastos
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Gestiona tus gastos
              <br />
              con{" "}
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                inteligencia
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              La plataforma más <strong>moderna</strong> para gestionar gastos empresariales con
              soporte multi-divisa, informes en tiempo real y control total sobre tu presupuesto.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="group px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-700 hover:to-purple-700 transition-all shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 flex items-center justify-center space-x-2"
              >
                <span>Comenzar ahora</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Todo lo que necesitas en un solo lugar
          </h2>
          <p className="text-gray-400 text-lg">
            Herramientas profesionales para una gestión financiera eficiente
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl bg-gray-800/50 border border-gray-700/50 hover:border-violet-500/50 backdrop-blur-sm transition-all hover:shadow-xl hover:shadow-violet-500/10"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <div className="text-violet-400">{feature.icon}</div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-gray-800 bg-gray-900/50 backdrop-blur-sm py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mb-2">
                100%
              </div>
              <div className="text-gray-400">Uptime garantizado</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mb-2">
                24/7
              </div>
              <div className="text-gray-400">Soporte disponible</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mb-2">
                ∞
              </div>
              <div className="text-gray-400">Gastos ilimitados</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mb-2">
                5+
              </div>
              <div className="text-gray-400">Monedas soportadas</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-purple-600 p-12 md:p-16">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="relative text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              ¿Listo para transformar tu gestión financiera?
            </h2>
            <p className="text-violet-100 text-lg mb-8 max-w-2xl mx-auto">
              Únete a cientos de empresas que ya confían en ExpenseFlow para gestionar sus gastos
            </p>
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-violet-600 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-2xl hover:shadow-3xl"
            >
              <span>Comenzar gratis</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">ExpenseFlow</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 ExpenseFlow. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

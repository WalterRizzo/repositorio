import { Link } from "react-router";
import { 
  TrendingUp, 
  Zap, 
  Shield, 
  BarChart3, 
  ArrowRight,
  CheckCircle,
  Sparkles
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-dark-950 overflow-hidden">
      {/* Hero Section con Gradiente Animado */}
      <div className="relative">
        {/* Fondo con gradiente animado */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 via-accent-cyan/10 to-accent-violet/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDEzOSwgOTIsIDI0NiwgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          {/* Badge */}
          <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-top duration-700">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium text-primary-400">Sistema de Gestión Empresarial</span>
            </div>
          </div>

          {/* Hero Title */}
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom duration-700 delay-200">
            <h1 className="text-6xl md:text-7xl font-display font-bold mb-6 leading-tight">
              <span className="block text-white">Control Total de</span>
              <span className="block bg-gradient-to-r from-primary-400 via-accent-cyan to-accent-violet bg-clip-text text-transparent">
                Gastos Empresariales
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Gestiona, controla y analiza todos tus gastos en una plataforma moderna, 
              <span className="text-white font-semibold"> rápida y segura</span>
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom duration-700 delay-300">
            <Link
              to="/login"
              className="group relative px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-cyan text-white font-bold rounded-xl shadow-glow hover:shadow-glow-lg transition-all duration-300 hover:scale-105 flex items-center space-x-2"
            >
              <span>Iniciar Sesión</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="px-8 py-4 bg-dark-800 border border-dark-700 text-white font-semibold rounded-xl hover:bg-dark-700 hover:border-primary-500/30 transition-all duration-300 flex items-center space-x-2"
            >
              <span>Ver Características</span>
              <BarChart3 className="w-5 h-5" />
            </a>
          </div>

          {/* Stats removed per request */}
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-dark-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              Todo lo que necesitas
            </h2>
            <p className="text-xl text-gray-400">
              Herramientas profesionales para gestión financiera empresarial
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card group hover:shadow-glow transition-all duration-300">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-cyan rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-cyan flex items-center justify-center shadow-glow">
                  <Zap className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-3">
                Gestión Rápida
              </h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                Carga y aprueba gastos en segundos. Interfaz intuitiva diseñada para máxima productividad.
              </p>
              <ul className="space-y-2">
                {["Carga múltiple de archivos", "Aprobación instantánea", "Categorización automática"].map((item, i) => (
                  <li key={i} className="flex items-center text-sm text-gray-500">
                    <CheckCircle className="w-4 h-4 text-accent-green mr-2" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="card group hover:shadow-glow transition-all duration-300">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-green to-accent-cyan rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-green to-accent-cyan flex items-center justify-center shadow-glow">
                  <TrendingUp className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-3">
                Reportes Avanzados
              </h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                Visualiza tendencias, analiza patrones y toma decisiones basadas en datos reales.
              </p>
              <ul className="space-y-2">
                {["Gráficos interactivos", "Exportación de datos", "Análisis por categoría"].map((item, i) => (
                  <li key={i} className="flex items-center text-sm text-gray-500">
                    <CheckCircle className="w-4 h-4 text-accent-green mr-2" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="card group hover:shadow-glow transition-all duration-300">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-violet to-primary-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-violet to-primary-500 flex items-center justify-center shadow-glow">
                  <Shield className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-3">
                Seguridad Total
              </h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                Protección de datos empresariales con control de acceso granular y auditoría completa.
              </p>
              <ul className="space-y-2">
                {["Roles y permisos", "Auditoría de cambios", "Backup automático"].map((item, i) => (
                  <li key={i} className="flex items-center text-sm text-gray-500">
                    <CheckCircle className="w-4 h-4 text-accent-green mr-2" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="py-24 bg-gradient-to-br from-primary-600/10 via-accent-cyan/5 to-accent-violet/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            ¿Listo para optimizar tu gestión de gastos?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Únete a empresas que ya confían en ExpenseFlow para su gestión financiera
          </p>
          <Link
            to="/login"
            className="inline-flex items-center space-x-2 px-10 py-5 bg-gradient-to-r from-primary-600 to-accent-cyan text-white text-lg font-bold rounded-xl shadow-glow hover:shadow-glow-lg transition-all duration-300 hover:scale-105"
          >
            <span>Comenzar Ahora</span>
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 bg-dark-900 border-t border-dark-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-accent-cyan flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold bg-gradient-to-r from-primary-400 to-accent-cyan bg-clip-text text-transparent">
                ExpenseFlow
              </span>
            </div>
            <div className="text-sm text-gray-500">
              © 2025 ExpenseFlow. Sistema de Gestión Empresarial
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

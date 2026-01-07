import { FileText, Download, Eye, BookOpen, Shield, Zap, Users } from "lucide-react";

export default function Documentation() {
  const handleDownload = () => {
    window.open('/ExpenseFlow_Documentacion_Tecnica.pdf', '_blank');
  };

  const handleView = () => {
    window.open('/ExpenseFlow_Documentacion_Tecnica.pdf', '_blank');
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-12 mb-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <BookOpen className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-black text-white mb-2">
                    Documentación Técnica
                  </h1>
                  <p className="text-xl text-white/90">
                    ExpenseFlow - Sistema de Gestión de Gastos
                  </p>
                </div>
              </div>
              <p className="text-white/80 text-lg max-w-3xl mt-4">
                Documento completo con toda la información técnica, funcional y de seguridad del sistema.
                Ideal para presentación a clientes y stakeholders.
              </p>
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tarjeta Principal del PDF */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-4 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-lg">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      ExpenseFlow_Documentacion_Tecnica.pdf
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                      18 páginas • 88 KB • Actualizado hoy
                    </p>
                  </div>
                </div>

                {/* Preview del contenido */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-6 mb-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-indigo-600" />
                    Contenido del Documento
                  </h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start">
                      <span className="text-indigo-600 mr-2">►</span>
                      <span><strong>Resumen Ejecutivo:</strong> Propuesta de valor y beneficios</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-indigo-600 mr-2">►</span>
                      <span><strong>Arquitectura Técnica:</strong> Stack completo y diagrama</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-indigo-600 mr-2">►</span>
                      <span><strong>Stack Tecnológico:</strong> React 19, Hono, Cloudflare</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-indigo-600 mr-2">►</span>
                      <span><strong>Seguridad:</strong> Rate limiting, JWT, Account lockout</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-indigo-600 mr-2">►</span>
                      <span><strong>Funcionalidades:</strong> Todas las características del sistema</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-indigo-600 mr-2">►</span>
                      <span><strong>Gestión de Usuarios:</strong> Roles, permisos y saldos</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-indigo-600 mr-2">►</span>
                      <span><strong>Reportes y Analytics:</strong> Gráficos y exportación</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-indigo-600 mr-2">►</span>
                      <span><strong>Notificaciones Push:</strong> Sistema implementado</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-indigo-600 mr-2">►</span>
                      <span><strong>Base de Datos:</strong> Cloudflare D1, 18 migraciones</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-indigo-600 mr-2">►</span>
                      <span><strong>Deployment:</strong> Cloudflare Workers, 99.99% uptime</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-indigo-600 mr-2">►</span>
                      <span><strong>Roadmap:</strong> Mejoras futuras planificadas</span>
                    </li>
                  </ul>
                </div>

                {/* Botones de Acción */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleView}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Eye className="w-5 h-5" />
                    <span className="font-semibold">Ver Documento</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Download className="w-5 h-5" />
                    <span className="font-semibold">Descargar PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjetas de Características */}
          <div className="space-y-6">
            {/* Seguridad */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-800">
              <div className="flex items-center space-x-3 mb-3">
                <Shield className="w-6 h-6 text-red-600" />
                <h3 className="font-bold text-gray-900 dark:text-white">Seguridad</h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Incluye detalles completos sobre rate limiting, account lockout, JWT, bcrypt y protecciones contra DDoS.
              </p>
            </div>

            {/* Performance */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center space-x-3 mb-3">
                <Zap className="w-6 h-6 text-yellow-600" />
                <h3 className="font-bold text-gray-900 dark:text-white">Performance</h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Especificaciones técnicas, latencia {'<'} 50ms, Lighthouse 95/100, bundle optimizado.
              </p>
            </div>

            {/* Usuarios */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-3 mb-3">
                <Users className="w-6 h-6 text-blue-600" />
                <h3 className="font-bold text-gray-900 dark:text-white">Para Clientes</h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Documento profesional listo para presentar a clientes y stakeholders con información completa.
              </p>
            </div>
          </div>
        </div>

        {/* Sección de Información Adicional */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            📋 Información Adicional
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                🎯 Propósito del Documento
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Este documento técnico está diseñado para proporcionar una visión completa del sistema ExpenseFlow,
                incluyendo arquitectura, seguridad, funcionalidades y roadmap futuro.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                👥 Audiencia
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Ideal para clientes potenciales, stakeholders, equipos técnicos y gerentes de proyecto
                que necesiten entender las capacidades y arquitectura del sistema.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                🔒 Confidencialidad
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Documento confidencial. Solo para distribución autorizada. Contiene información técnica
                sensible sobre la implementación y arquitectura del sistema.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                📅 Actualización
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Documento actualizado a la fecha actual con todas las funcionalidades implementadas,
                incluyendo notificaciones push y sistema de seguridad completo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

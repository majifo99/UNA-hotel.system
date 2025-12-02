import { useNavigate } from 'react-router-dom';
import { Home, RefreshCw, HardHat, AlertTriangle } from 'lucide-react';

/**
 * NotFoundPage - Página 404 con animación de hotel en construcción
 * 
 * Página de error amigable que mantiene la sidebar visible
 * y simula un edificio hotelero en construcción.
 */
export default function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-3xl w-full text-center">
        {/* Animated 404 Number with construction theme */}
        <div className="relative mb-8">
          <div className="text-9xl font-bold text-[#2C3E50] animate-pulse">
            404
          </div>
          
          {/* Construction barriers */}
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            <div className="w-16 h-2 bg-yellow-500 animate-pulse"></div>
            <div className="w-16 h-2 bg-[#2C3E50] animate-pulse animation-delay-500"></div>
          </div>
        </div>

        {/* Main Message */}
        <div className="mb-12 space-y-4">
          <h1 className="text-4xl font-bold text-[#2C3E50]">
            Algo salió mal
          </h1>
          <p className="text-xl text-gray-600">
            Por favor recarga la página
          </p>
          
          {/* Under construction badge */}
          <div className="inline-flex items-center gap-2 px-5 py-3 bg-yellow-400 rounded-full shadow-lg border-2 border-yellow-500">
            <HardHat className="w-5 h-5 text-[#2C3E50] animate-bounce" />
            <span className="text-sm font-bold text-[#2C3E50] uppercase tracking-wide">
              Esta página está en construcción
            </span>
            <AlertTriangle className="w-5 h-5 text-[#2C3E50] animate-pulse" />
          </div>
        </div>

        {/* Hotel Building Under Construction Illustration */}
        <div className="mb-12 relative">
          <div className="mx-auto max-w-md relative">
            {/* Sky background with crane */}
            <div className="relative h-80 bg-blue-50 rounded-t-lg overflow-hidden border-2 border-gray-200">
              {/* Sun */}
              <div className="absolute top-6 right-8 w-12 h-12 bg-yellow-400 rounded-full animate-pulse shadow-lg"></div>
              
              {/* Clouds */}
              <div className="absolute top-12 left-8 w-20 h-8 bg-white rounded-full shadow-sm animate-float"></div>
              <div className="absolute top-16 right-16 w-16 h-6 bg-white rounded-full shadow-sm animate-float animation-delay-2000"></div>
              
              {/* Construction Crane */}
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
                {/* Crane tower */}
                <div className="relative">
                  <div className="w-3 h-32 bg-yellow-500 mx-auto border-2 border-yellow-600"></div>
                  {/* Crane arm */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <div className="w-32 h-2 bg-yellow-500 border-2 border-yellow-600 origin-left animate-crane"></div>
                    {/* Hook */}
                    <div className="absolute right-0 top-2">
                      <div className="w-1 h-8 bg-gray-400 animate-swing"></div>
                      <div className="w-4 h-4 bg-gray-600 rounded-sm"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hotel Building - Multiple floors under construction */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-48">
                {/* Building floors */}
                <div className="space-y-1">
                  {/* Floor 5 - Under construction */}
                  <div className="h-10 bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-around animate-fade-in">
                    <div className="w-4 h-4 border-2 border-gray-400"></div>
                    <div className="w-4 h-4 border-2 border-gray-400"></div>
                    <div className="w-4 h-4 border-2 border-gray-400"></div>
                    <div className="w-4 h-4 border-2 border-gray-400"></div>
                  </div>
                  
                  {/* Floor 4 */}
                  <div className="h-12 bg-[#2C3E50] flex items-center justify-around px-2 border-b border-gray-700">
                    <div className="w-6 h-6 bg-yellow-300 border-2 border-yellow-500"></div>
                    <div className="w-6 h-6 bg-yellow-300 border-2 border-yellow-500"></div>
                    <div className="w-6 h-6 bg-yellow-300 border-2 border-yellow-500"></div>
                  </div>
                  
                  {/* Floor 3 */}
                  <div className="h-12 bg-[#34495E] flex items-center justify-around px-2 border-b border-gray-700">
                    <div className="w-6 h-6 bg-yellow-300 border-2 border-yellow-500"></div>
                    <div className="w-6 h-6 bg-yellow-300 border-2 border-yellow-500"></div>
                    <div className="w-6 h-6 bg-yellow-300 border-2 border-yellow-500"></div>
                  </div>
                  
                  {/* Floor 2 */}
                  <div className="h-12 bg-[#2C3E50] flex items-center justify-around px-2 border-b border-gray-700">
                    <div className="w-6 h-6 bg-yellow-300 border-2 border-yellow-500"></div>
                    <div className="w-6 h-6 bg-yellow-300 border-2 border-yellow-500"></div>
                    <div className="w-6 h-6 bg-yellow-300 border-2 border-yellow-500"></div>
                  </div>
                  
                  {/* Ground Floor - Lobby */}
                  <div className="h-16 bg-[#34495E] flex items-center justify-center border-b-2 border-gray-900">
                    <div className="text-xs font-bold text-white tracking-wider">LANAKU HOTEL</div>
                  </div>
                </div>
              </div>

              {/* Construction barriers at bottom */}
             
            </div>

            {/* Ground/Foundation 
            <div className="h-4 bg-[#2C3E50] rounded-b-lg border-2 border-t-0 border-gray-200"></div>
            
            {/* Construction workers (animated dots) - positioned on ground */}
            <div className="absolute bottom-4 left-12 flex gap-2">
                 {/*
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce animation-delay-200"></div>
                */}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleGoHome}
            className="group flex items-center gap-2 px-8 py-4 bg-[#2C3E50] text-white rounded-lg font-semibold shadow-lg hover:bg-[#34495E] transform hover:scale-105 transition-all duration-200"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Volver al Inicio
          </button>
          
          <button
            onClick={handleReload}
            className="group flex items-center gap-2 px-8 py-4 bg-white text-[#2C3E50] border-2 border-[#2C3E50] rounded-lg font-semibold hover:bg-[#2C3E50] hover:text-white transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            Recargar Página
          </button>
        </div>

        {/* Helper text */}
        <p className="mt-8 text-sm text-gray-600">
          Si el problema persiste, contacta al administrador del sistema
        </p>
      </div>

      {/* Add custom animations to global styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes crane {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        
        @keyframes swing {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(4px); }
        }
        
        @keyframes fade-in {
          0% { opacity: 0.3; }
          50% { opacity: 0.7; }
          100% { opacity: 0.3; }
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-crane {
          animation: crane 4s ease-in-out infinite;
        }
        
        .animate-swing {
          animation: swing 2s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 2s ease-in-out infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-500 {
          animation-delay: 0.5s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}

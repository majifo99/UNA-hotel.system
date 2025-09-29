

export function TypographyExample() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      
      {/* =================== TÍTULOS CON PLAYFAIR DISPLAY =================== */}
      <section>
        <h1 className="font-heading">Hotel UNA - Experiencia de Lujo</h1>
        <h2 className="font-heading">Servicios Exclusivos</h2>
        <h3>Habitaciones Premium (mantiene estilos existentes)</h3>
      </section>

      {/* =================== TEXTO DEL CUERPO CON INTER =================== */}
      <section>
        <p className="font-primary">
          Disfruta de una experiencia única en nuestro hotel de cinco estrellas. 
          Cada detalle ha sido cuidadosamente diseñado para ofrecerte el máximo confort 
          y elegancia durante tu estancia.
        </p>
        
        <p>Este párrafo mantiene todos los estilos existentes, solo cambia la tipografía.</p>
      </section>

      {/* =================== ELEMENTOS MONOSPACE =================== */}
      <section>
        <h4>Información de Reserva</h4>
        
        <div className="space-y-4">
          <div>
            <p>Precio por noche:</p>
            <span className="font-mono">$285.00</span>
          </div>
          
          <div>
            <p>Código de habitación:</p>
            <code className="font-mono">HAB-101</code>
          </div>
        </div>
      </section>

      {/* =================== NAVEGACIÓN =================== */}
      <section>
        <h4>Navegación (Inter)</h4>
        
        <div className="flex gap-4">
          <span className="font-primary">Inicio</span>
          <span className="font-primary">Habitaciones</span>
          <span className="font-primary">Servicios</span>
          <span className="font-primary">Contacto</span>
        </div>
      </section>

      {/* =================== BRAND TEXT =================== */}
      <section>
        <h2 className="font-heading">Hotel UNA (Playfair Display)</h2>
        <p className="font-primary">Subtítulo con Inter</p>
      </section>

      {/* =================== FORMULARIOS =================== */}
      <section>
        <h4>Elementos de Formulario</h4>
        
        <div className="space-y-4 max-w-md">
          <div>
            <label className="font-primary">Nombre completo</label>
            <input 
              type="text" 
              className="font-primary w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="Ingresa tu nombre"
            />
          </div>
          
          <div>
            <label className="font-primary">Fechas de estadía</label>
            <input 
              type="date" 
              className="font-mono w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
        </div>
      </section>

    </div>
  );
}

export default TypographyExample;
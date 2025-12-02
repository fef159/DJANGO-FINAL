import React, { useState } from 'react';
import './Help.css';

function Help() {
  const [openSection, setOpenSection] = useState(null);

  const faqSections = [
    {
      id: 'account',
      title: 'Cuenta y Perfil',
      icon: '👤',
      questions: [
        {
          q: '¿Cómo puedo editar mi perfil?',
          a: 'Ve a "Mi Perfil" en el menú y haz clic en "Editar Perfil". Allí podrás actualizar tu nombre, apellido y nombre de usuario.',
        },
        {
          q: '¿Puedo cambiar mi email?',
          a: 'Por seguridad, el email no se puede cambiar. Si necesitas cambiar tu email, contacta con el soporte.',
        },
        {
          q: '¿Cómo cierro sesión?',
          a: 'Haz clic en tu nombre en la barra de navegación y selecciona "Cerrar Sesión".',
        },
      ],
    },
    {
      id: 'shopping',
      title: 'Compras',
      icon: '🛒',
      questions: [
        {
          q: '¿Cómo agrego productos al carrito?',
          a: 'Navega por los productos, haz clic en "Agregar al Carrito" y el producto se añadirá automáticamente.',
        },
        {
          q: '¿Cómo modifico la cantidad en el carrito?',
          a: 'Ve a tu carrito y usa los botones + y - para ajustar las cantidades. También puedes eliminar productos.',
        },
        {
          q: '¿Qué métodos de pago aceptan?',
          a: 'Aceptamos pagos con tarjeta y PayPal.',
        },
        {
          q: '¿Cómo veo mi historial de compras?',
          a: 'Ve a "Mi Perfil" > "Mis Compras" para ver todas tus compras anteriores.',
        },
      ],
    },
    {
      id: 'products',
      title: 'Productos',
      icon: '📦',
      questions: [
        {
          q: '¿Cómo busco productos?',
          a: 'Usa la barra de búsqueda en la página de inicio o navega por las categorías.',
        },
        {
          q: '¿Puedo filtrar productos?',
          a: 'Sí, puedes filtrar por categoría, precio, productos destacados y disponibilidad de stock.',
        },
        {
          q: '¿Qué son los productos destacados?',
          a: 'Son productos seleccionados especialmente por su calidad y popularidad.',
        },
        {
          q: '¿Cómo veo las ofertas?',
          a: 'Ve a la sección "Ofertas" en el menú para ver todos los productos con descuentos.',
        },
      ],
    },
    {
      id: 'selling',
      title: 'Vender',
      icon: '💰',
      questions: [
        {
          q: '¿Cómo puedo vender mis productos?',
          a: 'Ve a la sección "Vender" en el menú, completa el formulario con la información de tu producto y envíalo para revisión.',
        },
        {
          q: '¿Hay algún costo por vender?',
          a: 'Actualmente no hay costos por publicar productos. Consulta nuestros términos y condiciones para más detalles.',
        },
        {
          q: '¿Cuánto tarda en aprobarse mi producto?',
          a: 'Los productos son revisados manualmente y generalmente se aprueban en 24-48 horas.',
        },
      ],
    },
    {
      id: 'technical',
      title: 'Soporte Técnico',
      icon: '🔧',
      questions: [
        {
          q: '¿La aplicación es segura?',
          a: 'Sí, utilizamos encriptación SSL y procesamos todos los pagos de forma segura.',
        },
        {
          q: '¿Qué hago si tengo un problema?',
          a: 'Contacta con nuestro equipo de soporte a través del email de contacto o revisa esta sección de ayuda.',
        },
        {
          q: '¿Puedo usar la app en móvil?',
          a: 'Sí, la aplicación es completamente responsive y funciona perfectamente en dispositivos móviles.',
        },
      ],
    },
  ];

  const toggleSection = (sectionId) => {
    setOpenSection(openSection === sectionId ? null : sectionId);
  };

  return (
    <div className="help-container">
      <h2>Centro de Ayuda</h2>
      <p className="help-subtitle">
        Encuentra respuestas a las preguntas más frecuentes
      </p>

      <div className="help-content">
        {faqSections.map((section) => (
          <div key={section.id} className="help-section">
            <button
              className="help-section-header"
              onClick={() => toggleSection(section.id)}
            >
              <span className="section-icon">{section.icon}</span>
              <span className="section-title">{section.title}</span>
              <span className="section-toggle">
                {openSection === section.id ? '−' : '+'}
              </span>
            </button>
            {openSection === section.id && (
              <div className="help-section-content">
                {section.questions.map((item, index) => (
                  <div key={index} className="faq-item">
                    <h4 className="faq-question">{item.q}</h4>
                    <p className="faq-answer">{item.a}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="help-contact">
        <h3>¿Necesitas más ayuda?</h3>
        <p>Contacta con nuestro equipo de soporte</p>
        <div className="contact-info">
          <div className="contact-item">
            <span className="contact-icon">📧</span>
            <span>soporte@ecommerce.com</span>
          </div>
          <div className="contact-item">
            <span className="contact-icon">📞</span>
            <span>+1 (555) 123-4567</span>
          </div>
          <div className="contact-item">
            <span className="contact-icon">🕒</span>
            <span>Lun - Vie: 9:00 AM - 6:00 PM</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Help;





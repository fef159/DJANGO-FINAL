import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Home.css';

function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('-created_at');
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef(null);
  const autoPlayRef = useRef(null);

  // Query para productos destacados (debe estar antes de los useEffect que lo usan)
  const { data: featuredProducts } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const response = await api.get('/api/products/featured/');
      return response.data;
    },
  });

  // Leer parámetro de búsqueda de la URL
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl);
    }
  }, [searchParams]);

  // Calcular productos por slide según el ancho de la pantalla
  const getProductsPerSlide = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 768) return 1;
      if (width < 1024) return 2;
      if (width < 1400) return 3;
      return 4;
    }
    return 4;
  };

  // Auto-play del carrusel
  useEffect(() => {
    if (featuredProducts && featuredProducts.length > 0) {
      const productsPerSlide = getProductsPerSlide();
      const totalSlides = Math.ceil(featuredProducts.length / productsPerSlide);
      
      autoPlayRef.current = setInterval(() => {
        setCarouselIndex((prevIndex) => (prevIndex + 1) % totalSlides);
      }, 5000); // Cambiar cada 5 segundos

      return () => {
        if (autoPlayRef.current) {
          clearInterval(autoPlayRef.current);
        }
      };
    }
  }, [featuredProducts]);

  // Scroll del carrusel cuando cambia el índice
  useEffect(() => {
    if (carouselRef.current && featuredProducts && featuredProducts.length > 0) {
      const productsPerSlide = getProductsPerSlide();
      const cardWidth = carouselRef.current.offsetWidth / productsPerSlide;
      const scrollPosition = carouselIndex * productsPerSlide * cardWidth;
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [carouselIndex, featuredProducts]);

  // Resetear índice cuando cambia el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      setCarouselIndex(0);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePrevSlide = () => {
    if (featuredProducts && featuredProducts.length > 0) {
      const productsPerSlide = getProductsPerSlide();
      const totalSlides = Math.ceil(featuredProducts.length / productsPerSlide);
      setCarouselIndex((prevIndex) => (prevIndex - 1 + totalSlides) % totalSlides);
    }
    // Pausar auto-play temporalmente
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      setTimeout(() => {
        if (featuredProducts && featuredProducts.length > 0) {
          const productsPerSlide = getProductsPerSlide();
          const totalSlides = Math.ceil(featuredProducts.length / productsPerSlide);
          autoPlayRef.current = setInterval(() => {
            setCarouselIndex((prevIndex) => (prevIndex + 1) % totalSlides);
          }, 5000);
        }
      }, 10000); // Reanudar después de 10 segundos
    }
  };

  const handleNextSlide = () => {
    if (featuredProducts && featuredProducts.length > 0) {
      const productsPerSlide = getProductsPerSlide();
      const totalSlides = Math.ceil(featuredProducts.length / productsPerSlide);
      setCarouselIndex((prevIndex) => (prevIndex + 1) % totalSlides);
    }
    // Pausar auto-play temporalmente
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      setTimeout(() => {
        if (featuredProducts && featuredProducts.length > 0) {
          const productsPerSlide = getProductsPerSlide();
          const totalSlides = Math.ceil(featuredProducts.length / productsPerSlide);
          autoPlayRef.current = setInterval(() => {
            setCarouselIndex((prevIndex) => (prevIndex + 1) % totalSlides);
          }, 5000);
        }
      }, 10000); // Reanudar después de 10 segundos
    }
  };

  // Query para todos los productos
  const { data: allProducts, isLoading } = useQuery({
    queryKey: ['products', 'all', filterFeatured],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterFeatured) params.append('featured', 'true');
      const response = await api.get(`/api/products/?${params.toString()}`);
      return response.data.results || response.data;
    },
  });

  // Query para el carrito (si está autenticado)
  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await api.get('/api/cart/');
      return response.data;
    },
    enabled: isAuthenticated,
  });

  // Mutación para agregar al carrito
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1 }) => {
      const response = await api.post('/api/cart/add/', {
        product_id: productId,
        quantity,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Prefetch producto al pasar el mouse
  const handleProductHover = (productSlug) => {
    queryClient.prefetchQuery({
      queryKey: ['product', productSlug],
      queryFn: async () => {
        const response = await api.get(`/api/products/${productSlug}/`);
        return response.data;
      },
    });
  };

  const products = filterFeatured ? featuredProducts : allProducts;

  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.final_price - b.final_price;
        case 'price_desc':
          return b.final_price - a.final_price;
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchTerm, sortBy]);

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    addToCartMutation.mutate({ productId: product.id, quantity: 1 });
  };

  const goToCart = () => {
    navigate('/cart');
  };

  return (
    <div className="home">
      {/* Hero Banner con productos destacados */}
      {featuredProducts && featuredProducts.length > 0 && (
        <div className="hero-banner">
          <div className="hero-content">
            <h2 className="hero-title">🎉 Ofertas Especiales - Hasta 50% OFF</h2>
            <div className="carousel-container">
              <button 
                className="carousel-button carousel-button-prev"
                onClick={handlePrevSlide}
                aria-label="Anterior"
              >
                ‹
              </button>
              <div 
                className="featured-products-carousel"
                ref={carouselRef}
                onMouseEnter={() => {
                  if (autoPlayRef.current) clearInterval(autoPlayRef.current);
                }}
                onMouseLeave={() => {
                  if (featuredProducts && featuredProducts.length > 0) {
                    const productsPerSlide = 4;
                    const totalSlides = Math.ceil(featuredProducts.length / productsPerSlide);
                    autoPlayRef.current = setInterval(() => {
                      setCarouselIndex((prevIndex) => (prevIndex + 1) % totalSlides);
                    }, 5000);
                  }
                }}
              >
                {featuredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="featured-product-card"
                    onMouseEnter={() => handleProductHover(product.slug)}
                    onClick={() => navigate(`/products/${product.slug}`)}
                  >
                    {product.image_url ? (
                      <div className="product-image">
                        <img src={product.image_url} alt={product.name} />
                        {product.has_discount && (
                          <span className="discount-badge">
                            -{product.discount_percentage}%
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="product-image-placeholder">
                        <span>📦</span>
                      </div>
                    )}
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      <div className="product-price">
                        {product.has_discount && (
                          <span className="price-original">${product.price}</span>
                        )}
                        <span className="price-final">${product.final_price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                className="carousel-button carousel-button-next"
                onClick={handleNextSlide}
                aria-label="Siguiente"
              >
                ›
              </button>
            </div>
            {/* Indicadores del carrusel */}
            {(() => {
              const productsPerSlide = typeof window !== 'undefined' 
                ? (window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : window.innerWidth < 1400 ? 3 : 4)
                : 4;
              const totalSlides = Math.ceil(featuredProducts.length / productsPerSlide);
              return totalSlides > 1 ? (
                <div className="carousel-indicators">
                  {Array.from({ length: totalSlides }).map((_, index) => (
                    <button
                      key={index}
                      className={`carousel-indicator ${index === carouselIndex ? 'active' : ''}`}
                      onClick={() => setCarouselIndex(index)}
                      aria-label={`Ir a slide ${index + 1}`}
                    />
                  ))}
                </div>
              ) : null;
            })()}
          </div>
        </div>
      )}

      {/* Tarjetas de características */}
      <div className="feature-cards">
        <div className="feature-card">
          <div className="feature-icon">👤</div>
          <h3>Ingresa a tu cuenta</h3>
          <p>Disfruta de ofertas y compra sin límites.</p>
          <button className="feature-button">Ingresar</button>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📍</div>
          <h3>Ingresa tu ubicación</h3>
          <p>Consulta costos y tiempos de entrega.</p>
          <button className="feature-button">Agregar</button>
        </div>
        <div className="feature-card">
          <div className="feature-icon">💰</div>
          <h3>Menos de $100</h3>
          <p>Descubre productos con precios bajos.</p>
          <button className="feature-button">Ver productos</button>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔥</div>
          <h3>Más vendidos</h3>
          <p>Explora los productos que son tendencia.</p>
          <button className="feature-button" onClick={() => setFilterFeatured(true)}>Ver más</button>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🛡️</div>
          <h3>Compra protegida</h3>
          <p>Puedes devolver tu compra gratis.</p>
          <button className="feature-button">Cómo funciona</button>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🏪</div>
          <h3>Tiendas oficiales</h3>
          <p>Encuentra tus marcas preferidas.</p>
          <button className="feature-button">Ver tiendas</button>
        </div>
      </div>


      {isLoading ? (
        <div className="loading">Cargando productos...</div>
      ) : filteredAndSortedProducts.length > 0 ? (
        <>
          <p className="results-count">
            {filteredAndSortedProducts.length} producto{filteredAndSortedProducts.length !== 1 ? 's' : ''} encontrado{filteredAndSortedProducts.length !== 1 ? 's' : ''}
          </p>
          <div className="products-grid">
            {filteredAndSortedProducts.map((product) => (
              <div
                key={product.id}
                className="product-card"
                onMouseEnter={() => handleProductHover(product.slug)}
              >
                {product.image_url ? (
                  <div className="product-image" onClick={() => navigate(`/products/${product.slug}`)}>
                    <img src={product.image_url} alt={product.name} />
                    {product.has_discount && (
                      <span className="discount-badge">
                        -{product.discount_percentage}%
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="product-image-placeholder" onClick={() => navigate(`/products/${product.slug}`)}>
                    <span>📦</span>
                  </div>
                )}
                <div className="product-info">
                  <h3
                    onClick={() => navigate(`/products/${product.slug}`)}
                    className="product-name"
                  >
                    {product.name}
                  </h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-price">
                    {product.has_discount && (
                      <span className="price-original">${product.price}</span>
                    )}
                    <span className="price-final">${product.final_price}</span>
                  </div>
                  <div className="product-stock">
                    {product.is_available ? (
                      <span className="stock-available">
                        ✓ En stock ({product.stock} disponibles)
                      </span>
                    ) : (
                      <span className="stock-unavailable">✗ Sin stock</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.is_available || addToCartMutation.isPending}
                  className="add-to-cart-button"
                >
                  {addToCartMutation.isPending
                    ? 'Agregando...'
                    : product.is_available
                    ? 'Agregar al Carrito'
                    : 'Sin Stock'}
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-products">
          <p>No se encontraron productos</p>
        </div>
      )}
    </div>
  );
}

export default Home;


// src/components/VitrinePremium.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  FaWhatsapp, FaTags, FaChevronLeft, FaChevronRight,
  FaShoppingCart, FaMinus, FaPlus
} from 'react-icons/fa';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

export default function VitrinePremium() {
  // Config & dados
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [logo, setLogo] = useState('/images/logocliente.jpg');
  const [banners, setBanners] = useState([]);
  const [corPrimaria, setCorPrimaria] = useState('#2563eb');
  const [corSecundaria, setCorSecundaria] = useState('#22c55e');
  const [whatsappLoja, setWhatsappLoja] = useState('');
  const [modoExibicao, setModoExibicao] = useState('cards'); // cards | abas | lista

  // Carrinho e checkout
  const [carrinho, setCarrinho] = useState([]);
  const [etapa, setEtapa] = useState('vitrine'); // vitrine | carrinho | pagamento | processando | enviar
  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');

  // Carrossel
  const [bannerIndex, setBannerIndex] = useState(0);

  // Carregar config do localStorage
  useEffect(() => {
    setProdutos(JSON.parse(localStorage.getItem('products')) || []);
    setCategorias(JSON.parse(localStorage.getItem('categorias')) || []);
    setLogo(localStorage.getItem('logoCliente') || '/images/logocliente.jpg');
    setBanners(JSON.parse(localStorage.getItem('banners')) || []);
    setCorPrimaria(localStorage.getItem('corPrimaria') || '#2563eb');
    setCorSecundaria(localStorage.getItem('corSecundaria') || '#22c55e');
    setWhatsappLoja(localStorage.getItem('whatsappLoja') || '');
    setModoExibicao(localStorage.getItem('modoExibicao') || 'cards');
  }, []);

  // Auto-rotate dos banners
  useEffect(() => {
    if (etapa !== 'vitrine') return; // não rotaciona fora da vitrine
    if (banners.length > 1) {
      const id = setInterval(() => {
        setBannerIndex(i => (i + 1) % banners.length);
      }, 5000);
      return () => clearInterval(id);
    }
  }, [banners, etapa]);

  // Total do carrinho
  const total = useMemo(
    () => carrinho.reduce((s, p) => s + p.price * p.quantity, 0),
    [carrinho]
  );

  // Helpers do carrinho
  const addCart = (p) => {
    if (p.stock === 0) return;
    setCarrinho(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...p, quantity: 1 }];
    });
  };
  const decCart = (id) => {
    setCarrinho(prev =>
      prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0)
    );
  };
  const incCart = (id) => {
    setCarrinho(prev => prev.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i));
  };
  const removeItem = (id) => setCarrinho(prev => prev.filter(i => i.id !== id));

  // Fluxo checkout
  const abrirCarrinho = () => {
    setEtapa('carrinho');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const finalizarPedido = () => {
    if (!nome || !endereco) return alert('Preencha seu nome e endereço para continuar.');
    setEtapa('pagamento');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const efetuarPagamento = () => {
    setEtapa('processando');
    setTimeout(() => {
      const pedido = {
        nome, endereco, itens: carrinho, total,
        data: new Date().toLocaleString('pt-BR')
      };
      const store = JSON.parse(localStorage.getItem('pedidos')) || [];
      localStorage.setItem('pedidos', JSON.stringify([pedido, ...store]));
      setEtapa('enviar');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1800);
  };

  const enviarWhatsApp = () => {
    const numeroFormatado = '55' + (whatsappLoja || '').replace(/\D/g, '');
    const texto = `Olá, meu nome é ${nome}!\n\nGostaria de pedir:\n${carrinho
      .map(i => `${i.quantity}x ${i.name}`)
      .join('\n')}\n\nTotal: R$ ${total.toFixed(2)}\n\nEndereço: ${endereco}`;
    window.open(`https://wa.me/${numeroFormatado}?text=${encodeURIComponent(texto)}`, '_blank');
  };

  // UI helpers
  const BotaoPrimario = ({ children, onClick, className = '', disabled, title }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`relative overflow-hidden rounded-full px-5 py-2 font-medium text-white transition
        ${disabled ? 'bg-gray-400 cursor-not-allowed' : ''}
        ${!disabled ? 'shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_36px_rgba(0,0,0,0.18)]' : ''}
        ${className}`}
      style={{ background: disabled ? undefined : `linear-gradient(135deg, ${corPrimaria}, ${corSecundaria})` }}
    >
      <span className="relative z-10">{children}</span>
      {!disabled && (
        <span className="absolute inset-0 opacity-0 hover:opacity-10 transition" style={{ background: '#fff' }}/>
      )}
    </button>
  );

  const TituloCategoria = ({ cat }) => (
    <div className="text-center mb-6">
      <div
        className="inline-flex items-center gap-2 px-6 py-2 rounded-full shadow-lg border backdrop-blur-sm"
        style={{ borderColor: `${corPrimaria}20`, background: '#ffffffcc' }}
      >
        <FaTags style={{ color: corSecundaria }} />
        <h2 className="text-2xl font-semibold" style={{ color: corPrimaria }}>
          {cat}
        </h2>
      </div>
    </div>
  );

  const ProdutoCard = ({ p }) => (
    <div className="group bg-white rounded-2xl shadow-md p-4 flex flex-col items-center text-center transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative w-full">
        <img src={p.image} alt={p.name} className="w-full h-48 object-cover rounded-xl mb-3" />
        {p.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
            <span className="text-white font-semibold text-sm">ESGOTADO</span>
          </div>
        )}
      </div>
      <h3 className="font-semibold text-lg mb-1">{p.name}</h3>
      <p className="text-gray-600 mb-3">R$ {p.price.toFixed(2)}</p>
      <BotaoPrimario onClick={() => addCart(p)} disabled={p.stock === 0} className="w-full">
        {p.stock === 0 ? 'Esgotado' : 'Adicionar ao carrinho'}
      </BotaoPrimario>
    </div>
  );

  const gridCards = 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';

  const renderProdutos = () => {
    if (!categorias.length) {
      return <p className="text-center text-gray-500">Nenhuma categoria configurada.</p>;
    }

    if (modoExibicao === 'cards') {
      return categorias.map((cat, idx) => {
        const filtrados = produtos.filter(p => p.categoria === cat);
        if (!filtrados.length) return null;
        return (
          <section key={idx} className="mb-10">
            <TituloCategoria cat={cat} />
            <div className={gridCards}>
              {filtrados.map(p => <ProdutoCard key={p.id} p={p} />)}
            </div>
          </section>
        );
      });
    }

    if (modoExibicao === 'abas') {
      return (
        <Tabs>
          <TabList className="flex gap-3 mb-6 justify-center flex-wrap">
            {categorias.map((c, i) => (
              <Tab
                key={i}
                className="px-4 py-2 rounded-full cursor-pointer outline-none text-white"
                style={{ background: `linear-gradient(135deg, ${corPrimaria}, ${corSecundaria})` }}
              >
                {c}
              </Tab>
            ))}
          </TabList>
          {categorias.map((c, i) => (
            <TabPanel key={i}>
              <div className={gridCards}>
                {produtos.filter(p => p.categoria === c).map(p => <ProdutoCard key={p.id} p={p} />)}
              </div>
            </TabPanel>
          ))}
        </Tabs>
      );
    }

    // Lista com título (concisa estilosa)
    return categorias.map((cat, idx) => {
      const filtrados = produtos.filter(p => p.categoria === cat);
      if (!filtrados.length) return null;
      return (
        <section key={idx} className="mb-10">
          <TituloCategoria cat={cat} />
          <div className="divide-y bg-white/70 rounded-xl border overflow-hidden">
            {filtrados.map(p => (
              <div key={p.id} className="py-3 px-3 flex items-center justify-between hover:bg-gray-50 transition">
                <div className="flex gap-3 items-center">
                  <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded" />
                  <div>
                    <h3 className="font-medium text-sm">{p.name}</h3>
                    <p className="text-gray-600 text-xs">R$ {p.price.toFixed(2)}</p>
                  </div>
                </div>
                <BotaoPrimario onClick={() => addCart(p)} disabled={p.stock === 0} className="text-xs">
                  {p.stock === 0 ? 'Esgotado' : 'Adicionar'}
                </BotaoPrimario>
              </div>
            ))}
          </div>
        </section>
      );
    });
  };

  // Navegação de banners
  const prevBanner = () => {
    if (!banners.length) return;
    setBannerIndex(i => (i - 1 + banners.length) % banners.length);
  };
  const nextBanner = () => {
    if (!banners.length) return;
    setBannerIndex(i => (i + 1) % banners.length);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f6f7fb' }}>
      {/* HEADER (glass) */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-white/70 border-b" style={{ borderColor: `${corPrimaria}15` }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-14 md:h-16 object-contain drop-shadow-sm" />
            <div className="hidden md:block">
              <h1 className="text-xl font-bold" style={{ color: corPrimaria }}>Catálogo Premium</h1>
              <p className="text-xs text-gray-500">Experiência de compra elegante e direta</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <BotaoPrimario onClick={abrirCarrinho} className="flex items-center gap-2">
              <FaShoppingCart />
              <span>Carrinho ({carrinho.length})</span>
            </BotaoPrimario>
          </div>
        </div>
      </header>

      {/* BANNERS — só aparecem na vitrine */}
      {etapa === 'vitrine' && banners.length > 0 && (
        <section className="px-4 mt-3">
          <div className="relative max-w-7xl mx-auto rounded-2xl overflow-hidden shadow-lg">
            <img
              src={banners[bannerIndex]}
              alt={`Banner ${bannerIndex + 1}`}
              className="w-full object-cover"
              style={{ aspectRatio: '21 / 9' }}
            />

            {banners.length > 1 && (
              <>
                <button
                  aria-label="Banner anterior"
                  onClick={prevBanner}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 w-10 h-10 rounded-full grid place-items-center shadow"
                >
                  <FaChevronLeft />
                </button>
                <button
                  aria-label="Próximo banner"
                  onClick={nextBanner}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 w-10 h-10 rounded-full grid place-items-center shadow"
                >
                  <FaChevronRight />
                </button>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {banners.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setBannerIndex(i)}
                      className={`w-2.5 h-2.5 rounded-full transition ${i === bannerIndex ? 'scale-110' : 'opacity-50'}`}
                      style={{ background: corPrimaria }}
                      aria-label={`Ir ao banner ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* CONTEÚDO */}
      <main className="flex-grow max-w-7xl mx-auto p-6">
        {etapa === 'vitrine' && renderProdutos()}

        {etapa === 'carrinho' && (
          <section className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: corPrimaria }}>
              🛒 Seu Carrinho
            </h2>

            {carrinho.length === 0 ? (
              <p className="text-gray-500 text-center">Seu carrinho está vazio.</p>
            ) : (
              <div className="space-y-4">
                {carrinho.map((i) => (
                  <div key={i.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img src={i.image} alt={i.name} className="w-12 h-12 rounded object-cover" />
                      <div>
                        <p className="font-medium">{i.name}</p>
                        <p className="text-sm text-gray-500">R$ {i.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => decCart(i.id)}
                        className="w-8 h-8 grid place-items-center rounded-full bg-gray-100 hover:bg-gray-200"
                        aria-label="Diminuir quantidade"
                      >
                        <FaMinus size={12} />
                      </button>
                      <span className="w-8 text-center">{i.quantity}</span>
                      <button
                        onClick={() => incCart(i.id)}
                        className="w-8 h-8 grid place-items-center rounded-full bg-gray-100 hover:bg-gray-200"
                        aria-label="Aumentar quantidade"
                      >
                        <FaPlus size={12} />
                      </button>
                      <button
                        onClick={() => removeItem(i.id)}
                        className="ml-2 text-red-600 hover:underline text-sm"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}

                <hr />
                <p className="font-extrabold text-right text-lg">
                  Total: <span style={{ color: corPrimaria }}>R$ {total.toFixed(2)}</span>
                </p>

                <div className="grid gap-3">
                  <input
                    placeholder="Seu nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="border p-2 rounded w-full"
                  />
                  <input
                    placeholder="Endereço de entrega"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    className="border p-2 rounded w-full"
                  />

                  <BotaoPrimario onClick={finalizarPedido} className="w-full">
                    Finalizar Pedido
                  </BotaoPrimario>

                  <button
                    onClick={() => { setEtapa('vitrine'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="w-full rounded-full border px-5 py-2 text-sm hover:bg-gray-50"
                  >
                    Continuar comprando
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {etapa === 'pagamento' && (
          <section className="text-center space-y-5">
            <h2 className="text-2xl font-bold" style={{ color: corPrimaria }}>
              📸 Escaneie o QR Code para pagar
            </h2>
            <img src="/images/qrcodepix.png" alt="QR Code" className="mx-auto h-56 rounded-md border shadow" />
            <BotaoPrimario onClick={efetuarPagamento}>Confirmar pagamento</BotaoPrimario>
          </section>
        )}

        {etapa === 'processando' && (
          <section className="text-center">
            <p className="text-lg">⏳ Confirmando pagamento...</p>
          </section>
        )}

        {etapa === 'enviar' && (
          <section className="text-center space-y-4">
            <h2 className="text-3xl font-extrabold text-green-600">✅ Pedido Realizado com Sucesso!</h2>
            <p className="text-gray-600">
              Agora é só enviar seu pedido pelo WhatsApp para finalizar com a loja.
            </p>
            <BotaoPrimario onClick={enviarWhatsApp} className="mx-auto flex items-center gap-2">
              <FaWhatsapp size={18} /> Enviar pelo WhatsApp
            </BotaoPrimario>
          </section>
        )}
      </main>

      {/* Botão flutuante do carrinho (apenas na vitrine) */}
      {etapa === 'vitrine' && carrinho.length > 0 && (
        <button
          onClick={abrirCarrinho}
          className="fixed bottom-6 right-6 text-white rounded-full shadow-lg px-5 py-3 flex items-center gap-2 hover:shadow-xl"
          style={{ background: `linear-gradient(135deg, ${corPrimaria}, ${corSecundaria})` }}
        >
          <FaShoppingCart />
          Ver Carrinho ({carrinho.length})
        </button>
      )}
    </div>
  );
}
// src/components/ConfiguracoesGerais.jsx
import { useEffect, useState } from 'react';

export default function ConfiguracoesGerais() {
  const [logo, setLogo] = useState('');
  const [b1, setB1] = useState('');
  const [b2, setB2] = useState('');
  const [b3, setB3] = useState('');
  const [corPrimaria, setCorPrimaria] = useState('#2563eb');
  const [corSecundaria, setCorSecundaria] = useState('#22c55e');
  const [whats, setWhats] = useState('');
  const [modo, setModo] = useState('cards');
  const [statusPedidos, setStatusPedidos] = useState([]);
  const [novoStatus, setNovoStatus] = useState('');

  useEffect(() => {
    setLogo(localStorage.getItem('logoCliente') || '/images/logocliente.jpg');
    const banners = JSON.parse(localStorage.getItem('banners') || '[]');
    setB1(banners[0] || '');
    setB2(banners[1] || '');
    setB3(banners[2] || '');
    setCorPrimaria(localStorage.getItem('corPrimaria') || '#2563eb');
    setCorSecundaria(localStorage.getItem('corSecundaria') || '#22c55e');
    setStatusPedidos(JSON.parse(localStorage.getItem('pedidoStatusList') || '[]'));
    setWhats(localStorage.getItem('whatsappLoja') || '');
    setModo(localStorage.getItem('modoExibicao') || 'cards');
  }, []);

  const salvar = () => {
    const banners = [b1, b2, b3].filter(Boolean);
    // normaliza whatsapp: apenas números (DDD + número)
    const whatsClean = (whats || '').replace(/\D/g, '');

    localStorage.setItem('logoCliente', logo || '/images/logocliente.jpg');
    localStorage.setItem('banners', JSON.stringify(banners));
    localStorage.setItem('corPrimaria', corPrimaria || '#2563eb');
    localStorage.setItem('corSecundaria', corSecundaria || '#22c55e');
    localStorage.setItem('whatsappLoja', whatsClean);
    localStorage.setItem('modoExibicao', modo);
    localStorage.setItem('pedidoStatusList', JSON.stringify(statusPedidos.length ? statusPedidos : ['Novo', 'Preparando', 'Pronto', 'A caminho', 'Concluído', 'Cancelado']));


    alert('Configurações salvas! Abra a vitrine para ver as mudanças.');
  };

  const Campo = ({ label, children }) => (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">⚙️ Configurações Gerais</h1>
        <a href="/lojista" className="text-blue-600 hover:underline">← Voltar ao painel</a>
      </div>

      {/* Card principal */}
      <div className="bg-white rounded-xl shadow p-5 space-y-6">
        {/* Aparência */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Aparência</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Campo label="Logo (caminho em /public/images)">
              <input
                className="border p-2 rounded w-full"
                placeholder="/images/logocliente.jpg"
                value={logo}
                onChange={e => setLogo(e.target.value)}
              />
            </Campo>

            <div className="flex items-end">
              {logo ? (
                <img src={logo} alt="Prévia logo" className="h-16 object-contain border rounded p-1" />
              ) : (
                <div className="text-sm text-gray-500">Sem logo</div>
              )}
            </div>

            <Campo label="Banner 1 (caminho em /public/images)">
              <input
                className="border p-2 rounded w-full"
                placeholder="/images/banner1.png"
                value={b1}
                onChange={e => setB1(e.target.value)}
              />
            </Campo>
            <Campo label="Banner 2 (opcional)">
              <input
                className="border p-2 rounded w-full"
                placeholder="/images/banner2.png"
                value={b2}
                onChange={e => setB2(e.target.value)}
              />
            </Campo>
            <Campo label="Banner 3 (opcional)">
              <input
                className="border p-2 rounded w-full"
                placeholder="/images/banner3.png"
                value={b3}
                onChange={e => setB3(e.target.value)}
              />
            </Campo>

            <div className="md:col-span-2">
              <div className="flex gap-3 overflow-x-auto py-2">
                {[b1, b2, b3].filter(Boolean).map((b, i) => (
                  <img key={i} src={b} alt={`Banner ${i + 1}`} className="h-24 rounded border object-cover" />
                ))}
                {![b1, b2, b3].filter(Boolean).length && (
                  <div className="text-sm text-gray-500">Sem banners</div>
                )}
              </div>
            </div>

            <Campo label="Cor Primária">
              <input type="color" className="w-full h-10 rounded cursor-pointer" value={corPrimaria} onChange={e => setCorPrimaria(e.target.value)} />
            </Campo>
            <Campo label="Cor Secundária">
              <input type="color" className="w-full h-10 rounded cursor-pointer" value={corSecundaria} onChange={e => setCorSecundaria(e.target.value)} />
            </Campo>

            <Campo label="Modo de Exibição da Vitrine">
              <select
                className="border p-2 rounded w-full"
                value={modo}
                onChange={e => setModo(e.target.value)}
              >
                <option value="cards">Cards por categoria</option>
                <option value="abas">Abas por categoria</option>
                <option value="lista">Lista com título</option>
              </select>
            </Campo>
          </div>
        </section>
        {/* Status de Pedidos */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Status de Pedidos</h2>

          <div className="flex gap-2 mb-3">
            <input
              className="border p-2 rounded flex-1"
              placeholder="Ex: Preparando"
              value={novoStatus}
              onChange={(e) => setNovoStatus(e.target.value)}
            />
            <button
              onClick={() => {
                const v = (novoStatus || '').trim();
                if (!v) return;
                if (statusPedidos.includes(v)) return alert('Esse status já existe.');
                setStatusPedidos([...statusPedidos, v]);
                setNovoStatus('');
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:brightness-110"
            >
              Adicionar
            </button>
          </div>

          <ul className="divide-y rounded border">
            {statusPedidos.length === 0 ? (
              <li className="p-3 text-sm text-gray-500">Nenhum status configurado. Se vazio, usaremos um padrão ao salvar.</li>
            ) : statusPedidos.map((s, i) => (
              <li key={i} className="p-3 flex items-center justify-between">
                <span>{s}</span>
                <div className="flex gap-2">
                  {/* mover para cima */}
                  <button
                    title="Mover para cima"
                    className="text-gray-600 hover:underline disabled:opacity-30"
                    disabled={i === 0}
                    onClick={() => {
                      const arr = [...statusPedidos];
                      [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
                      setStatusPedidos(arr);
                    }}
                  >
                    ↑
                  </button>
                  {/* mover para baixo */}
                  <button
                    title="Mover para baixo"
                    className="text-gray-600 hover:underline disabled:opacity-30"
                    disabled={i === statusPedidos.length - 1}
                    onClick={() => {
                      const arr = [...statusPedidos];
                      [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
                      setStatusPedidos(arr);
                    }}
                  >
                    ↓
                  </button>
                  {/* remover */}
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => {
                      if (!confirm(`Remover status "${s}"?`)) return;
                      setStatusPedidos(statusPedidos.filter((x) => x !== s));
                    }}
                  >
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
        {/* Contato */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Contato</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Campo label="WhatsApp da Loja (DDD + número, ex: 11999825998)">
              <input
                className="border p-2 rounded w-full"
                placeholder="11999825998"
                value={whats}
                onChange={e => setWhats(e.target.value)}
              />
            </Campo>
            <div className="text-sm text-gray-500 flex items-end">
              O número será enviado com código do país automaticamente (55).
            </div>
          </div>
        </section>

        {/* Ações */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={salvar}
            className="bg-blue-600 text-white px-5 py-2 rounded hover:brightness-110"
          >
            Salvar Configurações
          </button>
          <a href="/" className="text-blue-600 hover:underline">
            Ver vitrine
          </a>
        </div>
      </div>
    </div>
  );
}
// src/components/ResumoPedidos.jsx
import { useEffect, useMemo, useRef, useState } from 'react';

const PAGE_SIZE = 10;

export default function ResumoPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [page, setPage] = useState(1);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [somenteNovos, setSomenteNovos] = useState(false);
  const [statusList, setStatusList] = useState([]);
  const [aberto, setAberto] = useState({});

  // para detectar novos pedidos (contagem unread)
  const unreadPrevRef = useRef(0);

  useEffect(() => {
    loadFromStorage();

    // polling simples do localStorage a cada 4s para detectar novos pedidos
    const id = setInterval(loadFromStorage, 4000);
    return () => clearInterval(id);
  }, []);

  const loadFromStorage = () => {
    const data = JSON.parse(localStorage.getItem('pedidos')) || [];
    data.sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));

    const unreadNow = data.filter(p => p.unread).length;
    if (unreadNow > unreadPrevRef.current) {
      playBeep(); // novo pedido chegou
    }
    unreadPrevRef.current = unreadNow;

    setPedidos(data);

    const s = JSON.parse(localStorage.getItem('pedidoStatusList') || '[]');
    setStatusList(s.length ? s : ['Novo','Preparando','Pronto','A caminho','Concluído','Cancelado']);
  };

  // beep leve via WebAudio (não precisa de arquivo .mp3)
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 880;
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.01);
      o.start();
      // curta decaída
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      o.stop(ctx.currentTime + 0.28);
    } catch {}
  };

  const persist = (list) => {
    setPedidos(list);
    localStorage.setItem('pedidos', JSON.stringify(list));
  };

  const onToggleDetalhes = (idxGlobal) => {
    setAberto(prev => ({ ...prev, [idxGlobal]: !prev[idxGlobal] }));
    const glob = [...pedidos];
    if (glob[idxGlobal]?.unread) {
      glob[idxGlobal] = { ...glob[idxGlobal], unread: false };
      persist(glob);
      // atualiza contador "prev"
      unreadPrevRef.current = glob.filter(p => p.unread).length;
    }
  };

  const updateStatus = (idxGlobal, novo) => {
    const glob = [...pedidos];
    glob[idxGlobal] = { ...glob[idxGlobal], status: novo };
    persist(glob);
  };

  const filtrados = useMemo(() => {
    let base = pedidos;
    if (filtroNome.trim()) {
      base = base.filter(p => (p.nome || '').toLowerCase().includes(filtroNome.toLowerCase()));
    }
    if (filtroStatus) {
      base = base.filter(p => (p.status || '') === filtroStatus);
    }
    if (somenteNovos) {
      base = base.filter(p => p.unread);
    }
    return base;
  }, [pedidos, filtroNome, filtroStatus, somenteNovos]);

  const totalPages = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filtrados.slice(start, start + PAGE_SIZE);

  return (
    <div className="max-w-6xl mx-auto">
      {/* filtros sticky para mobile */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b">
        <div className="p-4 grid md:grid-cols-4 gap-3 max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold md:col-span-1">📦 Pedidos</h1>
          <input
            type="text"
            placeholder="Buscar por nome..."
            className="p-2 border rounded w-full"
            value={filtroNome}
            onChange={(e) => { setPage(1); setFiltroNome(e.target.value); }}
          />
          <select
            className="p-2 border rounded w-full"
            value={filtroStatus}
            onChange={(e)=>{ setPage(1); setFiltroStatus(e.target.value); }}
          >
            <option value="">Todos os status</option>
            {statusList.map((s,i)=><option key={i} value={s}>{s}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={somenteNovos}
              onChange={(e)=>{ setPage(1); setSomenteNovos(e.target.checked); }}
            />
            Somente novos
          </label>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-3">
          <a href="/lojista" className="text-blue-600 hover:underline">← Voltar ao painel</a>
          <div className="text-sm text-gray-600">
            {filtrados.length} pedido(s) • Página {page} de {totalPages}
          </div>
        </div>

        {pageItems.length === 0 ? (
          <p className="text-gray-500">Nenhum pedido encontrado.</p>
        ) : (
          <div className="divide-y rounded border bg-white">
            {pageItems.map((pedido, localIdx) => {
              const idxGlobal = start + localIdx;

              return (
                <div key={idxGlobal} className="py-3 px-3">
                  {/* Grid responsivo da linha */}
                  <div className="
                    grid gap-2 items-center
                    grid-cols-1
                    sm:grid-cols-[auto,1fr,auto,auto,auto]
                  ">
                    {/* dot + data */}
                    <div className="flex items-center gap-2 order-1">
                      <span
                        className={`inline-block rounded-full ${pedido.unread ? 'bg-red-500' : 'bg-gray-300'} w-3 h-3 sm:w-2.5 sm:h-2.5`}
                        title={pedido.unread ? 'Novo' : 'Visualizado'}
                      />
                      <span className="font-medium text-sm sm:text-base">
                        📅 {pedido.data || '—'}
                      </span>
                    </div>

                    {/* nome */}
                    <div className="order-2 sm:order-2">
                      <span className="text-sm sm:text-base">🧑 {pedido.nome || '—'}</span>
                    </div>

                    {/* total */}
                    <div className="order-3 sm:order-3">
                      <span className="text-sm sm:text-base">💰 R$ {(pedido.total||0).toFixed(2)}</span>
                    </div>

                    {/* status */}
                    <div className="order-5 sm:order-4">
                      <select
                        className="border rounded px-2 py-1 w-full sm:w-auto text-sm sm:text-base"
                        value={pedido.status || statusList[0] || 'Novo'}
                        onChange={(e)=>updateStatus(idxGlobal, e.target.value)}
                      >
                        {statusList.map((s,i)=><option key={i} value={s}>{s}</option>)}
                      </select>
                    </div>

                    {/* ver detalhes */}
                    <div className="order-4 sm:order-5 sm:text-right">
                      <button
                        onClick={()=>onToggleDetalhes(idxGlobal)}
                        className="text-blue-600 hover:underline text-sm sm:text-base"
                      >
                        {aberto[idxGlobal] ? 'Ocultar' : 'Ver detalhes'}
                      </button>
                    </div>
                  </div>

                  {aberto[idxGlobal] && (
                    <div className="mt-3 bg-gray-50 p-3 rounded text-sm">
                      <p><strong>📍 Endereço:</strong> {pedido.endereco}</p>
                      <p className="mt-2"><strong>🛒 Itens:</strong></p>
                      <ul className="list-disc pl-6">
                        {(pedido.itens||[]).map((i, ix) => (
                          <li key={ix}>{i.quantity}x {i.name} — R$ {(i.quantity * i.price).toFixed(2)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-between items-center mt-6">
          <button
            disabled={page===1}
            onClick={()=>setPage(p=>Math.max(1,p-1))}
            className={`px-3 py-1 rounded ${page===1?'bg-gray-200 text-gray-400':'bg-blue-600 text-white'}`}>
            Anterior
          </button>
          <span>Página {page} de {totalPages}</span>
          <button
            disabled={page===totalPages}
            onClick={()=>setPage(p=>Math.min(totalPages,p+1))}
            className={`px-3 py-1 rounded ${page===totalPages?'bg-gray-200 text-gray-400':'bg-blue-600 text-white'}`}>
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}
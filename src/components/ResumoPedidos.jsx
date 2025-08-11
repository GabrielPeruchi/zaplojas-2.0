import { useEffect, useMemo, useState } from 'react';

const PAGE_SIZE = 10;

export default function ResumoPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [page, setPage] = useState(1);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [statusList, setStatusList] = useState([]);
  const [aberto, setAberto] = useState({}); // controla detalhes abertos

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('pedidos')) || [];
    data.sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));
    setPedidos(data);

    const s = JSON.parse(localStorage.getItem('pedidoStatusList') || '[]');
    setStatusList(s.length ? s : ['Novo', 'Preparando', 'Pronto', 'A caminho', 'Concluído', 'Cancelado']);
  }, []);

  const persist = (list) => {
    setPedidos(list);
    localStorage.setItem('pedidos', JSON.stringify(list));
  };

  const onToggleDetalhes = (idxGlobal) => {
    setAberto(prev => ({ ...prev, [idxGlobal]: !prev[idxGlobal] }));
    // marca como lido quando abrir
    const globList = [...pedidos];
    if (globList[idxGlobal]?.unread) {
      globList[idxGlobal] = { ...globList[idxGlobal], unread: false };
      persist(globList);
    }
  };

  const updateStatus = (idxGlobal, novo) => {
    const globList = [...pedidos];
    globList[idxGlobal] = { ...globList[idxGlobal], status: novo };
    persist(globList);
  };

  const filtrados = useMemo(() => {
    let base = pedidos;
    if (filtroNome.trim()) {
      base = base.filter(p => (p.nome || '').toLowerCase().includes(filtroNome.toLowerCase()));
    }
    if (filtroStatus) {
      base = base.filter(p => (p.status || '') === filtroStatus);
    }
    return base;
  }, [pedidos, filtroNome, filtroStatus]);

  const totalPages = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filtrados.slice(start, start + PAGE_SIZE);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">📦 Resumo de Pedidos</h1>
        <a href="/lojista" className="text-blue-600 hover:underline">← Voltar ao painel</a>
      </div>

      <div className="grid md:grid-cols-3 gap-3 mb-4">
        <input
          type="text"
          placeholder="Buscar por nome do cliente..."
          className="p-2 border rounded w-full"
          value={filtroNome}
          onChange={(e) => { setPage(1); setFiltroNome(e.target.value); }}
        />
        <select
          className="p-2 border rounded w-full"
          value={filtroStatus}
          onChange={(e) => { setPage(1); setFiltroStatus(e.target.value); }}
        >
          <option value="">Todos os status</option>
          {statusList.map((s, i) => <option key={i} value={s}>{s}</option>)}
        </select>
        <div className="text-right text-sm text-gray-600 self-center">
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
                {/* GRID responsivo: 1 col no mobile, 5 no desktop */}
                <div className="
        grid gap-2 items-center
        grid-cols-1
        sm:grid-cols-[auto,1fr,auto,auto,auto]
      ">
                  {/* dot + data */}
                  <div className="flex items-center gap-2 order-1">
                    <span
                      className={`inline-block rounded-full ${pedido.unread ? 'bg-red-500' : 'bg-gray-300'
                        } w-3 h-3 sm:w-2.5 sm:h-2.5`}
                      title={pedido.unread ? 'Novo' : 'Visualizado'}
                    />
                    <span className="font-medium text-sm sm:text-base">
                      📅 {pedido.data || '—'}
                    </span>
                  </div>

                  {/* nome (expande no desktop) */}
                  <div className="order-2 sm:order-2">
                    <span className="text-sm sm:text-base">🧑 {pedido.nome || '—'}</span>
                  </div>

                  {/* total (mantém perto do status) */}
                  <div className="order-3 sm:order-3">
                    <span className="text-sm sm:text-base">💰 R$ {(pedido.total || 0).toFixed(2)}</span>
                  </div>

                  {/* status (select vira full width no mobile) */}
                  <div className="order-5 sm:order-4">
                    <select
                      className="border rounded px-2 py-1 w-full sm:w-auto text-sm sm:text-base"
                      value={pedido.status || statusList[0] || 'Novo'}
                      onChange={(e) => updateStatus(idxGlobal, e.target.value)}
                    >
                      {statusList.map((s, i) => <option key={i} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* botão ver detalhes (gruda no fim da linha) */}
                  <div className="order-4 sm:order-5 sm:text-right">
                    <button
                      onClick={() => onToggleDetalhes(idxGlobal)}
                      className="text-blue-600 hover:underline text-sm sm:text-base"
                    >
                      {aberto[idxGlobal] ? 'Ocultar' : 'Ver detalhes'}
                    </button>
                  </div>
                </div>

                {/* detalhes (igual antes) */}
                {aberto[idxGlobal] && (
                  <div className="mt-3 bg-gray-50 p-3 rounded text-sm">
                    <p><strong>📍 Endereço:</strong> {pedido.endereco}</p>
                    <p className="mt-2"><strong>🛒 Itens:</strong></p>
                    <ul className="list-disc pl-6">
                      {(pedido.itens || []).map((i, ix) => (
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
          disabled={page === 1}
          onClick={() => setPage(p => Math.max(1, p - 1))}
          className={`px-3 py-1 rounded ${page === 1 ? 'bg-gray-200 text-gray-400' : 'bg-blue-600 text-white'}`}>
          Anterior
        </button>
        <span>Página {page} de {totalPages}</span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          className={`px-3 py-1 rounded ${page === totalPages ? 'bg-gray-200 text-gray-400' : 'bg-blue-600 text-white'}`}>
          Próxima
        </button>
      </div>
    </div>
  );
}
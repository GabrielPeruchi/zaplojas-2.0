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
    setStatusList(s.length ? s : ['Novo','Preparando','Pronto','A caminho','Concluído','Cancelado']);
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
          onChange={(e)=>{ setPage(1); setFiltroStatus(e.target.value); }}
        >
          <option value="">Todos os status</option>
          {statusList.map((s,i)=><option key={i} value={s}>{s}</option>)}
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
            // índice global no array completo (para editar status e unread)
            const idxGlobal = start + localIdx;
            return (
              <div key={idxGlobal} className="py-3 px-3">
                <div className="flex items-center gap-3 text-sm">
                  {/* dot unread */}
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${pedido.unread ? 'bg-red-500' : 'bg-transparent border border-gray-300'}`}
                    title={pedido.unread ? 'Novo pedido' : 'Visualizado'}
                  />
                  <span className="font-medium min-w-[180px]">📅 {pedido.data || '—'}</span>
                  <span className="min-w-[180px]">🧑 {pedido.nome || '—'}</span>
                  <span className="min-w-[120px]">💰 R$ {(pedido.total||0).toFixed(2)}</span>

                  {/* Status (editável) */}
                  <select
                    className="ml-auto border rounded px-2 py-1"
                    value={pedido.status || statusList[0] || 'Novo'}
                    onChange={(e)=>updateStatus(idxGlobal, e.target.value)}
                  >
                    {statusList.map((s,i)=><option key={i} value={s}>{s}</option>)}
                  </select>

                  {/* Ver detalhes */}
                  <button
                    onClick={()=>onToggleDetalhes(idxGlobal)}
                    className="text-blue-600 hover:underline ml-3"
                  >
                    {aberto[idxGlobal] ? 'Ocultar' : 'Ver detalhes'}
                  </button>
                </div>

                {aberto[idxGlobal] && (
                  <div className="mt-2 bg-gray-50 p-3 rounded text-sm">
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
  );
}
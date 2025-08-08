import { useEffect, useMemo, useState } from 'react';

const PAGE_SIZE = 10;

export default function ResumoPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [page, setPage] = useState(1);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('pedidos')) || [];
    data.sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));
    setPedidos(data);
  }, []);

  const filtrados = useMemo(() => {
    const base = filtro.trim()
      ? pedidos.filter(p => (p.nome || '').toLowerCase().includes(filtro.toLowerCase()))
      : pedidos;
    return base;
  }, [pedidos, filtro]);

  const totalPages = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filtrados.slice(start, start + PAGE_SIZE);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">📦 Resumo de Pedidos</h1>
        <a href="/lojista" className="text-blue-600 hover:underline">← Voltar ao painel</a>
      </div>

      <input
        type="text"
        placeholder="Buscar por nome do cliente..."
        className="w-full mb-4 p-2 border rounded"
        value={filtro}
        onChange={(e) => { setPage(1); setFiltro(e.target.value) }}
      />

      {pageItems.length === 0 ? (
        <p className="text-gray-500">Nenhum pedido encontrado.</p>
      ) : (
        <div className="space-y-2">
          {pageItems.map((pedido, idx) => (
            <div key={idx} className="border-b py-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">📅 {pedido.data || '—'}</span>
                <span>🧑 {pedido.nome}</span>
                <span>💰 R$ {(pedido.total||0).toFixed(2)}</span>
                <details className="ml-4">
                  <summary className="cursor-pointer text-blue-600">Ver detalhes</summary>
                  <div className="mt-2 bg-gray-50 p-3 rounded text-sm">
                    <p><strong>📍 Endereço:</strong> {pedido.endereco}</p>
                    <p className="mt-2"><strong>🛒 Itens:</strong></p>
                    <ul className="list-disc pl-6">
                      {(pedido.itens||[]).map((i, ix) => (
                        <li key={ix}>{i.quantity}x {i.name} - R$ {(i.quantity * i.price).toFixed(2)}</li>
                      ))}
                    </ul>
                  </div>
                </details>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center mt-6">
        <button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))}
          className={`px-3 py-1 rounded ${page===1?'bg-gray-200 text-gray-400':'bg-blue-600 text-white'}`}>
          Anterior
        </button>
        <span>Página {page} de {totalPages}</span>
        <button disabled={page===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}
          className={`px-3 py-1 rounded ${page===totalPages?'bg-gray-200 text-gray-400':'bg-blue-600 text-white'}`}>
          Próxima
        </button>
      </div>
    </div>
  );
}
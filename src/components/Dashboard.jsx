import { useEffect, useState } from 'react';
import { BarChart2, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const [pedidos, setPedidos] = useState([]);
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    setPedidos(JSON.parse(localStorage.getItem('pedidos')) || []);
    setProdutos(JSON.parse(localStorage.getItem('products')) || []);
  }, []);

  const totalVendas = pedidos.reduce((soma, p) => soma + (p.total || 0), 0);
  const totalPedidos = pedidos.length;
  const produtosVendidos = pedidos.reduce((total, pedido) => total + (pedido.itens || []).reduce((acc, item) => acc + (item.quantity || 0), 0), 0);

  const mapa = new Map();
  pedidos.forEach(p => (p.itens || []).forEach(i => {
    mapa.set(i.name, (mapa.get(i.name) || 0) + (i.quantity || 0));
  }));
  const entries = Array.from(mapa.entries()).sort((a,b)=>b[1]-a[1]);
  const maisVendido = entries[0]?.[0] || '—';
  const menosVendido = entries[entries.length-1]?.[0] || '—';

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <BarChart2 className="w-7 h-7" /> Dashboard de Vendas
      </h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-100 p-4 rounded-lg shadow">
          <h2 className="text-sm text-gray-700">Faturamento Total</h2>
          <p className="text-2xl font-bold text-blue-800">R$ {totalVendas.toFixed(2)}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg shadow">
          <h2 className="text-sm text-gray-700">Total de Pedidos</h2>
          <p className="text-2xl font-bold text-green-800">{totalPedidos}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg shadow">
          <h2 className="text-sm text-gray-700">Cookies Vendidos</h2>
          <p className="text-2xl font-bold text-yellow-800">{produtosVendidos}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">📋 Produtos em Estoque</h2>
        <ul className="divide-y">
          {produtos.map(prod => (
            <li key={prod.id} className="py-2 flex justify-between items-center">
              <span>{prod.name}</span>
              <span className={prod.stock === 0 ? 'text-red-600' : 'text-gray-800'}>
                {prod.stock === 0 ? <><AlertTriangle className="inline w-4 h-4 mr-1" /> Esgotado</> : `${prod.stock} unidades`}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-lg p-4 shadow">
        <h2 className="text-lg font-semibold">🏆 Destaques</h2>
        <p><strong>Mais vendido:</strong> {maisVendido}</p>
        <p><strong>Menos vendido:</strong> {menosVendido}</p>
      </div>
    </div>
  );
}
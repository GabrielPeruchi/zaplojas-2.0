import { useEffect, useState } from 'react';
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa';

const getInitialProducts = () => JSON.parse(localStorage.getItem('products')) || [];
const getInitialCategorias = () => JSON.parse(localStorage.getItem('categorias')) || [];

export default function GerenciarProdutos() {
  const [products, setProducts] = useState(getInitialProducts);
  const [categorias, setCategorias] = useState(getInitialCategorias);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoPreco, setNovoPreco] = useState('');
  const [novaImagem, setNovaImagem] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('');
  const [novaCategoriaNome, setNovaCategoriaNome] = useState('');

  const [produtoEditando, setProdutoEditando] = useState(null);

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    localStorage.setItem('categorias', JSON.stringify(categorias));
  }, [categorias]);

  const updateStock = (id, delta) => {
    setProducts(products.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p));
  };

  const removerProduto = (id) => {
    if (!confirm('Deseja realmente remover este produto?')) return;
    setProducts(products.filter(p => p.id !== id));
  };

  const adicionarProduto = () => {
    if (!novoNome || !novoPreco || !novaImagem || !novaCategoria) return alert('Preencha todos os campos.');
    const novoProduto = {
      id: Date.now(),
      name: novoNome,
      price: parseFloat(novoPreco),
      stock: 1,
      image: `/images/${novaImagem}`,
      categoria: novaCategoria,
    };
    setProducts([...products, novoProduto]);
    setNovoNome(''); setNovoPreco(''); setNovaImagem(''); setNovaCategoria('');
    setMostrarFormulario(false);
  };

  const iniciarEdicao = (produto) => setProdutoEditando({ ...produto });
  const salvarEdicao = () => {
    setProducts(products.map(p => p.id === produtoEditando.id ? produtoEditando : p));
    setProdutoEditando(null);
  };

  const adicionarCategoria = () => {
    if (!novaCategoriaNome) return;
    if (categorias.includes(novaCategoriaNome)) return alert('Categoria já existe.');
    setCategorias([...categorias, novaCategoriaNome]);
    setNovaCategoriaNome('');
  };

  const removerCategoria = (cat) => {
    if (!confirm(`Remover categoria "${cat}"? (os produtos manterão a tag antiga)`)) return;
    setCategorias(categorias.filter(c => c !== cat));
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🧰 Gerenciar Produtos & Categorias</h1>
        <a href="/lojista" className="text-blue-600 hover:underline">← Voltar</a>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Produtos */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Produtos</h2>
            <button onClick={()=>setMostrarFormulario(v=>!v)} className="bg-green-600 text-white px-3 py-2 rounded flex items-center gap-2">
              <FaPlus /> {mostrarFormulario ? 'Cancelar' : 'Adicionar Produto'}
            </button>
          </div>

          {mostrarFormulario && (
            <div className="mb-6 p-4 border rounded bg-gray-50">
              <div className="grid md:grid-cols-2 gap-3">
                <input type="text" placeholder="Nome do produto" value={novoNome} onChange={e=>setNovoNome(e.target.value)} className="border p-2 rounded" />
                <input type="number" placeholder="Preço" value={novoPreco} onChange={e=>setNovoPreco(e.target.value)} className="border p-2 rounded" />
                <input type="text" placeholder="Nome da imagem (ex: novo.jpg)" value={novaImagem} onChange={e=>setNovaImagem(e.target.value)} className="border p-2 rounded md:col-span-2" />
                <select value={novaCategoria} onChange={e=>setNovaCategoria(e.target.value)} className="border p-2 rounded md:col-span-2">
                  <option value="">Selecione a categoria</option>
                  {categorias.map((c,i)=>(<option key={i} value={c}>{c}</option>))}
                </select>
                <button onClick={adicionarProduto} className="bg-blue-600 text-white px-4 py-2 rounded hover:brightness-110 md:col-span-2">Salvar Produto</button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {products.map(p => (
              <div key={p.id} className="bg-white border p-3 rounded shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img src={p.image} className="w-12 h-12 object-cover rounded" />
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-sm text-gray-600">Estoque: {p.stock} • Categoria: {p.categoria||'—'}</p>
                    <p className="text-sm text-gray-600">Preço: R$ {p.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <button onClick={() => updateStock(p.id, -1)} className="px-2 bg-gray-200 rounded">-</button>
                  <button onClick={() => updateStock(p.id, 1)} className="px-2 bg-gray-200 rounded">+</button>
                  <button onClick={()=>iniciarEdicao(p)} className="text-blue-600 hover:text-blue-800"><FaEdit /></button>
                  <button onClick={()=>removerProduto(p.id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categorias */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Categorias</h2>
          <div className="flex gap-2 mb-4">
            <input type="text" placeholder="Nova categoria" value={novaCategoriaNome} onChange={e=>setNovaCategoriaNome(e.target.value)} className="border p-2 rounded flex-1" />
            <button onClick={adicionarCategoria} className="bg-blue-600 text-white px-4 py-2 rounded hover:brightness-110">Adicionar</button>
          </div>
          <ul className="divide-y">
            {categorias.map((c,i)=>(
              <li key={i} className="py-2 flex justify-between items-center">
                <span>{c}</span>
                <button onClick={()=>removerCategoria(c)} className="text-red-600 hover:text-red-800">Remover</button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {produtoEditando && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">✏️ Editar Produto</h2>
            <input type="text" className="border p-2 rounded mb-2 w-full" value={produtoEditando.name} onChange={e => setProdutoEditando({ ...produtoEditando, name: e.target.value })} />
            <input type="number" className="border p-2 rounded mb-2 w-full" value={produtoEditando.price} onChange={e => setProdutoEditando({ ...produtoEditando, price: parseFloat(e.target.value) })} />
            <input type="text" className="border p-2 rounded mb-2 w-full" value={(produtoEditando.image||'').replace('/images/','')} onChange={e => setProdutoEditando({ ...produtoEditando, image: `/images/${e.target.value}` })} />
            <select className="border p-2 rounded mb-4 w-full" value={produtoEditando.categoria||''} onChange={e => setProdutoEditando({ ...produtoEditando, categoria: e.target.value })}>
              <option value="">Selecione a categoria</option>
              {categorias.map((c,i)=>(<option key={i} value={c}>{c}</option>))}
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setProdutoEditando(null)} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
              <button onClick={salvarEdicao} className="px-4 py-2 bg-blue-600 text-white rounded">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
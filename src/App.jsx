// src/App.jsx
import { Routes, Route, Link } from 'react-router-dom'
import { useEffect } from 'react'
import VitrinePremium from './components/VitrinePremium'
import Dashboard from './components/Dashboard'
import ResumoPedidos from './components/ResumoPedidos'
import GerenciarProdutos from './components/GerenciarProdutos'
import ConfiguracoesGerais from './components/ConfiguracoesGerais'

function seed() {
  if (!localStorage.getItem('products')) {
    localStorage.setItem('products', JSON.stringify([
      { id: 1, name: 'Cookie de Chocolate', price: 6.50, stock: 12, image: '/images/chocolate.jpg', categoria: 'Clássicos' },
      { id: 2, name: 'Cookie de Pistache', price: 7.00, stock: 8, image: '/images/pistache.jpg', categoria: 'Especiais' },
      { id: 3, name: 'Cookie Red Velvet', price: 7.50, stock: 5, image: '/images/redvelvet.jpg', categoria: 'Especiais' },
    ]))
  }
  if (!localStorage.getItem('categorias')) {
    localStorage.setItem('categorias', JSON.stringify(['Clássicos','Especiais']))
  }
  if (!localStorage.getItem('logoCliente')) {
    localStorage.setItem('logoCliente','/images/logocliente.jpg')
  }
  if (!localStorage.getItem('banners')) {
    localStorage.setItem('banners', JSON.stringify(['/images/banner1.png','/images/banner2.png','/images/banner3.png']))
  }
  if (!localStorage.getItem('corPrimaria')) localStorage.setItem('corPrimaria','#2563eb')
  if (!localStorage.getItem('corSecundaria')) localStorage.setItem('corSecundaria','#22c55e')
  if (!localStorage.getItem('whatsappLoja')) localStorage.setItem('whatsappLoja','11999825998')
  if (!localStorage.getItem('modoExibicao')) localStorage.setItem('modoExibicao','cards')
}

export default function App(){
  useEffect(()=>{ seed() },[])

  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex gap-4 items-center p-4">
          <Link to="/" className="font-bold text-blue-600">Vitrine</Link>
          <Link to="/lojista" className="text-gray-700 hover:underline">Lojista</Link>
          <Link to="/config" className="text-gray-700 hover:underline">Configurações</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<VitrinePremium />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pedidos" element={<ResumoPedidos />} />
        <Route path="/lojista/produtos" element={<GerenciarProdutos />} />
        <Route path="/config" element={<ConfiguracoesGerais />} />
        <Route
          path="/lojista"
          element={
            <div className="max-w-4xl mx-auto p-6">
              <h1 className="text-3xl font-bold mb-6">👩‍💼 Painel do Lojista</h1>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link to="/dashboard" className="bg-blue-600 text-white p-6 rounded-lg shadow hover:brightness-110">📊 Dashboard</Link>
                <Link to="/pedidos" className="bg-green-600 text-white p-6 rounded-lg shadow hover:brightness-110">📦 Pedidos</Link>
                <Link to="/lojista/produtos" className="bg-yellow-500 text-white p-6 rounded-lg shadow hover:brightness-110">🧰 Produtos & Categorias</Link>
                <Link to="/config" className="bg-purple-600 text-white p-6 rounded-lg shadow hover:brightness-110">⚙️ Configurações</Link>
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  )
}
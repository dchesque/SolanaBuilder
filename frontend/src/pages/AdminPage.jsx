// src/pages/AdminPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import {
  Coins,
  LogOut,
  AlertCircle,
  FileText,
  BarChart2,
  Users,
  Activity,
  Check,
  X,
  Info,
  Filter,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Database,
  Pencil,
  ExternalLink,
  Copy
} from "lucide-react";

// Componente de cartão de estatísticas
const StatCard = ({ title, value, icon, change, color }) => {
  return (
    <div className="bg-purple-900/20 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-purple-300 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white">{value}</h3>
          {change && (
            <p className={`text-xs mt-2 ${change >= 0 ? "text-green-400" : "text-red-400"}`}>
              {change >= 0 ? "+" : ""}{change}% desde ontem
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color || "purple"}-500/20`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Componente para linha de log
const LogItem = ({ log }) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (type) => {
    switch (type) {
      case "success":
        return "text-green-400";
      case "error":
        return "text-red-400";
      case "info":
      default:
        return "text-blue-400";
    }
  };

  const getStatusIcon = (type) => {
    switch (type) {
      case "success":
        return <Check className="w-5 h-5 text-green-400" />;
      case "error":
        return <X className="w-5 h-5 text-red-400" />;
      case "info":
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div 
      className="p-4 bg-purple-900/10 rounded-lg mb-3 border border-purple-500/10 hover:border-purple-500/30 transition-all cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {getStatusIcon(log.type)}
          </div>
          <div>
            <p className="text-white font-medium">{log.message}</p>
            <p className="text-sm text-purple-300">
              {new Date(log.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(log.type)} bg-${log.type === "success" ? "green" : log.type === "error" ? "red" : "blue"}-500/10`}>
          {log.type}
        </span>
      </div>
      
      {expanded && log.details && Object.keys(log.details).length > 0 && (
        <div className="mt-4 p-3 bg-purple-900/30 rounded-lg overflow-auto max-h-40">
          <pre className="text-xs text-purple-200 font-mono">
            {JSON.stringify(log.details, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

// Componente para Token na lista
const TokenItem = ({ token }) => {
  const [expanded, setExpanded] = useState(false);
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copiado para a área de transferência!");
  };

  return (
    <div 
      className="p-4 bg-purple-900/10 rounded-lg mb-3 border border-purple-500/10 hover:border-purple-500/30 transition-all"
    >
      <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <Coins className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-white font-medium">{token.name} ({token.symbol})</p>
            <p className="text-sm text-purple-300">
              Criado em: {new Date(token.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded-full text-xs text-green-400 bg-green-500/10">
            Supply: {token.supply.toLocaleString()}
          </span>
        </div>
      </div>
      
      {expanded && (
        <div className="mt-4 p-3 bg-purple-900/30 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-purple-200 mb-1">Endereço do Token:</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-purple-900/50 p-1 rounded font-mono text-purple-100 break-all">
                  {token.address}
                </code>
                <button 
                  onClick={() => copyToClipboard(token.address)}
                  className="p-1 rounded bg-purple-500/20 hover:bg-purple-500/30 transition-colors"
                >
                  <Copy className="w-4 h-4 text-purple-300" />
                </button>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-purple-200 mb-1">Criador:</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-purple-900/50 p-1 rounded font-mono text-purple-100">
                  {token.creator.slice(0, 4)}...{token.creator.slice(-4)}
                </code>
                <button 
                  onClick={() => copyToClipboard(token.creator)}
                  className="p-1 rounded bg-purple-500/20 hover:bg-purple-500/30 transition-colors"
                >
                  <Copy className="w-4 h-4 text-purple-300" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-purple-200 mb-1">Decimais:</p>
              <p className="text-sm text-white">{token.decimals}</p>
            </div>
            
            <div>
              <p className="text-sm text-purple-200 mb-1">Taxa:</p>
              <p className="text-sm text-white">{token.fee} SOL</p>
            </div>
            
            <div>
              <p className="text-sm text-purple-200 mb-1">Bloco:</p>
              <p className="text-sm text-white">{token.blockHeight}</p>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <a 
              href={`https://solscan.io/token/${token.address}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-purple-300 hover:text-purple-100"
            >
              <ExternalLink className="w-3 h-3" /> 
              Ver no Solscan
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para Metadado na lista
const MetadataItem = ({ metadata }) => {
  const [expanded, setExpanded] = useState(false);
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copiado para a área de transferência!");
  };

  return (
    <div 
      className="p-4 bg-purple-900/10 rounded-lg mb-3 border border-purple-500/10 hover:border-purple-500/30 transition-all"
    >
      <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <FileText className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <p className="text-white font-medium">{metadata.name} ({metadata.symbol})</p>
            <p className="text-sm text-purple-300">
              Atualizado em: {new Date(metadata.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded-full text-xs text-pink-400 bg-pink-500/10">
            {metadata.updateType}
          </span>
        </div>
      </div>
      
      {expanded && (
        <div className="mt-4 p-3 bg-purple-900/30 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-purple-200 mb-1">Endereço do Token:</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-purple-900/50 p-1 rounded font-mono text-purple-100 break-all">
                  {metadata.tokenAddress}
                </code>
                <button 
                  onClick={() => copyToClipboard(metadata.tokenAddress)}
                  className="p-1 rounded bg-purple-500/20 hover:bg-purple-500/30 transition-colors"
                >
                  <Copy className="w-4 h-4 text-purple-300" />
                </button>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-purple-200 mb-1">Atualizador:</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-purple-900/50 p-1 rounded font-mono text-purple-100">
                  {metadata.updater.slice(0, 4)}...{metadata.updater.slice(-4)}
                </code>
                <button 
                  onClick={() => copyToClipboard(metadata.updater)}
                  className="p-1 rounded bg-purple-500/20 hover:bg-purple-500/30 transition-colors"
                >
                  <Copy className="w-4 h-4 text-purple-300" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-purple-200 mb-1">Alterações:</p>
            <div className="text-xs bg-purple-900/50 p-2 rounded text-purple-100 max-h-32 overflow-auto">
              <pre>{JSON.stringify(metadata.changes, null, 2)}</pre>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-purple-200 mb-1">URI de Metadados:</p>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={metadata.uri} 
                readOnly
                className="text-xs bg-purple-900/50 p-1 rounded font-mono text-purple-100 w-full"
              />
              <button 
                onClick={() => copyToClipboard(metadata.uri)}
                className="p-1 rounded bg-purple-500/20 hover:bg-purple-500/30 transition-colors flex-shrink-0"
              >
                <Copy className="w-4 h-4 text-purple-300" />
              </button>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end gap-2">
            <a 
              href={metadata.uri} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-purple-300 hover:text-purple-100"
            >
              <ExternalLink className="w-3 h-3" /> 
              Ver Metadados
            </a>
            <a 
              href={`https://solscan.io/token/${metadata.tokenAddress}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-purple-300 hover:text-purple-100"
            >
              <ExternalLink className="w-3 h-3" /> 
              Ver no Solscan
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default function AdminPage() {
  const navigate = useNavigate();
  const { publicKey, disconnect } = useWallet();
  const { connection } = useConnection();
  
  // Estados
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    tokens_created: 0,
    metadata_updates: 0,
    service_fees_collected: 0,
  });
  const [logs, setLogs] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [metadataUpdates, setMetadataUpdates] = useState([]);
  const [activePage, setActivePage] = useState("dashboard");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [logFilter, setLogFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Verificar se é admin usando a carteira conectada
  useEffect(() => {
    const checkAdmin = async () => {
      if (!publicKey) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        // Requisição para verificar se é admin
        const response = await fetch("http://localhost:3001/admin/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet: publicKey.toString() }),
        });

        const data = await response.json();
        
        if (data.success) {
          setIsAdmin(true);
          loadDashboardData();
        } else {
          setIsAdmin(false);
          // Redirecionar se não for admin
          navigate("/");
        }
      } catch (error) {
        console.error("Erro ao verificar admin:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, [publicKey, navigate]);

  // Carregar dados do dashboard
  const loadDashboardData = async () => {
    try {
      const response = await fetch("http://localhost:3001/admin/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: publicKey.toString() }),
      });

      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  // Carregar logs
  const loadLogs = async (page = 1, filter = "") => {
    try {
      const response = await fetch("http://localhost:3001/admin/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          wallet: publicKey.toString(),
          page,
          limit: 10,
          type: filter || undefined,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setLogs(data.logs);
        setTotalPages(data.totalPages);
        setCurrentPage(data.page);
      }
    } catch (error) {
      console.error("Erro ao carregar logs:", error);
    }
  };

  // Carregar tokens
  const loadTokens = async () => {
    try {
      setIsLoading(true);
      
      // Simular dados para demonstração - em produção, seria uma chamada à API real
      const mockTokens = [
        {
          name: "Sample Token",
          symbol: "SMPL",
          address: "8xn5Qm97zQoghRg3ATrAcD7ugXnbYnFZqJHQDm8UK11p",
          creator: "AaXs7cLGcSVAsEt8QxstVrqhLhYN2iGhFNnHUyGxYXpX",
          supply: 1000000000,
          decimals: 9,
          fee: 0.01,
          blockHeight: 123456789,
          createdAt: new Date().getTime() - 86400000 * 3 // 3 dias atrás
        },
        {
          name: "Meme Coin",
          symbol: "MEME",
          address: "4CKDvPhaEDevKTHSc2iWyvjqKKB4ZwEXHxwL3PS8jSLa",
          creator: "BbXs7cLGcSVAsEt8QxstVrqhLhYN2iGhFNnHUyGxYXpX",
          supply: 69420000000,
          decimals: 9,
          fee: 0.01,
          blockHeight: 123456790,
          createdAt: new Date().getTime() - 86400000 * 2 // 2 dias atrás
        },
        {
          name: "Utility Token",
          symbol: "UTIL",
          address: "5cL2WVQGWnxpe9AsEt8QxstVrqhLhYN2iGhFNnHUyGxY",
          creator: "CcXs7cLGcSVAsEt8QxstVrqhLhYN2iGhFNnHUyGxYXpX",
          supply: 5000000,
          decimals: 6,
          fee: 0.01,
          blockHeight: 123456791,
          createdAt: new Date().getTime() - 86400000 // 1 dia atrás
        }
      ];
      
      setTokens(mockTokens);
      setIsLoading(false);
      
      // Em produção, seria algo como:
      /*
      const response = await fetch("http://localhost:3001/admin/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: publicKey.toString() }),
      });

      const data = await response.json();
      
      if (data.success) {
        setTokens(data.tokens);
      }
      */
    } catch (error) {
      console.error("Erro ao carregar tokens:", error);
      setIsLoading(false);
    }
  };

  // Carregar metadados
  const loadMetadataUpdates = async () => {
    try {
      setIsLoading(true);
      
      // Simular dados para demonstração - em produção, seria uma chamada à API real
      const mockMetadata = [
        {
          name: "Sample Token",
          symbol: "SMPL",
          tokenAddress: "8xn5Qm97zQoghRg3ATrAcD7ugXnbYnFZqJHQDm8UK11p",
          updater: "AaXs7cLGcSVAsEt8QxstVrqhLhYN2iGhFNnHUyGxYXpX",
          updateType: "Criação",
          changes: {
            name: { old: null, new: "Sample Token" },
            symbol: { old: null, new: "SMPL" },
            description: { old: null, new: "A sample token for demonstration" }
          },
          uri: "https://arweave.net/metadata/sample-token",
          updatedAt: new Date().getTime() - 86400000 * 3 // 3 dias atrás
        },
        {
          name: "Meme Coin",
          symbol: "MEME",
          tokenAddress: "4CKDvPhaEDevKTHSc2iWyvjqKKB4ZwEXHxwL3PS8jSLa",
          updater: "BbXs7cLGcSVAsEt8QxstVrqhLhYN2iGhFNnHUyGxYXpX",
          updateType: "Atualização de Imagem",
          changes: {
            image: { old: "https://old-image.com", new: "https://new-image.com" }
          },
          uri: "https://arweave.net/metadata/meme-coin",
          updatedAt: new Date().getTime() - 86400000 * 2 // 2 dias atrás
        },
        {
          name: "Utility Token",
          symbol: "UTIL",
          tokenAddress: "5cL2WVQGWnxpe9AsEt8QxstVrqhLhYN2iGhFNnHUyGxY",
          updater: "CcXs7cLGcSVAsEt8QxstVrqhLhYN2iGhFNnHUyGxYXpX",
          updateType: "Atualização Completa",
          changes: {
            name: { old: "Old Utility", new: "Utility Token" },
            symbol: { old: "OLD", new: "UTIL" },
            description: { old: "Old description", new: "New improved description" },
            website: { old: null, new: "https://utility-token.com" }
          },
          uri: "https://arweave.net/metadata/utility-token",
          updatedAt: new Date().getTime() - 86400000 // 1 dia atrás
        }
      ];
      
      setMetadataUpdates(mockMetadata);
      setIsLoading(false);
      
      // Em produção, seria algo como:
      /*
      const response = await fetch("http://localhost:3001/admin/metadata-updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: publicKey.toString() }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMetadataUpdates(data.metadataUpdates);
      }
      */
    } catch (error) {
      console.error("Erro ao carregar atualizações de metadados:", error);
      setIsLoading(false);
    }
  };

  // Trocar de página de logs
  const changePage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    loadLogs(page, logFilter);
  };

  // Filtrar logs por tipo
  const filterLogs = (type) => {
    setLogFilter(type);
    setCurrentPage(1);
    loadLogs(1, type);
  };

  // Atualizar dados com base na página ativa
  const refreshData = () => {
    switch (activePage) {
      case "dashboard":
        loadDashboardData();
        break;
      case "logs":
        loadLogs(currentPage, logFilter);
        break;
      case "tokens":
        loadTokens();
        break;
      case "metadata":
        loadMetadataUpdates();
        break;
      default:
        break;
    }
  };

  // Carregar dados quando a página ativa mudar
  useEffect(() => {
    if (isAdmin) {
      refreshData();
    }
  }, [activePage, isAdmin]);

  // Se não estiver logado, exibir tela de login
  if (!publicKey) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0120]">
        <div className="w-full max-w-md p-8 bg-purple-900/20 backdrop-blur-sm rounded-xl border border-purple-500/20">
          <h1 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Área do Administrador
          </h1>
          <p className="text-center text-purple-300 mb-6">
            Conecte sua carteira para acessar a área administrativa.
          </p>
          
          <div className="flex justify-center">
            <WalletMultiButton
              className="
                !py-2
                !px-5
                !rounded-md
                !bg-gradient-to-r
                !from-purple-500
                !to-pink-500
                !hover:from-purple-600
                !hover:to-pink-600
                !text-white
                !font-bold
                !shadow-lg
                !hover:shadow-xl
                !transition
              "
            />
          </div>
        </div>
      </div>
    );
  }

  // Se estiver carregando, exibir loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0120]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        <p className="mt-4 text-purple-300">Carregando...</p>
      </div>
    );
  }

  // Se não for admin, redirecionar (já tratado no useEffect)
  if (!isAdmin) {
    return null;
  }

  // Render dashboard
  const renderDashboard = () => (
    <div className="mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <StatCard
          title="Tokens Criados"
          value={stats.tokens_created}
          icon={<Coins className="w-6 h-6 text-purple-400" />}
          change={3.2}
          color="purple"
        />
        <StatCard
          title="Metadados Atualizados"
          value={stats.metadata_updates}
          icon={<FileText className="w-6 h-6 text-pink-400" />}
          change={1.8}
          color="pink"
        />
        <StatCard
          title="Taxas Coletadas (SOL)"
          value={stats.service_fees_collected.toFixed(4)}
          icon={<Coins className="w-6 h-6 text-amber-400" />}
          change={5.1}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-purple-900/20 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" /> Atividade Recente
          </h3>
          <div className="space-y-4">
            {logs.slice(0, 5).map((log) => (
              <LogItem key={log.id} log={log} />
            ))}
            {logs.length === 0 && (
              <p className="text-purple-300 text-sm">Nenhum log disponível.</p>
            )}
          </div>
        </div>

        <div className="bg-purple-900/20 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-purple-400" /> Alertas do Sistema
          </h3>
          <div className="space-y-4">
            {logs.filter(log => log.type === "error").slice(0, 5).map((log) => (
              <LogItem key={log.id} log={log} />
            ))}
            {logs.filter(log => log.type === "error").length === 0 && (
              <p className="text-green-400 text-sm">Nenhum erro ou alerta ativo.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Render logs
  const renderLogs = () => (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-white">Logs do Sistema</h2>
          <button
            onClick={refreshData}
            className="p-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-purple-400" />
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2 bg-purple-900/30 border border-purple-500/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              placeholder="Buscar logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-1">
            <button
              onClick={() => filterLogs("")}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                logFilter === "" 
                  ? "bg-purple-500/40 text-white" 
                  : "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => filterLogs("success")}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                logFilter === "success" 
                  ? "bg-green-500/40 text-white" 
                  : "bg-green-500/20 text-green-300 hover:bg-green-500/30"
              }`}
            >
              Sucesso
            </button>
            <button
              onClick={() => filterLogs("error")}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                logFilter === "error" 
                  ? "bg-red-500/40 text-white" 
                  : "bg-red-500/20 text-red-300 hover:bg-red-500/30"
              }`}
            >
              Erros
            </button>
            <button
              onClick={() => filterLogs("info")}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                logFilter === "info" 
                  ? "bg-blue-500/40 text-white" 
                  : "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
              }`}
            >
              Info
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-purple-900/20 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20 mb-6">
        <div className="space-y-2">
          {logs.map((log) => (
            <LogItem key={log.id} log={log} />
          ))}
          {logs.length === 0 && (
            <p className="text-purple-300 text-center py-6">Nenhum log encontrado.</p>
          )}
        </div>
      </div>
      
      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <span className="px-4 py-2 bg-purple-900/30 rounded-lg text-purple-200">
              Página {currentPage} de {totalPages}
            </span>
            
            <button
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0120] text-white">
      {/* Overlay gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-2/3 h-1/2 bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute -top-1/4 right-0 w-2/4 h-2/3 bg-pink-900/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-1/2 h-1/2 bg-purple-800/20 rounded-full blur-[160px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-[#0B0120]/80 backdrop-blur-md border-b border-purple-500/20 p-4 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-purple-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              SolanaMint Admin
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-purple-300">
              Admin: <span className="text-white font-mono">{publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}</span>
            </span>
            
            <button
              onClick={disconnect}
              className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Desconectar
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar + Content */}
      <div className="pt-20 flex min-h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-[#0B0120]/80 backdrop-blur-md border-r border-purple-500/20 p-6 fixed left-0 top-20 bottom-0">
          <div className="space-y-2">
            <button
              onClick={() => {
                setActivePage("dashboard");
                loadDashboardData();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                activePage === "dashboard"
                  ? "bg-purple-500/30 text-white"
                  : "text-purple-300 hover:bg-purple-500/20"
              } transition-colors`}
            >
              <BarChart2 className="w-5 h-5" />
              Dashboard
            </button>
            
            <button
              onClick={() => {
                setActivePage("logs");
                loadLogs(1);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                activePage === "logs"
                  ? "bg-purple-500/30 text-white"
                  : "text-purple-300 hover:bg-purple-500/20"
              } transition-colors`}
            >
              <FileText className="w-5 h-5" />
              Logs do Sistema
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64 p-6">
          <div className="max-w-7xl">
            <div className="mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {activePage === "dashboard" ? "Dashboard" : "Logs do Sistema"}
              </h1>
              <p className="text-purple-300 mt-1">
                {activePage === "dashboard"
                  ? "Estatísticas e visão geral da plataforma"
                  : "Registro detalhado das atividades do sistema"}
              </p>
            </div>

            {activePage === "dashboard" && renderDashboard()}
            {activePage === "logs" && renderLogs()}
          </div>
        </div>
      </div>
    </div>
  );
}
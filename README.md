# B&H Flow — CRM SaaS de Recrutamento

Sistema de gestão de candidatos com pipeline Kanban, dashboard analítico e relatórios.

## 🚀 Início Rápido

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis (opcional — sem .env roda em modo demo)
cp .env.example .env
# Edite o .env com suas credenciais Supabase

# 3. Iniciar servidor de desenvolvimento
npm run dev

# 4. Build para produção
npm run build
```

O app abrirá em **http://localhost:5173**

---

## ⚡ Modo Demo

Sem configurar o `.env`, o app roda em **modo demo**:
- Dados salvos no `localStorage` do navegador
- Login aceita qualquer e-mail e senha
- 100% funcional para testes e demonstrações

---

## 🔐 Configurar Supabase (produção)

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **Project Settings → API** e copie a URL e a `anon key`
3. Cole no `.env`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
4. Execute a migração no **SQL Editor** do Supabase:
   ```
   supabase/migrations/001_bhflow_init.sql
   ```

---

## 🌐 Deploy na Vercel

```bash
# Via CLI
npm i -g vercel
vercel

# Ou conecte o repositório GitHub em vercel.com
```

Adicione as variáveis de ambiente no painel da Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 📁 Estrutura do Projeto

```
bhflow-saas/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
├── .env.example
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── assets/
    ├── components/
    │   ├── kanban/       KanbanBoard
    │   ├── layout/       AppShell (sidebar + header)
    │   └── ui/           Button, Input, Modal, StatCard...
    ├── contexts/
    │   ├── AuthContext.jsx
    │   └── ToastContext.jsx
    ├── hooks/
    │   └── useRegistros.jsx
    ├── lib/
    │   └── supabase.js    cliente centralizado
    ├── pages/
    │   ├── Auth.jsx
    │   ├── Dashboard.jsx  (Recharts: Linha, Barras, Pizza)
    │   ├── Pipeline.jsx   (Kanban drag & drop)
    │   ├── Candidatos.jsx (lista + filtros + CRUD)
    │   └── Relatorio.jsx
    ├── routes/
    │   └── AppRoutes.jsx  (react-router + rotas protegidas)
    ├── services/
    │   ├── authService.js
    │   └── registrosService.js
    ├── styles/
    │   └── global.css
    └── utils/
        ├── constants.js
        ├── dates.js
        └── helpers.js
```

---

## 🛠️ Stack

| Tecnologia | Versão | Uso |
|---|---|---|
| React | 18 | UI |
| Vite | 5 | Build |
| TailwindCSS | 3 | Estilização |
| Recharts | 2 | Gráficos |
| React Router | 6 | Roteamento |
| Supabase JS | 2 | Auth + Banco |

# 🔧 GUIA COMPLETO - SETUP BANCO DE DADOS

## 🚨 PROBLEMA IDENTIFICADO

**Cadastro de clientes e carros não funciona** porque:
- ❌ Banco de dados `locadora` não foi criado
- ❌ Tabelas não foram sincronizadas
- ❌ TypeORM não consegue conectar/persistir dados

---

## ✅ SOLUÇÃO PASSO A PASSO

### Passo 1: Verificar PostgreSQL

PostgreSQL **JÁ ESTÁ RODANDO** ✅ (confirmado via Get-Process)

### Passo 2: Criar Banco de Dados

Abra **pgAdmin** ou **DBeaver** (ferramentas GUI para PostgreSQL):

**Opção A) Usando pgAdmin (Interface Web)**
```
1. Abra http://localhost:5050
2. Conecte com postgres:root
3. Clique direito em "Databases"
4. Create → Database
5. Nome: locadora
6. Clique "Create"
```

**Opção B) Usando DBeaver (Desktop)**
```
1. Abra DBeaver
2. Conecte em localhost:5432
3. postgres:root
4. Clique direito em "Databases"
5. New Database
6. Nome: locadora
7. OK
```

**Opção C) Teste via Command Line UI Interativa**
```powershell
# Criar arquivo SQL
@"
CREATE DATABASE locadora;
"@ | out-file -encoding utf8 create_db.sql

# Copiar para pasta PostgreSQL
Copy-Item -Path create_db.sql -Destination $ENV:ProgramFiles"\PostgreSQL\*\bin\"
```

### Passo 3: Verificar .env

Verifique se o arquivo `backend/.env` está correto:

```env
# ✅ CORRETO (senha 'root')
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=root
DB_NAME=locadora
DB_SYNCHRONIZE=true

# ❌ ERRADO (senha 'postgres')
DB_PASSWORD=postgres
```

**Importante:** A senha deve bater com a instalação do PostgreSQL

### Passo 4: Rodar Backend (vai criar tabelas automaticamente)

```powershell
cd backend
npm run start:dev
```

**Resultado esperado:**
```
[NestFactory] Starting Nest application...
[TypeORM] Connecting to database 'locadora'...
[TypeORM] Database synchronized successfully
[NestApplication] Nest application successfully started
Listening on port 3000 ✅
```

---

## 🧪 TESTAR CONEXÃO

Após backend iniciar, teste criar um cliente:

```bash
curl -X POST http://localhost:3000/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "cpf": "12345678901",
    "email": "joao@example.com",
    "telefone": "(11) 98765-4321",
    "cnh": "ABC123"
  }'
```

**Resultado esperado:**
```json
{
  "id": 1,
  "nome": "João Silva",
  "cpf": "12345678901",
  "email": "joao@example.com",
  "telefone": "(11) 98765-4321",
  "cnh": "ABC123"
}
```

---

## ❌ ERROS COMUNS E SOLUÇÕES

### Erro 1: "ECONNREFUSED 127.0.0.1:5432"
**Significa:** PostgreSQL não está rodando  
**Solução:** Abra "Services" do Windows e inicie "postgresql-x64-XX"

### Erro 2: "FATAL: IDENT authentication failed for user 'postgres'"
**Significa:** Senha incorreta  
**Solução:** Altere `DB_PASSWORD` no `.env` (padrão: "root" ou "postgres")

### Erro 3: "database 'locadora' does not exist"
**Significa:** Banco não foi criado  
**Solução:** Execute script SQL acima via pgAdmin/DBeaver

### Erro 4: "listen EADDRINUSE: address already in use :::3000"
**Significa:** Porta 3000 já em uso  
**Solução:** 
```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Erro 5: "TypeError: Cannot read property 'get' of undefined"
**Significa:** ConfigModule não carregou .env  
**Solução:** Verifique se `.env` está em `backend/.env` (não em raiz)

---

## 📊 ARQUIVO .env CORRETO

Seu arquivo está em: `backend/.env`

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=root          # ← AJUSTE conforme sua instalação
DB_NAME=locadora
DB_SYNCHRONIZE=true       # ← Deixe true para sincronizar tabelas

# Application
PORT=3000
NODE_ENV=development
```

**Senha padrão PostgreSQL:**
- Instalação nova: `root` ou `postgres`
- Verifique qual foi usada na instalação

---

## 🎯 CHECKLIST DE SETUP

```
[ ] 1. PostgreSQL rodando (Get-Process postgres)
[ ] 2. Banco 'locadora' criado (via pgAdmin/DBeaver)
[ ] 3. Arquivo .env correto (backend/.env)
[ ] 4. Senha está correta no .env
[ ] 5. npm run start:dev (backend compila)
[ ] 6. TypeORM synchronized (tabelas criadas)
[ ] 7. Testar POST /clientes (criar cliente)
[ ] 8. ✅ Cadastro funcionando!
```

---

## 🚀 APÓS SETUP FUNCIONAR

Uma vez que o backend conectar e sincronizar, você pode:

```bash
# Criar cliente
curl -X POST http://localhost:3000/clientes

# Listar clientes
curl http://localhost:3000/clientes

# Mesmo para veículos
curl http://localhost:3000/veiculos

# Frontend vai funcionar
npm start (em frontend/)
```

---

## 💾 VERIFICAR BANCO VIA VISUAL STUDIO CODE

Se tiver a extensão PostgreSQL Explorer:

1. Abra VS Code
2. Painel esquerdo → PostgreSQL Explorer
3. Conectar com:
   - Host: localhost
   - Port: 5432
   - User: postgres
   - Password: root (ou o valor em .env)
   - Database: locadora

4. Deve aparecer as tabelas:
   - cliente
   - veiculo
   - locacao

---

## ⏱️ TEMPO NECESSÁRIO

- Criar banco: 2 minutos
- Configurar .env: 1 minuto
- Rodar backend: 5 minutos
- **Total: ~8 minutos**

---

## 📞 PRÓXIMAS ETAPAS

1. **Crie o banco** (pgAdmin/DBeaver)
2. **Verifique .env**
3. **Rode backend:** `npm run start:dev`
4. **Teste:** `curl -X POST http://localhost:3000/clientes`
5. **Frontend:** `npm start` em outra pasta

---

**Após isso, cadastro de clientes e carros vai funcionar 100%** ✅

---

*Última atualização: 09/03/2026*

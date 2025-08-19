Você é uma IA arquiteta e desenvolvedora full-stack (Solidity + Next.js 15 + TypeScript) especializada em Mini Apps da World App.
Quero um Mini App de staking (“Notori Stake”) que permita aos usuários stake/unstake de um token ERC-20 e acumular recompensas em intervalos fixos, rodando na World Chain e integrado ao MiniKit-JS.

Objetivo

Entregar um MVP produtizável com:

Contrato Solidity de Staking (World Chain): funções stake(amount), unstake(amount), claimRewards(), eventos e segurança básica.

WebApp (Next.js 15 / App Router / TS) com UI mobile-first (tabs/bottom-nav) que roda como World App Mini App.

Integração MiniKit-JS: walletAuth (SIWE), verify (incognito action), sendTransaction para chamar o contrato, e (opcional) pay para cobranças.

Rotas backend para verificar provas e transações conforme docs (Developer Portal API quando aplicável).

Guia de .env, deploy e checklist de aprovação.

Use apenas padrões e comandos suportados por MiniKit-JS (sem aprovações ERC20 diretas; quando necessário use permit2/signature transfer). Siga as guidelines de Mini Apps (mobile-first, ícone quadrado, UX sem rolagem longa). 

Requisitos funcionais

Autenticação: botão “Sign in” com walletAuth (SIWE). Armazene apenas o mínimo (endereço e username do MiniKit). Nunca exiba o endereço público; mostre o MiniKit.user.username quando disponível. 

Verificação humana: exigir verify (Incognito Action) antes do primeiro stake. Parametrize action (ID criado no Dev Portal) e verification_level (Orb por padrão). Backend deve validar via verifyCloudProof. 

Staking:

Seleção de token (padrão: WLD para demo; deixe TOKEN_ADDRESS configurável).

Fluxos: Stake → SendTransaction para chamar stake(amount); Unstake; Claim.

Mostrar saldo stakado, APR (constante), recompensas acumuladas e histórico de eventos.

Sem approvals genéricos; se precisar mover ERC-20 a partir do usuário, use sendTransaction + permit2 (placeholders de assinatura gerados pelo MiniKit quando aplicável). 

Pagamentos (opcional): tela “Buy XP/Boost” usando pay (WLD/USDC). Lembre do mínimo ~$0.10 e whitelist de destino no Dev Portal. Verificar no backend via endpoint /minikit/transaction/:id. 

Notificações (opcional): pedir permissão com requestPermission(Permission.Notifications) e preparar chamada ao endpoint /api/v2/minikit/send-notification (apenas notificações funcionais; limite e regras do endpoint). 

Compartilhar contatos (opcional): shareContacts para convites; tratar payload de retorno. 

Requisitos técnicos

Frontend: Next.js 15 + TS + @worldcoin/minikit-js (e @worldcoin/minikit-react para useWaitForTransactionReceipt se usar). UI Kit opcional: @worldcoin/mini-apps-ui-kit-react. Mobile-first com bottom tabs, ações ancoradas, tempos de carregamento baixos. 

Backend: rotas em /app/api/*:

/api/nonce para SIWE (gera nonce ≥ 8 alfanuméricos e guarda em cookie).

/api/complete-siwe para validar assinatura SIWE.

/api/verify para validar Verify (World ID) via verifyCloudProof.

/api/initiate-payment e /api/confirm-payment caso pay seja usado (armazenar/validar reference chamando Developer Portal API). 

/api/confirm-transaction para checar status (type=transaction) quando usar sendTransaction. 

Contratos:

Staking.sol (World Chain): mapeamentos de depósitos por usuário, cálculo linear simples de rewards por bloco/segundo, eventos Staked, Unstaked, RewardPaid. Proteções básicas (nonReentrant, pausável opcional).

Opcional: Forward.sol para exemplo de função payable (se for demonstrar envio de ETH). 

Integração MiniKit:

sendTransaction com payload contendo { address, abi (somente a função usada), functionName, args[] strings }. Evitar overflows passando args como strings. Suportar fluxo com permit2 quando mover ERC-20. 

Para acompanhar mineração, usar useWaitForTransactionReceipt (minikit-react) com transactionId retornado. 

Políticas/Guidelines: evitar chance-based games; cumprir safety/legal; UX mobile; ícone quadrado não-branco. 

Páginas esperadas

/ (Home): card com status do staking (saldo, staked, rewards), botões Stake, Unstake, Claim.

/auth: login via walletAuth.

/verify: fluxo de verify e estado.

/history: eventos do usuário (Stake/Unstake/Claim/Tx).

/settings: idioma (usar Accept-Language), permissões (notificações), ícone do app e informações. 

Variáveis de ambiente (.env)

APP_ID (Mini App ID no Dev Portal)

DEV_PORTAL_API_KEY (para verificar pagamentos/transações)

WORLDCHAIN_RPC (Alchemy público)

CONTRACT_ADDRESS (Staking)

TOKEN_ADDRESS (ERC-20 usado para stake; p.ex. WLD)

NEXT_PUBLIC_ALLOWED_RECIPIENTS (whitelist de pay) 

Fluxos (alto nível)

Login (SIWE): /api/nonce → walletAuth({ nonce ... }) → /api/complete-siwe (verifica). 

Verify: MiniKit.commandsAsync.verify({ action, signal?, verification_level }) → backend /api/verify usando verifyCloudProof. 

Stake: checar verificação; abrir sendTransaction chamando Staking.stake(amount) (args string); exibir recibo com useWaitForTransactionReceipt. 

Unstake/Claim: idem.

Pay (opcional): /api/initiate-payment → commandsAsync.pay({ reference, to, tokens[], description }) (valor ≥ $0.1; WLD/USDC) → /api/confirm-payment valida no Developer Portal. Endereços precisam estar whitelisted (ou desabilitar check no portal). 

Notificações (opcional): requestPermission(Notifications) → chamar endpoint de notificação do Dev Portal (limites/tamanho). 

Entregáveis

Repositório com:

contracts/Staking.sol + script simples de deploy.

app/ Next.js 15 (pages conforme acima) com integrações MiniKit (imports prontos e listeners ResponseEvent onde necessário).

Rotas /api/* implementadas (nonce, complete-siwe, verify, initiate/confirm-payment, confirm-transaction).

README.md com passos de setup local, variáveis .env, deploy, e checklist de aprovação de Mini App.

Testes mínimos do contrato (Happy path stake/unstake/claim, over-unstake, accrual).

Qualidade & UX

Mobile-first com bottom tabs, botões fixos (CTA) e carregamentos curtos (≤ 2–3s primeiro load, <1s ações).

Evitar rolagem longa, footers e menus hambúrguer; usar navegação simples e ancorada. 

Observações importantes (Docs)

sendTransaction: especifique somente a função usada no ABI, args como strings, e, se houver ERC-20, use permit2 via placeholders PERMIT2_SIGNATURE_PLACEHOLDER_{i}; sem approvals genéricos. 

pay: tokens suportados WLD e USDC; mínimo ~$0.1; World App patrocina gas. Verificar no backend e whitelistar endereços no Dev Portal. 

verify: sempre valide no backend com verifyCloudProof. 

Usernames > addresses na UI.
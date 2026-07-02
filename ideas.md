# Brainstorming de Design — Calistenia Trainer

## Três Abordagens Estilísticas

### 1. **Minimalist Athlete**
Abordagem clean e funcional, inspirada em aplicativos de fitness premium. Foco em legibilidade, espaço negativo e tipografia clara. Paleta neutra com acentos em cores vibrantes (laranja, verde limão).
**Probabilidade:** 0.08

### 2. **Dark Performance Lab**
Estética futurista e imersiva, como um painel de controle de treino. Fundo escuro com neon/gradientes vibrantes, tipografia ousada, efeitos de glassmorphism. Sensação de tecnologia avançada.
**Probabilidade:** 0.07

### 3. **Organic Motion**
Design fluido e dinâmico, inspirado em movimentos corporais. Formas arredondadas, gradientes suaves, animações que refletem fluidez. Paleta warm (laranjas, vermelhos, amarelos quentes). Sensação de energia natural.
**Probabilidade:** 0.06

---

## Abordagem Escolhida: **Dark Performance Lab**

### Design Movement
**Cyberpunk Fitness + Glassmorphism Moderno**
Fusão de interfaces futuristas com clareza funcional. Inspirado em dashboards de performance, cockpits de aviação e aplicativos de treino premium (Fitbod, Strong).

### Core Principles
1. **Contraste Intencional:** Fundo escuro (charcoal/preto) com acentos neon/vibrantes criam hierarquia clara e reduzem fadiga visual durante sessões longas de treino.
2. **Densidade Informativa:** Componentes compactos mas respirados, aproveitando espaço vertical para mostrar múltiplas informações sem poluição visual.
3. **Feedback Imediato:** Cada interação (clique, hover, conclusão) produz feedback visual/sonoro que reforça a sensação de progresso e controle.
4. **Fluidez Dinâmica:** Animações suaves que refletem transições entre estados (exercício → descanso → próximo exercício).

### Color Philosophy
- **Primária:** `#0F172A` (Slate-950) — fundo base, profundidade
- **Secundária:** `#1E293B` (Slate-800) — cards, painéis
- **Accent Neon:** `#00FF88` (Verde Neon) — ações primárias, progresso, sucesso
- **Accent Secundário:** `#FF006E` (Magenta Vibrante) — alertas, intensidade, foco
- **Terciária:** `#00D9FF` (Cyan) — informações, destaques secundários
- **Neutro:** `#E2E8F0` (Slate-200) — texto principal
- **Muted:** `#94A3B8` (Slate-400) — texto secundário

**Intenção Emocional:** Energia, controle, tecnologia, confiança. Sensação de estar em um "cockpit de treino" onde cada métrica importa.

### Layout Paradigm
- **Sidebar Colapsável:** Navegação lateral com ícones + labels, permite máximo de espaço para conteúdo principal.
- **Grid Assimétrico:** Seções principais em 2-3 colunas, mas com tamanhos variáveis (ex: calendário grande + mini-stats ao lado).
- **Card-Based Hierarchy:** Componentes em cards com borders neon sutis, criando separação visual sem rigidez.
- **Sticky Headers:** Navegação e contexto permanecem visíveis durante scroll.

### Signature Elements
1. **Neon Borders:** Cards e elementos interativos com border neon sutil (1-2px), ativa em hover.
2. **Gradient Accents:** Gradientes sutis verde→cyan em botões e destaques, criando movimento visual.
3. **Pulse Animations:** Elementos de progresso (check, timer) pulsam levemente para indicar atividade.
4. **Iconografia Ousada:** Ícones grandes e claros (lucide-react) em cores neon, não cinza.

### Interaction Philosophy
- **Hover States:** Elevação visual (shadow), neon glow, cor mais vibrante.
- **Click Feedback:** Escala 0.98 + ripple effect, confirmação imediata.
- **Loading States:** Spinner animado com gradiente neon, não genérico.
- **Success Feedback:** Flash de cor neon + confetti/pulse, celebração visual.
- **Timer Feedback:** Mudança de cor conforme tempo passa (verde → amarelo → vermelho).

### Animation
- **Entrance:** Fade-in + slide-up (200ms ease-out), stagger 50ms entre items.
- **Transitions:** 150-250ms ease-out para mudanças de estado.
- **Hover:** 100ms ease-out para elevação/glow.
- **Timer Countdown:** Pulse suave a cada segundo (50ms), intensifica nos últimos 5 segundos.
- **Check/Completion:** Bounce scale (0.8 → 1.1 → 1.0) + confetti, 300ms total.
- **Respect prefers-reduced-motion:** Desabilita animações decorativas, mantém feedback essencial.

### Typography System
- **Display (Headings):** `Space Mono` (monospace bold) para títulos principais, cria sensação tech/futurista.
- **Body:** `Inter` (sans-serif) para conteúdo, legibilidade em tamanhos menores.
- **Hierarchy:**
  - H1: 32px, Space Mono Bold, tracking 0.02em
  - H2: 24px, Space Mono Bold
  - H3: 18px, Inter SemiBold
  - Body: 14px, Inter Regular
  - Small: 12px, Inter Regular, muted color

### Brand Essence
**Posicionamento:** *"O cockpit de treino que transforma calistenia em ciência — controle total, feedback imediato, progresso visível."*

**Personalidade:** Preciso, Energético, Confiável

### Brand Voice
- **Headlines:** Imperativas, diretas, sem fluff. Exemplo: "Próximo: 15 flexões" (não "Você está pronto para fazer flexões?")
- **CTAs:** Ação clara e ousada. Exemplo: "Iniciar Treino" (não "Clique aqui para começar")
- **Microcopy:** Tom técnico mas acessível. Exemplo: "Série 2 de 4 — 45s descanso" (não "Você está na série 2")

### Wordmark & Logo
**Logo Concept:** Símbolo geométrico de uma figura em posição de treino (handstand/planche) + grid/crosshair sobreposto, sugerindo precisão e controle. Cores: verde neon + magenta em gradiente.
Sem texto — apenas o símbolo, limpo e ousado.

### Signature Brand Color
**Verde Neon (#00FF88):** Cor proprietária do brand. Usada em CTAs primárias, indicadores de sucesso, progresso. Imediatamente reconhecível e energética.

---

## Implementação
- Todos os componentes seguem a paleta de cores acima.
- Animações são fluidas e responsivas, nunca lentas.
- Feedback é imediato — cada ação produz resposta visual.
- Espaçamento segue grid de 4px para consistência.
- Tipografia reforça hierarquia e leiturabilidade.

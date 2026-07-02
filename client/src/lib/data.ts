/**
 * Data models and initial database for Calistenia Trainer
 * Dark Performance Lab aesthetic with neon accents
 */

export type MuscleGroup = 'peito' | 'costas' | 'pernas' | 'ombros' | 'core' | 'braços' | 'antebraços';
export type WorkoutObjective = 'isometria' | 'resistência' | 'cardio';
export type DifficultyLevel = 'iniciante' | 'intermediário' | 'avançado' | 'elite';
export type SessionStatus = 'pendente' | 'em_progresso' | 'concluído';

export interface Exercise {
  id: string;
  nome: string;
  descrição: string;
  grupos_musculares: MuscleGroup[];
  objetivo: WorkoutObjective;
  dificuldade: DifficultyLevel;
  duração_padrão?: number; // em segundos para isometria
  repetições_padrão?: number;
  imagem?: string;
  dicas?: string[];
}

export interface WorkoutExercise {
  exerciseId: string;
  séries: number;
  repetições?: number;
  tempo?: number; // em segundos
  descanso?: number; // em segundos entre séries
}

export interface Workout {
  id: string;
  nome: string;
  descrição: string;
  objetivo: WorkoutObjective;
  grupos_musculares_foco: MuscleGroup[];
  exercícios: WorkoutExercise[];
  duração_estimada: number; // em minutos
  isCustom?: boolean;
}

export interface ScheduledSession {
  id: string;
  data: string; // ISO date string
  workoutId: string;
  status: SessionStatus;
  completado_em?: string; // ISO datetime
  durationMinutes?: number;
  exercícios_completados?: {
    exerciseId: string;
    séries_completadas: number;
  }[];
}

export interface UserStats {
  streak: number; // dias consecutivos
  total_treinos: number;
  total_exercícios_completados: number;
  tempo_total_treino: number; // em minutos
}

// Initial Exercise Database
export const initialExercises: Exercise[] = [
  {
    id: 'flexao',
    nome: 'Flexão',
    descrição: 'Exercício clássico de resistência para peito, ombros e tríceps',
    grupos_musculares: ['peito', 'ombros', 'braços'],
    objetivo: 'resistência',
    dificuldade: 'iniciante',
    repetições_padrão: 10,
    imagem: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=600&auto=format&fit=crop', // Exemplo de imagem
    dicas: ['Mantenha o corpo reto', 'Desça até o peito tocar o chão', 'Respire de forma controlada'],
  },
  {
    id: 'barra',
    nome: 'Barra (Pull-up)',
    descrição: 'Exercício de força para costas e braços',
    grupos_musculares: ['costas', 'braços', 'antebraços'],
    objetivo: 'resistência',
    dificuldade: 'intermediário',
    repetições_padrão: 5,
    dicas: ['Puxe com os cotovelos', 'Mantenha o peito próximo à barra', 'Controle a descida'],
  },
  {
    id: 'paralelas',
    nome: 'Paralelas (Dips)',
    descrição: 'Exercício de força para peito, ombros e tríceps',
    grupos_musculares: ['peito', 'ombros', 'braços'],
    objetivo: 'resistência',
    dificuldade: 'intermediário',
    repetições_padrão: 8,
    dicas: ['Mantenha o tronco reto', 'Desça até formar 90 graus nos cotovelos', 'Suba com força'],
  },
  {
    id: 'handstand',
    nome: 'Parada de Mão (Handstand)',
    descrição: 'Exercício isométrico para ombros, core e equilíbrio',
    grupos_musculares: ['ombros', 'core', 'braços'],
    objetivo: 'isometria',
    dificuldade: 'avançado',
    duração_padrão: 30,
    dicas: ['Mantenha os dedos espalhados', 'Olhe para as mãos', 'Ative o core'],
  },
  {
    id: 'planche',
    nome: 'Planche Hold',
    descrição: 'Exercício isométrico avançado para força total do corpo',
    grupos_musculares: ['peito', 'ombros', 'core', 'braços'],
    objetivo: 'isometria',
    dificuldade: 'elite',
    duração_padrão: 20,
    dicas: ['Mantenha o corpo paralelo ao chão', 'Ative o core ao máximo', 'Respire constantemente'],
  },
  {
    id: 'agachamento',
    nome: 'Agachamento (Squat)',
    descrição: 'Exercício fundamental para pernas e core',
    grupos_musculares: ['pernas', 'core'],
    objetivo: 'resistência',
    dificuldade: 'iniciante',
    repetições_padrão: 15,
    dicas: ['Mantenha o peito ereto', 'Desça até as coxas ficarem paralelas', 'Joelhos atrás dos dedos'],
  },
  {
    id: 'pistol_squat',
    nome: 'Pistol Squat',
    descrição: 'Agachamento com uma perna - exercício avançado',
    grupos_musculares: ['pernas', 'core'],
    objetivo: 'resistência',
    dificuldade: 'avançado',
    repetições_padrão: 5,
    dicas: ['Use uma barra para apoio', 'Mantenha a perna estendida', 'Controle a descida'],
  },
  {
    id: 'abdominal',
    nome: 'Abdominal (Crunch)',
    descrição: 'Exercício para fortalecer o core',
    grupos_musculares: ['core'],
    objetivo: 'resistência',
    dificuldade: 'iniciante',
    repetições_padrão: 20,
    dicas: ['Mantenha o queixo afastado do peito', 'Suba apenas com o core', 'Não puxe o pescoço'],
  },
  {
    id: 'l_sit',
    nome: 'L-Sit Hold',
    descrição: 'Exercício isométrico para core e ombros',
    grupos_musculares: ['core', 'ombros', 'braços'],
    objetivo: 'isometria',
    dificuldade: 'intermediário',
    duração_padrão: 20,
    dicas: ['Mantenha as pernas retas', 'Ative o core', 'Pressione as mãos no chão'],
  },
  {
    id: 'corrida',
    nome: 'Corrida',
    descrição: 'Exercício cardiovascular',
    grupos_musculares: ['pernas', 'core'],
    objetivo: 'cardio',
    dificuldade: 'iniciante',
    repetições_padrão: 1,
    dicas: ['Mantenha ritmo constante', 'Respire profundamente', 'Aqueça antes de correr'],
  },
  {
    id: 'burpee',
    nome: 'Burpee',
    descrição: 'Exercício de cardio e força total do corpo',
    grupos_musculares: ['peito', 'pernas', 'core', 'braços'],
    objetivo: 'cardio',
    dificuldade: 'intermediário',
    repetições_padrão: 10,
    dicas: ['Mantenha ritmo rápido', 'Ative todo o corpo', 'Controle a respiração'],
  },
  {
    id: 'pike_push_up',
    nome: 'Pike Push-up',
    descrição: 'Flexão com foco em ombros',
    grupos_musculares: ['ombros', 'peito', 'braços'],
    objetivo: 'resistência',
    dificuldade: 'intermediário',
    repetições_padrão: 8,
    dicas: ['Forme um V com o corpo', 'Desça em direção à cabeça', 'Mantenha o core ativo'],
  },
  {
    id: 'muscle_up',
    nome: 'Muscle-up',
    descrição: 'Movimento avançado combinando pull-up e dip',
    grupos_musculares: ['costas', 'peito', 'ombros', 'braços'],
    objetivo: 'resistência',
    dificuldade: 'elite',
    repetições_padrão: 3,
    dicas: ['Puxe com força', 'Transição rápida para dip', 'Mantenha o momentum'],
  },

  // ── BJJ + Calistenia Híbrido ──────────────────────
  {
    id: 'chin_up',
    nome: 'Barra Supinada (Chin-up)',
    descrição: 'Barra com pegada supinada, ativa mais o bíceps que a pronada',
    grupos_musculares: ['costas', 'braços'],
    objetivo: 'resistência',
    dificuldade: 'intermediário',
    repetições_padrão: 8,
    dicas: ['Palmas voltadas para você', 'Cotovelos próximos ao corpo', 'Suba até o queixo passar da barra'],
  },
  {
    id: 'remada_halter',
    nome: 'Remada com Halteres (Bent-over Row)',
    descrição: 'Remada curvada com halteres, costas em 90°, ótima para espessura de costas',
    grupos_musculares: ['costas', 'braços'],
    objetivo: 'resistência',
    dificuldade: 'intermediário',
    repetições_padrão: 12,
    dicas: ['Costas em 90° com o chão', 'Cotovelos junto ao corpo', 'Contração máxima no topo'],
  },
  {
    id: 'desenvolvimento_ombro',
    nome: 'Desenvolvimento de Ombro (Shoulder Press)',
    descrição: 'Desenvolvimento de ombro com halteres em pé, sem impulso das pernas',
    grupos_musculares: ['ombros', 'braços'],
    objetivo: 'resistência',
    dificuldade: 'intermediário',
    repetições_padrão: 12,
    dicas: ['Core ativado', 'Sem impulso das pernas', 'Cotovelos à frente no ponto mais baixo'],
  },
  {
    id: 'elevacao_lateral',
    nome: 'Elevação Lateral com Halteres',
    descrição: 'Elevação lateral para deltóide médio, cotovelos levemente flexionados',
    grupos_musculares: ['ombros'],
    objetivo: 'resistência',
    dificuldade: 'iniciante',
    repetições_padrão: 15,
    dicas: ['Cotovelos levemente flexionados', 'Suba até a altura dos ombros', 'Controle a descida'],
  },
  {
    id: 'rosca_direta',
    nome: 'Rosca Direta com Halteres',
    descrição: 'Rosca direta clássica para bíceps com halteres',
    grupos_musculares: ['braços'],
    objetivo: 'resistência',
    dificuldade: 'iniciante',
    repetições_padrão: 12,
    dicas: ['Cotovelos fixos ao lado do corpo', 'Gire o punho no topo', 'Controle a descida'],
  },
  {
    id: 'rosca_martelo',
    nome: 'Rosca Martelo',
    descrição: 'Rosca com pegada neutra, trabalha bíceps e antebraço',
    grupos_musculares: ['braços', 'antebraços'],
    objetivo: 'resistência',
    dificuldade: 'iniciante',
    repetições_padrão: 12,
    dicas: ['Punho neutro durante todo o movimento', 'Cotovelos fixos', 'Amplitude completa'],
  },
  {
    id: 'dead_hang',
    nome: 'Dead Hang (Suspensão Isométrica)',
    descrição: 'Suspensão estática na barra, fortalece pegada, ombros e descomprime a coluna',
    grupos_musculares: ['ombros', 'antebraços', 'costas'],
    objetivo: 'isometria',
    dificuldade: 'iniciante',
    duração_padrão: 30,
    dicas: ['Ombros afastados das orelhas (ativos)', 'Respiração controlada', 'Pegada firme'],
  },
  {
    id: 'hanging_leg_raise',
    nome: 'Elevação de Pernas na Barra',
    descrição: 'Elevação de pernas na barra fixa, excelente para core e flexores de quadril',
    grupos_musculares: ['core'],
    objetivo: 'resistência',
    dificuldade: 'intermediário',
    repetições_padrão: 12,
    dicas: ['Pernas juntas e retas', 'Sem balanço', 'Controle a descida lentamente'],
  },
  {
    id: 'supino_halter_chao',
    nome: 'Supino no Chão com Halteres (Floor Press)',
    descrição: 'Supino deitado no chão com halteres, cotovelo toca o chão levemente',
    grupos_musculares: ['peito', 'braços', 'ombros'],
    objetivo: 'resistência',
    dificuldade: 'intermediário',
    repetições_padrão: 12,
    dicas: ['Cotovelo toca o chão levemente', 'Aperte os halteres no topo', 'Controle a descida'],
  },
  {
    id: 'flexao_diamante',
    nome: 'Flexão Diamante (Foco Tríceps)',
    descrição: 'Flexão com mãos formando um diamante, ativa fortemente o tríceps',
    grupos_musculares: ['braços', 'peito'],
    objetivo: 'resistência',
    dificuldade: 'intermediário',
    repetições_padrão: 12,
    dicas: ['Mãos próximas formando um diamante', 'Cotovelos junto ao corpo', 'Core ativado'],
  },
  {
    id: 'tricep_testa',
    nome: 'Tríceps Testa com Halteres',
    descrição: 'Exercício deitado que isola o tríceps abaixando os halteres até a testa',
    grupos_musculares: ['braços'],
    objetivo: 'resistência',
    dificuldade: 'intermediário',
    repetições_padrão: 12,
    dicas: ['Cotovelos apontados para o teto', 'Só o antebraço se move', 'Controle a descida'],
  },
  {
    id: 'agachamento_goblet',
    nome: 'Agachamento Goblet (Halter no Peito)',
    descrição: 'Agachamento com halter junto ao peito, ótimo para profundidade e postura',
    grupos_musculares: ['pernas', 'core'],
    objetivo: 'resistência',
    dificuldade: 'iniciante',
    repetições_padrão: 15,
    dicas: ['Halter junto ao peito', 'Joelhos alinhados com os dedos', 'Tronco ereto'],
  },
  {
    id: 'afundo',
    nome: 'Afundo com Halteres (Lunge)',
    descrição: 'Afundo alternado com halteres, ativa pernas e glúteos',
    grupos_musculares: ['pernas'],
    objetivo: 'resistência',
    dificuldade: 'iniciante',
    repetições_padrão: 10,
    dicas: ['Tronco ereto', 'Joelho da frente não ultrapassa o pé', 'Passo largo'],
  },
  {
    id: 'agachamento_bulgaro',
    nome: 'Agachamento Búlgaro',
    descrição: 'Agachamento unilateral com pé traseiro apoiado na paralela ou banco',
    grupos_musculares: ['pernas'],
    objetivo: 'resistência',
    dificuldade: 'intermediário',
    repetições_padrão: 10,
    dicas: ['Pé traseiro apoiado atrás', 'Tronco levemente inclinado à frente', 'Joelho da frente alinhado ao pé'],
  },
  {
    id: 'elevacao_panturrilha',
    nome: 'Elevação de Panturrilha com Halteres',
    descrição: 'Elevação de panturrilha com halteres, amplitude total e pausa no topo',
    grupos_musculares: ['pernas'],
    objetivo: 'resistência',
    dificuldade: 'iniciante',
    repetições_padrão: 20,
    dicas: ['Amplitude total de movimento', 'Pausa e contração no topo', 'Desça completamente'],
  },
  {
    id: 'ponte_gluteo',
    nome: 'Ponte de Glúteo (Glute Bridge)',
    descrição: 'Ponte de glúteo no chão, pode adicionar halter no quadril',
    grupos_musculares: ['pernas'],
    objetivo: 'resistência',
    dificuldade: 'iniciante',
    repetições_padrão: 20,
    dicas: ['Quadril sobe até ficar alinhado com joelho e ombro', 'Contração do glúteo no topo', 'Pés firmemente no chão'],
  },
  {
    id: 'cadeira_parede',
    nome: 'Cadeira Isométrica (Wall Sit)',
    descrição: 'Posição isométrica com costas na parede e joelhos a 90°, excelente para quadríceps',
    grupos_musculares: ['pernas'],
    objetivo: 'isometria',
    dificuldade: 'iniciante',
    duração_padrão: 60,
    dicas: ['Costas completamente na parede', 'Joelhos a 90°', 'Pés afastados na largura dos ombros'],
  },
  {
    id: 'abdominal_bicicleta',
    nome: 'Abdominal Bicicleta (Bicycle Crunch)',
    descrição: 'Abdominal com rotação de tronco, ativa oblíquos e reto abdominal',
    grupos_musculares: ['core'],
    objetivo: 'resistência',
    dificuldade: 'iniciante',
    repetições_padrão: 20,
    dicas: ['Rotação completa do tronco', 'Não puxe o pescoço', 'Ritmo controlado'],
  },
  {
    id: 'prancha_lateral',
    nome: 'Prancha Lateral',
    descrição: 'Prancha lateral isométrica para oblíquos e estabilidade do core',
    grupos_musculares: ['core'],
    objetivo: 'isometria',
    dificuldade: 'iniciante',
    duração_padrão: 40,
    dicas: ['Corpo reto sem afundar o quadril', 'Apoio no antebraço e lateral do pé', 'Respire normalmente'],
  },
  {
    id: 'rotacao_russa',
    nome: 'Rotação Russa com Halter',
    descrição: 'Rotação de tronco sentado com halter, ativa oblíquos e core',
    grupos_musculares: ['core'],
    objetivo: 'resistência',
    dificuldade: 'iniciante',
    repetições_padrão: 20,
    dicas: ['Pés ligeiramente levantados para dificultar', 'Rotação completa de cada lado', 'Core contraído'],
  },
  {
    id: 'corda_pular',
    nome: 'Corda de Pular',
    descrição: 'Pular corda melhora condicionamento cardiovascular, coordenação e agilidade dos pés',
    grupos_musculares: ['pernas', 'core'],
    objetivo: 'cardio',
    dificuldade: 'iniciante',
    duração_padrão: 60,
    dicas: ['Saltos pequenos e rápidos', 'Pouco uso dos braços', 'Mantenha ritmo constante'],
  },
  {
    id: 'prancha_frontal',
    nome: 'Prancha Frontal',
    descrição: 'Prancha isométrica clássica no antebraço, ativa todo o core',
    grupos_musculares: ['core', 'ombros'],
    objetivo: 'isometria',
    dificuldade: 'iniciante',
    duração_padrão: 60,
    dicas: ['Corpo em linha reta', 'Core e glúteos contraídos', 'Respiração controlada'],
  },
  {
    id: 'bike_ergometrica',
    nome: 'Bike Ergométrica (Zona 2)',
    descrição: 'Pedalada leve em bicicleta ergômetrica, ritmo confortável (zona 2 — consegue conversar), foco em recuperação ativa e soltar as pernas',
    grupos_musculares: ['pernas', 'core'],
    objetivo: 'cardio',
    dificuldade: 'iniciante',
    duração_padrão: 900,
    dicas: ['Ritmo confortável (consegue conversar)', 'Sem sprint — foco em recuperação', 'Cadeira regulada para leg quase estendida'],
  },
  {
    id: 'alongamento',
    nome: 'Rotina de Alongamento (10 min)',
    descrição: 'Alongamento completo de 10 min: peitoral, ombro, tríceps, isquiotibiais, quadríceps, flexores, lombar e panturrilha',
    grupos_musculares: ['pernas', 'core', 'ombros'],
    objetivo: 'isometria',
    dificuldade: 'iniciante',
    duração_padrão: 600,
    dicas: ['Respiração profunda em cada posição', 'Sem forçar dor aguda', 'Mantém cada posição por 30-45s'],
  },
];

// Initial Workouts
export const initialWorkouts: Workout[] = [
  {
    id: 'upper_body_1',
    nome: 'Upper Body - Força',
    descrição: 'Treino focado em força do tronco superior',
    objetivo: 'resistência',
    grupos_musculares_foco: ['peito', 'costas', 'ombros', 'braços'],
    exercícios: [
      { exerciseId: 'flexao', séries: 3, repetições: 10, descanso: 60 },
      { exerciseId: 'barra', séries: 3, repetições: 5, descanso: 90 },
      { exerciseId: 'paralelas', séries: 3, repetições: 8, descanso: 60 },
      { exerciseId: 'pike_push_up', séries: 3, repetições: 8, descanso: 60 },
    ],
    duração_estimada: 45,
  },
  {
    id: 'lower_body_1',
    nome: 'Lower Body - Resistência',
    descrição: 'Treino focado em força e resistência das pernas',
    objetivo: 'resistência',
    grupos_musculares_foco: ['pernas', 'core'],
    exercícios: [
      { exerciseId: 'agachamento', séries: 3, repetições: 15, descanso: 60 },
      { exerciseId: 'abdominal', séries: 3, repetições: 20, descanso: 45 },
      { exerciseId: 'burpee', séries: 3, repetições: 10, descanso: 90 },
    ],
    duração_estimada: 35,
  },
  {
    id: 'isometric_1',
    nome: 'Isometria - Progressão',
    descrição: 'Treino focado em exercícios isométricos',
    objetivo: 'isometria',
    grupos_musculares_foco: ['ombros', 'core', 'braços'],
    exercícios: [
      { exerciseId: 'handstand', séries: 3, tempo: 30, descanso: 120 },
      { exerciseId: 'l_sit', séries: 3, tempo: 20, descanso: 90 },
      { exerciseId: 'planche', séries: 2, tempo: 15, descanso: 120 },
    ],
    duração_estimada: 30,
  },
  {
    id: 'cardio_1',
    nome: 'Cardio - HIIT',
    descrição: 'Treino cardiovascular de alta intensidade',
    objetivo: 'cardio',
    grupos_musculares_foco: ['pernas', 'core'],
    exercícios: [
      { exerciseId: 'burpee', séries: 5, repetições: 10, descanso: 30 },
      { exerciseId: 'corrida', séries: 1, repetições: 1, descanso: 60 },
    ],
    duração_estimada: 25,
  },

  // ── BJJ + Calistenia Híbrido: Semana Completa ──────────────────────
  {
    id: 'bjj_terca_costas',
    nome: 'Terça · Costas / Bíceps / Ombro',
    descrição: 'Treino híbrido BJJ+Calistenia — Puxada completa com halteres e barra',
    objetivo: 'resistência',
    grupos_musculares_foco: ['costas', 'braços', 'ombros'],
    exercícios: [
      { exerciseId: 'barra', séries: 4, repetições: 10, descanso: 90 },
      { exerciseId: 'chin_up', séries: 3, repetições: 8, descanso: 90 },
      { exerciseId: 'remada_halter', séries: 4, repetições: 12, descanso: 90 },
      { exerciseId: 'desenvolvimento_ombro', séries: 3, repetições: 12, descanso: 90 },
      { exerciseId: 'elevacao_lateral', séries: 3, repetições: 15, descanso: 60 },
      { exerciseId: 'rosca_direta', séries: 3, repetições: 12, descanso: 60 },
      { exerciseId: 'rosca_martelo', séries: 3, repetições: 12, descanso: 60 },
      { exerciseId: 'dead_hang', séries: 3, tempo: 30, descanso: 60 },
      { exerciseId: 'hanging_leg_raise', séries: 3, repetições: 12, descanso: 60 },
      { exerciseId: 'prancha_frontal', séries: 3, tempo: 60, descanso: 60 },
    ],
    duração_estimada: 50,
  },
  {
    id: 'bjj_quinta_peito',
    nome: 'Quinta · Peito / Tríceps',
    descrição: 'Treino híbrido BJJ+Calistenia — Empurrada completa com halteres e paralelas',
    objetivo: 'resistência',
    grupos_musculares_foco: ['peito', 'braços', 'ombros'],
    exercícios: [
      { exerciseId: 'paralelas', séries: 4, repetições: 10, descanso: 90 },
      { exerciseId: 'flexao', séries: 3, repetições: 15, descanso: 60 },
      { exerciseId: 'flexao_diamante', séries: 3, repetições: 12, descanso: 60 },
      { exerciseId: 'supino_halter_chao', séries: 4, repetições: 12, descanso: 90 },
      { exerciseId: 'pike_push_up', séries: 3, repetições: 10, descanso: 60 },
      { exerciseId: 'tricep_testa', séries: 3, repetições: 12, descanso: 60 },
      { exerciseId: 'abdominal_bicicleta', séries: 3, repetições: 20, descanso: 60 },
      { exerciseId: 'prancha_lateral', séries: 3, tempo: 40, descanso: 60 },
    ],
    duração_estimada: 50,
  },
  {
    id: 'bjj_sabado_perna',
    nome: 'Sábado · Perna + Core',
    descrição: 'Treino híbrido BJJ+Calistenia — Perna completa com halteres e core pesado',
    objetivo: 'resistência',
    grupos_musculares_foco: ['pernas', 'core'],
    exercícios: [
      { exerciseId: 'agachamento_goblet', séries: 4, repetições: 15, descanso: 90 },
      { exerciseId: 'afundo', séries: 3, repetições: 10, descanso: 90 },
      { exerciseId: 'agachamento_bulgaro', séries: 3, repetições: 10, descanso: 90 },
      { exerciseId: 'elevacao_panturrilha', séries: 4, repetições: 20, descanso: 60 },
      { exerciseId: 'ponte_gluteo', séries: 3, repetições: 20, descanso: 60 },
      { exerciseId: 'cadeira_parede', séries: 3, tempo: 60, descanso: 60 },
      { exerciseId: 'rotacao_russa', séries: 3, repetições: 20, descanso: 60 },
      { exerciseId: 'prancha_lateral', séries: 3, tempo: 40, descanso: 60 },
      { exerciseId: 'corda_pular', séries: 3, tempo: 60, descanso: 60 },
    ],
    duração_estimada: 55,
  },
  {
    id: 'bjj_recuperacao',
    nome: 'Seg/Qua/Sex · Recuperação Ativa',
    descrição: 'Treino de BJJ na academia seguido de recuperação ativa em casa (Bike Leve + Alongamento)',
    objetivo: 'cardio',
    grupos_musculares_foco: ['pernas', 'core', 'ombros'],
    exercícios: [
      { exerciseId: 'bike_ergometrica', séries: 1, tempo: 1200, descanso: 0 },
      { exerciseId: 'alongamento', séries: 1, tempo: 600, descanso: 0 }
    ],
    duração_estimada: 30,
  },
];

// Helper functions
export function getExerciseById(id: string): Exercise | undefined {
  return initialExercises.find(e => e.id === id);
}

export function getWorkoutById(id: string): Workout | undefined {
  return initialWorkouts.find(w => w.id === id);
}

export function filterExercisesByMuscleGroup(group: MuscleGroup): Exercise[] {
  return initialExercises.filter(e => e.grupos_musculares.includes(group));
}

export function filterExercisesByObjective(objective: WorkoutObjective): Exercise[] {
  return initialExercises.filter(e => e.objetivo === objective);
}

export function filterExercisesByDifficulty(difficulty: DifficultyLevel): Exercise[] {
  return initialExercises.filter(e => e.dificuldade === difficulty);
}

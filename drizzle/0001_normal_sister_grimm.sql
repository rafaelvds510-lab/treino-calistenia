CREATE TABLE "workouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"nome" text NOT NULL,
	"descrição" text DEFAULT '',
	"objetivo" varchar(20) NOT NULL,
	"gruposMuscularesFoco" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"exercicios" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"duraçãoEstimada" integer DEFAULT 30 NOT NULL,
	"isCustom" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "weeklySchedule" jsonb DEFAULT '{}'::jsonb NOT NULL;
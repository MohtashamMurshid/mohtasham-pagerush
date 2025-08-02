import { Brain, Upload } from "lucide-react";
import { GraduationCap } from "lucide-react";
import { BarChart3 } from "lucide-react";
import { Settings2 } from "lucide-react";
import { Focus } from "lucide-react";
import { Zap } from "lucide-react";
import { Timer } from "lucide-react";
export const features = [
  {
    title: "PDF Upload & Processing",
    description: "Upload and extract text from PDF documents.",
  },
  {
    title: "Focus Mode",
    description: "Distraction-free study environment with progress tracking.",
  },
  {
    title: "Study Guide Generation",
    description: "Create organized notes and summaries.",
  },
  {
    title: "Interactive Flashcards",
    description: "Generate and study with AI-powered flashcards.",
  },
  {
    title: "Quiz Generation",
    description: "Test your knowledge with multiple choice questions.",
  },
  {
    title: "Exam Practice",
    description: "Full practice exams with mixed question types.",
  },
  {
    title: "Exam Cram",
    description: "Smart topic breakdown and adaptive learning.",
  },
  {
    title: "Performance Analytics",
    description: "Track your progress and identify weak areas.",
  },
  {
    title: "Mobile-Optimized",
    description: "Fully responsive design with touch-friendly interface.",
  },
];
export const studyNavData = {
  navMain: [
    {
      title: "Upload & Process",
      url: "/dashboard/upload",
      icon: Upload,
      isActive: true,
      items: [
        {
          title: "Upload PDF",
          url: "/dashboard/upload",
        },
        {
          title: "Document Library",
          url: "/dashboard/library",
        },
        {
          title: "Text Extraction",
          url: "/dashboard/extract",
        },
      ],
    },
    {
      title: "Study Tools",
      url: "/dashboard/study",
      icon: Brain,
      items: [
        {
          title: "Focus Mode",
          url: "/dashboard/focus",
        },
        {
          title: "Study Guides",
          url: "/dashboard/guides",
        },
        {
          title: "Flashcards",
          url: "/dashboard/flashcards",
        },
      ],
    },
    {
      title: "Practice & Test",
      url: "/dashboard/practice",
      icon: GraduationCap,
      items: [
        {
          title: "Quiz Generator",
          url: "/dashboard/quiz",
        },
        {
          title: "Exam Practice",
          url: "/dashboard/exam",
        },
        {
          title: "Exam Cram",
          url: "/dashboard/cram",
        },
      ],
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChart3,
      items: [
        {
          title: "Performance",
          url: "/dashboard/performance",
        },
        {
          title: "Progress Tracking",
          url: "/dashboard/progress",
        },
        {
          title: "Weak Areas",
          url: "/dashboard/weak-areas",
        },
      ],
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings2,
      items: [
        {
          title: "Profile",
          url: "/dashboard/settings/profile",
        },
        {
          title: "Study Preferences",
          url: "/dashboard/settings/study",
        },
        {
          title: "Notifications",
          url: "/dashboard/settings/notifications",
        },
      ],
    },
  ],
  quickActions: [
    {
      name: "Focus Session",
      url: "/dashboard/focus",
      icon: Focus,
      description: "Start a distraction-free study session",
    },
    {
      name: "Quick Quiz",
      url: "/dashboard/quiz/quick",
      icon: Zap,
      description: "Test your knowledge instantly",
    },
    {
      name: "Study Timer",
      url: "/dashboard/timer",
      icon: Timer,
      description: "Pomodoro study sessions",
    },
  ],
};

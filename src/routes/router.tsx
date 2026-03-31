import { createHashRouter } from "react-router-dom"
import { AppShell } from "@/components/layout/AppShell"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { LoginScreen } from "@/components/auth/LoginScreen"
import { Dashboard } from "@/components/dashboard/Dashboard"
import { ProjectList } from "@/components/projects/ProjectList"
import { ProjectDetail } from "@/components/projects/ProjectDetail"
import { TopicDetail } from "@/components/topics/TopicDetail"
import { StudySessionPage } from "@/components/study/StudySessionPage"
import { StatsPage } from "@/components/stats/StatsPage"
import { SettingsPage } from "@/components/settings/SettingsPage"

export const router = createHashRouter([
  {
    path: "/login",
    element: <LoginScreen />,
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/", element: <Dashboard /> },
          { path: "/projects", element: <ProjectList /> },
          { path: "/projects/:id", element: <ProjectDetail /> },
          { path: "/topics/:id", element: <TopicDetail /> },
          { path: "/study/:topicId?", element: <StudySessionPage /> },
          { path: "/stats", element: <StatsPage /> },
          { path: "/settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
])

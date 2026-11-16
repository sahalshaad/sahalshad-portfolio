import { useState } from 'react'
import type { AdminTab } from './types'
import { AuthGate } from './components/AuthGate'
import { AdminLayout } from './components/AdminLayout'
import { DashboardView } from './views/DashboardView'
import { HeroView } from './views/HeroView'
import { SettingsView } from './views/SettingsView'
import { ServicesView } from './views/ServicesView'
import { ExperienceView } from './views/ExperienceView'
import { ProjectsView } from './views/ProjectsView'
import { TestimonialsView } from './views/TestimonialsView'
import { SkillsView } from './views/SkillsView'
import { StatsView } from './views/StatsView'
import { SectionHeadingsView } from './views/SectionHeadingsView'
import { MessagesView } from './views/MessagesView'

export default function AdminApp() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')

  return (
    <AuthGate>
      {(user, signOut) => (
        <AdminLayout
          user={user}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSignOut={signOut}
        >
          {activeTab === 'dashboard' && <DashboardView onNavigate={setActiveTab} />}
          {activeTab === 'hero' && <HeroView />}
          {activeTab === 'settings' && <SettingsView />}
          {activeTab === 'services' && <ServicesView />}
          {activeTab === 'experiences' && <ExperienceView />}
          {activeTab === 'projects' && <ProjectsView />}
          {activeTab === 'testimonials' && <TestimonialsView />}
          {activeTab === 'skills' && <SkillsView />}
          {activeTab === 'stats' && <StatsView />}
          {activeTab === 'sections' && <SectionHeadingsView />}
          {activeTab === 'messages' && <MessagesView />}
        </AdminLayout>
      )}
    </AuthGate>
  )
}

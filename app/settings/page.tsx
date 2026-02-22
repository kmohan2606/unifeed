import { TopNav } from "@/components/top-nav"
import { MobileNav } from "@/components/mobile-nav"
import { SettingsView } from "@/components/settings-view"
import { AuthGuard } from "@/components/auth-guard"

export default function SettingsPage() {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col bg-background">
        <TopNav />
        <main className="flex-1 px-4 py-6 pb-20 md:pb-6 lg:px-6">
          <div className="mx-auto max-w-7xl">
            <SettingsView />
          </div>
        </main>
        <MobileNav />
      </div>
    </AuthGuard>
  )
}

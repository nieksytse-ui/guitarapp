import { useState } from 'react'
import { Settings, Trash2, Volume2 } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useSettingsStore, type ThemeMode } from '@/store/useSettingsStore'
import { useProgressStore } from '@/store/useProgressStore'
import { toast } from '@/store/useToastStore'

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const {
    theme,
    setTheme,
    masterVolume,
    setMasterVolume,
    metronomeAccent,
    setMetronomeAccent,
    countIn,
    setCountIn,
  } = useSettingsStore()
  const reset = useProgressStore((s) => s.reset)
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Instellingen"
        description="Pas weergave en geluid aan, en beheer je lokale voortgang."
        icon={<Settings className="h-5 w-5" />}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weergave</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border/60">
          <Row label="Thema" hint="Licht, donker of volg je systeem">
            <Select value={theme} onValueChange={(v) => setTheme(v as ThemeMode)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Licht</SelectItem>
                <SelectItem value="dark">Donker</SelectItem>
                <SelectItem value="system">Systeem</SelectItem>
              </SelectContent>
            </Select>
          </Row>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Volume2 className="h-4 w-4" /> Geluid
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border/60">
          <Row label="Hoofdvolume" hint={`${Math.round(masterVolume * 100)}%`}>
            <Slider
              className="w-44"
              value={[masterVolume * 100]}
              max={100}
              step={1}
              onValueChange={([v]) => setMasterVolume(v / 100)}
            />
          </Row>
          <Row label="Accent op tel 1" hint="Benadruk de eerste tel van elke maat">
            <Switch checked={metronomeAccent} onCheckedChange={setMetronomeAccent} />
          </Row>
          <Row label="Inteltel" hint="Tel één maat in voordat een oefening start">
            <Switch checked={countIn} onCheckedChange={setCountIn} />
          </Row>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Gevarenzone</CardTitle>
        </CardHeader>
        <CardContent>
          <Row label="Voortgang wissen" hint="Verwijdert alle XP, streaks, records en sessies (lokaal)">
            <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="h-4 w-4" /> Reset
            </Button>
          </Row>
        </CardContent>
      </Card>

      <p className="px-1 text-center text-xs text-muted-foreground">
        Alle gegevens worden lokaal in je browser bewaard (IndexedDB). Er is geen account of server nodig.
      </p>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Weet je het zeker?</DialogTitle>
            <DialogDescription>
              Hiermee verwijder je alle lokale voortgang. Dit kan niet ongedaan worden gemaakt.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Annuleren
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await reset()
                setConfirmOpen(false)
                toast({ title: 'Voortgang gewist', variant: 'success' })
              }}
            >
              Ja, wis alles
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

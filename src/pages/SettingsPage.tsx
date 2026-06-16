import { useRef, useState } from 'react'
import { Download, Save, Settings, Trash2, Upload, Volume2 } from 'lucide-react'
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
import {
  createBackup,
  downloadBackup,
  readBackupFile,
  restoreBackup,
  summarizeBackup,
  type FretFlowBackup,
} from '@/lib/backup'

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
  const reload = useProgressStore((s) => s.reload)
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Back-up & herstel
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [exporting, setExporting] = useState(false)
  const [pending, setPending] = useState<FretFlowBackup | null>(null)
  const [restoring, setRestoring] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const backup = await createBackup()
      downloadBackup(backup)
      toast({ title: 'Back-up gedownload', description: 'Bewaar het .json-bestand op een veilige plek.', variant: 'success' })
    } catch {
      toast({ title: 'Back-up mislukt', description: 'Kon de gegevens niet exporteren.', variant: 'error' })
    } finally {
      setExporting(false)
    }
  }

  const handleFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // reset zodat hetzelfde bestand opnieuw gekozen kan worden
    if (!file) return
    try {
      const backup = await readBackupFile(file)
      setPending(backup)
    } catch (err) {
      toast({
        title: 'Ongeldig bestand',
        description: err instanceof Error ? err.message : 'Onbekende fout.',
        variant: 'error',
      })
    }
  }

  const handleRestore = async () => {
    if (!pending) return
    setRestoring(true)
    try {
      await restoreBackup(pending)
      await reload()
      // Herstelde instellingen opnieuw inlezen (thema/volume volgen automatisch).
      await useSettingsStore.persist.rehydrate()
      setPending(null)
      toast({ title: 'Back-up hersteld', description: 'Je voortgang is teruggezet.', variant: 'success' })
    } catch {
      toast({ title: 'Herstellen mislukt', description: 'Kon de back-up niet terugzetten.', variant: 'error' })
    } finally {
      setRestoring(false)
    }
  }

  const summary = pending ? summarizeBackup(pending) : null

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Save className="h-4 w-4" /> Back-up & herstel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Je voortgang staat alleen in deze browser. Maak een back-up­bestand om hem veilig te
            stellen of over te zetten naar een ander apparaat.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={handleExport} disabled={exporting} className="flex-1">
              <Download className="h-4 w-4" /> {exporting ? 'Bezig…' : 'Exporteren (download)'}
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              <Upload className="h-4 w-4" /> Importeren (uit bestand)
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleFileChosen}
              className="hidden"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Let op: importeren <strong>vervangt</strong> je huidige voortgang door die uit het
            bestand.
          </p>
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

      <Dialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Back-up terugzetten?</DialogTitle>
            <DialogDescription>
              Dit <strong>vervangt</strong> je huidige voortgang door de inhoud van het bestand.
            </DialogDescription>
          </DialogHeader>
          {summary && (
            <ul className="space-y-1 rounded-lg border border-border bg-muted/40 p-3 text-sm">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Activiteiten</span>
                <span className="font-semibold">{summary.activities}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Akkoordwissel-records</span>
                <span className="font-semibold">{summary.records}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Sessies</span>
                <span className="font-semibold">{summary.templates}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Eigen patronen</span>
                <span className="font-semibold">{summary.patterns}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Eigen akkoorden</span>
                <span className="font-semibold">{summary.chords}</span>
              </li>
            </ul>
          )}
          {pending && (
            <p className="text-xs text-muted-foreground">
              Geëxporteerd op {new Date(pending.exportedAt).toLocaleString('nl-NL')}.
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPending(null)} disabled={restoring}>
              Annuleren
            </Button>
            <Button onClick={handleRestore} disabled={restoring}>
              {restoring ? 'Bezig…' : 'Ja, terugzetten'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

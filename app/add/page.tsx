"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Edit } from "lucide-react"
import { DailyHeader } from "@/components/daily-header"
import { DynamicBackgroundCanvas } from "@/components/dynamic-background-canvas"
import { DynamicNavigation } from "@/components/dynamic-navigation"
import { useBiases } from "@/hooks/use-biases"
import { useSettings } from "@/hooks/use-settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Bias, BiasCategory } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import {
  sanitizeText,
  validateTitle,
  validateSummary,
  validateOptionalText,
} from "@/lib/validation"

const categories: BiasCategory[] = ["decision", "memory", "social", "perception", "misc"]

export default function AddBiasPage() {
  const router = useRouter()
  const { userBiases, addBias, updateBias, deleteBias } = useBiases()
  const { settings } = useSettings()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBias, setEditingBias] = useState<Bias | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<BiasCategory>("misc")
  const [summary, setSummary] = useState("")
  const [why, setWhy] = useState("")
  const [counter, setCounter] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const resetForm = () => {
    setTitle("")
    setCategory("misc")
    setSummary("")
    setWhy("")
    setCounter("")
    setErrors({})
    setEditingBias(null)
  }

  const openAddDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEditDialog = (bias: Bias) => {
    setEditingBias(bias)
    setTitle(bias.title)
    setCategory(bias.category)
    setSummary(bias.summary)
    setWhy(bias.why)
    setCounter(bias.counter)
    setErrors({})
    setIsDialogOpen(true)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate title
    const titleValidation = validateTitle(title)
    if (!titleValidation.valid) {
      newErrors.title = titleValidation.error!
    }

    // Validate summary
    const summaryValidation = validateSummary(summary)
    if (!summaryValidation.valid) {
      newErrors.summary = summaryValidation.error!
    }

    // Validate optional fields
    const whyValidation = validateOptionalText(why, 1000)
    if (!whyValidation.valid) {
      newErrors.why = whyValidation.error!
    }

    const counterValidation = validateOptionalText(counter, 1000)
    if (!counterValidation.valid) {
      newErrors.counter = counterValidation.error!
    }

    // Check for duplicate title (excluding current bias if editing)
    const sanitizedTitle = sanitizeText(title, 100)
    const duplicateTitle = userBiases.find(
      (b) => b.title.toLowerCase() === sanitizedTitle.toLowerCase() && b.id !== editingBias?.id
    )
    if (duplicateTitle) {
      newErrors.title = "A bias with this title already exists"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    const sanitizedTitle = sanitizeText(title, 100)
    const sanitizedSummary = sanitizeText(summary, 500)
    const sanitizedWhy = sanitizeText(why, 1000)
    const sanitizedCounter = sanitizeText(counter, 1000)

    const biasData: Bias = {
      id:
        editingBias?.id ||
        sanitizedTitle
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
      title: sanitizedTitle,
      category,
      summary: sanitizedSummary,
      why: sanitizedWhy || "No explanation provided yet.",
      counter: sanitizedCounter || "No counter-strategy provided yet.",
      source: "user",
      createdAt: editingBias?.createdAt || Date.now(),
      updatedAt: Date.now(),
    }

    try {
      if (editingBias) {
        await updateBias(biasData)
      } else {
        await addBias(biasData)
      }
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("[DailyBias] Failed to save bias:", error)
      setErrors({ submit: "Failed to save bias. Please try again." })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteBias(id)
      setDeleteConfirmId(null)
    } catch (error) {
      console.error("[DailyBias] Failed to delete bias:", error)
    }
  }

  return (
    <div className="min-h-screen pb-24">
      <DynamicBackgroundCanvas style={settings.backgroundStyle} seed={789} />
      <DailyHeader />

      <main className="mx-auto w-full max-w-4xl px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="mb-2 text-3xl font-bold">Your Biases</h1>
              <p className="text-muted-foreground">
                Create and manage your custom cognitive biases
              </p>
            </div>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Bias
            </Button>
          </div>

          {/* User biases count */}
          <div className="text-muted-foreground text-sm">{userBiases.length} custom biases</div>

          {/* User biases list */}
          {userBiases.length === 0 ? (
            <div className="glass space-y-4 rounded-2xl p-12 text-center">
              <Plus className="text-muted-foreground mx-auto h-12 w-12" />
              <div>
                <p className="mb-2 text-lg font-medium">No custom biases yet</p>
                <p className="text-muted-foreground mb-4">
                  Create your own cognitive biases to add to your personal collection
                </p>
                <Button onClick={openAddDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Bias
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {userBiases.map((bias) => (
                <div key={bias.id} className="glass rounded-2xl p-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <Badge variant="secondary" className="mb-2">
                          {bias.category}
                        </Badge>
                        <h3 className="text-lg font-semibold text-balance">{bias.title}</h3>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(bias)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirmId(bias.id)}
                        >
                          <Trash2 className="text-destructive h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm text-pretty">{bias.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <DynamicNavigation />

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBias ? "Edit Bias" : "Add New Bias"}</DialogTitle>
            <DialogDescription>
              {editingBias
                ? "Update your custom bias details"
                : "Create a new cognitive bias for your collection"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Recency Bias"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={errors.title ? "border-destructive" : ""}
                maxLength={100}
              />
              {errors.title && <p className="text-destructive text-sm">{errors.title}</p>}
              <p className="text-muted-foreground text-xs">{title.length}/100 characters</p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as BiasCategory)}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <Label htmlFor="summary">
                Summary <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="summary"
                placeholder="A brief 2-3 line description of the bias..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                className={errors.summary ? "border-destructive" : ""}
                maxLength={500}
              />
              {errors.summary && <p className="text-destructive text-sm">{errors.summary}</p>}
              <p className="text-muted-foreground text-xs">{summary.length}/500 characters</p>
            </div>

            {/* Why */}
            <div className="space-y-2">
              <Label htmlFor="why">Why it happens (optional)</Label>
              <Textarea
                id="why"
                placeholder="Explain the psychological or cognitive reasons behind this bias..."
                value={why}
                onChange={(e) => setWhy(e.target.value)}
                rows={3}
                maxLength={1000}
              />
              {errors.why && <p className="text-destructive text-sm">{errors.why}</p>}
              <p className="text-muted-foreground text-xs">{why.length}/1000 characters</p>
            </div>

            {/* Counter */}
            <div className="space-y-2">
              <Label htmlFor="counter">How to counter it (optional)</Label>
              <Textarea
                id="counter"
                placeholder="Provide actionable steps to recognize and overcome this bias..."
                value={counter}
                onChange={(e) => setCounter(e.target.value)}
                rows={3}
                maxLength={1000}
              />
              {errors.counter && <p className="text-destructive text-sm">{errors.counter}</p>}
              <p className="text-muted-foreground text-xs">{counter.length}/1000 characters</p>
            </div>

            {errors.submit && <p className="text-destructive text-sm">{errors.submit}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>{editingBias ? "Update" : "Create"} Bias</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Bias</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this bias? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

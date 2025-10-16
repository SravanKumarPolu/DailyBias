"use client"

import { useState, useEffect, useCallback } from "react"
import type { Bias } from "@/lib/types"
import { getUserBiases, addUserBias, updateUserBias, deleteUserBias } from "@/lib/db"
import { getCoreBiases, getAllBiases } from "@/lib/daily-selector"
import { toast } from "@/hooks/use-toast"

export function useBiases() {
  const [userBiases, setUserBiases] = useState<Bias[]>([])
  const [allBiases, setAllBiases] = useState<Bias[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadBiases = useCallback(async () => {
    try {
      console.log("[BiasesHook] Loading user biases...")
      setError(null)
      const userBiasesData = await getUserBiases()
      console.log("[BiasesHook] Loaded user biases:", userBiasesData.length, userBiasesData.map(b => b.title))
      setUserBiases(userBiasesData)
      const allBiasesData = getAllBiases(userBiasesData)
      console.log("[BiasesHook] Total biases (core + user):", allBiasesData.length)
      setAllBiases(allBiasesData)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load biases"
      console.error("[BiasesHook] Error loading biases:", error)
      setError(message)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBiases()
  }, [loadBiases])

  const addBias = useCallback(
    async (bias: Bias) => {
      try {
        console.log("[BiasesHook] Adding bias:", bias.title)
        await addUserBias(bias)
        console.log("[BiasesHook] Successfully added bias, reloading...")
        await loadBiases()
        toast({
          title: "Success",
          description: "Bias added successfully",
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to add bias"
        console.error("[BiasesHook] Error adding bias:", error)
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        })
        throw error
      }
    },
    [loadBiases]
  )

  const updateBias = useCallback(
    async (bias: Bias) => {
      try {
        console.log("[BiasesHook] Updating bias:", bias.title)
        await updateUserBias(bias)
        console.log("[BiasesHook] Successfully updated bias, reloading...")
        await loadBiases()
        toast({
          title: "Success",
          description: "Bias updated successfully",
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update bias"
        console.error("[BiasesHook] Error updating bias:", error)
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        })
        throw error
      }
    },
    [loadBiases]
  )

  const deleteBias = useCallback(
    async (id: string) => {
      try {
        console.log("[BiasesHook] Deleting bias:", id)
        await deleteUserBias(id)
        console.log("[BiasesHook] Successfully deleted bias, reloading...")
        await loadBiases()
        toast({
          title: "Success",
          description: "Bias deleted successfully",
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to delete bias"
        console.error("[BiasesHook] Error deleting bias:", error)
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        })
        throw error
      }
    },
    [loadBiases]
  )

  return {
    userBiases,
    allBiases,
    coreBiases: getCoreBiases(),
    loading,
    error,
    addBias,
    updateBias,
    deleteBias,
    refresh: loadBiases,
  }
}

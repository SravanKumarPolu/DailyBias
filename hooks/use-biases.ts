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
      setError(null)
      const userBiasesData = await getUserBiases()
      setUserBiases(userBiasesData)
      setAllBiases(getAllBiases(userBiasesData))
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load biases"
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
        await addUserBias(bias)
        await loadBiases()
        toast({
          title: "Success",
          description: "Bias added successfully",
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to add bias"
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
        await updateUserBias(bias)
        await loadBiases()
        toast({
          title: "Success",
          description: "Bias updated successfully",
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update bias"
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
        await deleteUserBias(id)
        await loadBiases()
        toast({
          title: "Success",
          description: "Bias deleted successfully",
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to delete bias"
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

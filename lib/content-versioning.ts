/**
 * Content Versioning System
 * Tracks updates and improvements to bias content
 */

import { openDB, type DBSchema, type IDBPDatabase } from "idb"

export interface ContentVersion {
  id: string
  biasId: string
  version: number
  timestamp: number
  changes: ContentChange[]
  author: string
  reason: string
}

export interface ContentChange {
  field: "summary" | "why" | "counter" | "references" | "researchLevel"
  oldValue: string | object
  newValue: string | object
  changeType: "added" | "modified" | "removed"
}

interface ContentVersioningDB extends DBSchema {
  contentVersions: {
    key: string
    value: ContentVersion
    indexes: { "byBiasId": string, "byTimestamp": number }
  }
  qualityMetrics: {
    key: string
    value: ContentQualityMetrics
    indexes: { "byScore": number }
  }
}

export interface ContentQualityMetrics {
  biasId: string
  accuracyScore: number
  clarityScore: number
  completenessScore: number
  userRating: number
  expertReviewScore?: number
  lastUpdated: number
  version: number
}

export class ContentVersionManager {
  private static instance: ContentVersionManager
  private db: IDBPDatabase<ContentVersioningDB> | null = null

  static getInstance(): ContentVersionManager {
    if (!ContentVersionManager.instance) {
      ContentVersionManager.instance = new ContentVersionManager()
    }
    return ContentVersionManager.instance
  }

  async initialize(): Promise<void> {
    if (this.db) return
    
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return
    }

    this.db = await openDB<ContentVersioningDB>("bias-daily-db", 4, {
      upgrade(db, oldVersion) {
        // Create content versions store (version 3 migration)
        if (oldVersion < 3) {
          if (!db.objectStoreNames.contains("contentVersions")) {
            const versionStore = db.createObjectStore("contentVersions", { keyPath: "id" })
            versionStore.createIndex("byBiasId", "biasId")
            versionStore.createIndex("byTimestamp", "timestamp")
          }
          
          // Create quality metrics store
          if (!db.objectStoreNames.contains("qualityMetrics")) {
            const metricsStore = db.createObjectStore("qualityMetrics", { keyPath: "biasId" })
            metricsStore.createIndex("byScore", "userRating")
          }
        }
        
        // Version 4 migration - feedback store is handled by main db.ts
        // No action needed here as both use the same database instance
      }
    })
  }

  async createVersion(
    biasId: string,
    changes: ContentChange[],
    author: string,
    reason: string
  ): Promise<ContentVersion> {
    await this.initialize()
    
    const version: ContentVersion = {
      id: `${biasId}-${Date.now()}`,
      biasId,
      version: await this.getNextVersionNumber(biasId),
      timestamp: Date.now(),
      changes,
      author,
      reason
    }

    await this.db!.add("contentVersions", version)

    return version
  }

  async getVersionHistory(biasId: string): Promise<ContentVersion[]> {
    await this.initialize()
    
    const versions = await this.db!.getAllFromIndex("contentVersions", "byBiasId", biasId)
    return versions.sort((a, b) => b.timestamp - a.timestamp)
  }

  async updateQualityMetrics(
    biasId: string,
    metrics: Partial<ContentQualityMetrics>
  ): Promise<void> {
    await this.initialize()
    
    const existing = await this.db!.get("qualityMetrics", biasId)
    
    const updatedMetrics: ContentQualityMetrics = {
      biasId,
      accuracyScore: metrics.accuracyScore ?? existing?.accuracyScore ?? 0,
      clarityScore: metrics.clarityScore ?? existing?.clarityScore ?? 0,
      completenessScore: metrics.completenessScore ?? existing?.completenessScore ?? 0,
      userRating: metrics.userRating ?? existing?.userRating ?? 0,
      expertReviewScore: metrics.expertReviewScore ?? existing?.expertReviewScore,
      lastUpdated: Date.now(),
      version: (existing?.version ?? 0) + 1
    }
    
    await this.db!.put("qualityMetrics", updatedMetrics)
  }

  async getQualityMetrics(biasId: string): Promise<ContentQualityMetrics | null> {
    await this.initialize()
    
    const result = await this.db!.get("qualityMetrics", biasId)
    return result || null
  }

  async getAllQualityMetrics(): Promise<ContentQualityMetrics[]> {
    await this.initialize()
    
    return await this.db!.getAll("qualityMetrics")
  }

  private async getNextVersionNumber(biasId: string): Promise<number> {
    const history = await this.getVersionHistory(biasId)
    return history.length > 0 ? Math.max(...history.map(v => v.version)) + 1 : 1
  }

  async getContentHealthScore(biasId: string): Promise<number> {
    const metrics = await this.getQualityMetrics(biasId)
    if (!metrics) return 0

    const weights = {
      accuracy: 0.3,
      clarity: 0.25,
      completeness: 0.25,
      userRating: 0.2
    }

    return (
      metrics.accuracyScore * weights.accuracy +
      metrics.clarityScore * weights.clarity +
      metrics.completenessScore * weights.completeness +
      metrics.userRating * weights.userRating
    )
  }

  async getContentNeedingReview(): Promise<string[]> {
    try {
      await this.initialize()
      
      if (!this.db) {
        return []
      }
      
      const allMetrics = await this.getAllQualityMetrics()
      return allMetrics
        .filter(metrics => {
          const healthScore = (
            metrics.accuracyScore * 0.3 +
            metrics.clarityScore * 0.25 +
            metrics.completenessScore * 0.25 +
            metrics.userRating * 0.2
          )
          return healthScore < 0.7 || (Date.now() - metrics.lastUpdated) > 30 * 24 * 60 * 60 * 1000 // 30 days
        })
        .map(metrics => metrics.biasId)
    } catch (error) {
      console.error("Error getting content needing review:", error)
      return []
    }
  }
}

export const contentVersionManager = ContentVersionManager.getInstance()

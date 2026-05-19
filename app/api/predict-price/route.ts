import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

const CATEGORY_MAP: Record<string, string> = {
  'Elektro': 'Elektro',
  'Sanitär': 'Sanitaer',
  'Malerei': 'Malerei',
  'Garten': 'Garten',
  'Reinigung': 'Reinigung',
  'Sonstiges': 'Sonstiges',
}

function estimateComplexity(description: string): string {
  const len = description.length
  if (len < 50) return 'short'
  if (len < 120) return 'medium'
  return 'long'
}

let modelCache: any = null

async function loadModel() {
  if (modelCache) return modelCache
  const modelPath = join(process.cwd(), 'ml', 'model.json')
  const raw = await readFile(modelPath, 'utf-8')
  modelCache = JSON.parse(raw)
  return modelCache
}

export async function POST(req: NextRequest) {
  const { category, description } = await req.json()

  if (!category) {
    return NextResponse.json({ error: 'Kategorie fehlt' }, { status: 400 })
  }

  const model = await loadModel()
  const modelCategory = CATEGORY_MAP[category] || category
  const complexity = estimateComplexity(description || '')

  const categoryStats = model.category_stats[modelCategory]
  const predictions = model.predictions[modelCategory]?.[complexity]

  if (!categoryStats || !predictions) {
    return NextResponse.json({ error: 'Kategorie nicht gefunden' }, { status: 404 })
  }

  return NextResponse.json({
    category,
    complexity,
    predicted_min: predictions.predicted_min,
    predicted_max: predictions.predicted_max,
    predicted_mean: predictions.predicted_mean,
    category_avg: categoryStats.mean,
    sample_count: categoryStats.count,
    model_r2: model.r2,
  })
}

'use client'

import { useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const MIN_PHOTOS = 3

export default function SubmitPage() {
  const router = useRouter()
  const params = useParams()
  const taskId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    const newPhotos = [...photos, ...files].slice(0, 6)
    setPhotos(newPhotos)
    const newPreviews = newPhotos.map(f => URL.createObjectURL(f))
    setPreviews(newPreviews)
  }

  function removePhoto(index: number) {
    const newPhotos = photos.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    setPhotos(newPhotos)
    setPreviews(newPreviews)
  }

  async function handleSubmit() {
    if (photos.length < MIN_PHOTOS) {
      setError(`Please upload at least ${MIN_PHOTOS} photos.`)
      return
    }
    if (!notes.trim()) {
      setError('Please add condition notes before submitting.')
      return
    }
    setUploading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const uploadedUrls: string[] = []
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i]
        const ext = photo.name.split('.').pop() || 'jpg'
        const path = `${user.id}/task-${taskId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('Task-Photos')
          .upload(path, photo, { upsert: false })
        if (uploadError) throw new Error(`Photo upload failed: ${uploadError.message}`)
        const { data: { publicUrl } } = supabase.storage.from('Task-Photos').getPublicUrl(path)
        uploadedUrls.push(publicUrl)
      }

      const { error: taskError } = await supabase
        .from('tasks')
        .update({
          status: 'Completed',
          report_text: notes.trim(),
          completed_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', parseInt(taskId))
      if (taskError) throw new Error(`Task update failed: ${taskError.message}`)

      for (let i = 0; i < uploadedUrls.length; i++) {
        await supabase.from('documents').insert({
          task_id: parseInt(taskId),
          file_name: `task-${taskId}-photo-${i + 1}.jpg`,
          file_url: uploadedUrls[i],
          file_type: 'image/jpeg',
          uploaded_by: user.id
        })
      }

      router.push('/tasks')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
      setUploading(false)
    }
  }

  const progress = Math.min(100, Math.round((photos.length / MIN_PHOTOS) * 100))
  const canSubmit = photos.length >= MIN_PHOTOS && notes.trim().length > 0

  return (
    <div className="min-h-svh bg-[#eef1f8] flex flex-col">

      <header className="flex items-center justify-between px-5 py-4 bg-[#2563eb] border-b border-[#1d4ed8]">
        <div className="flex items-center gap-3">
          <Link href={`/tasks/${taskId}`} className="text-blue-200 text-xl no-underline leading-none">←</Link>
          <div>
            <h1 className="text-white font-bold text-xl tracking-tight">Submit Report</h1>
            <p className="text-blue-200 text-xs mt-0.5 font-medium">Task #{taskId}</p>
          </div>
        </div>
        <span className="text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-2.5 py-1 rounded-full">
          In progress
        </span>
      </header>

      <div className="flex-1 px-4 py-4 flex flex-col gap-4 pb-8">

        {/* Photos */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Photos · min {MIN_PHOTOS} required
          </p>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => {
              if (i < previews.length) {
                return (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden relative">
                    <img src={previews[i]} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white border-none text-xs cursor-pointer flex items-center justify-center leading-none"
                    >
                      ×
                    </button>
                  </div>
                )
              }
              if (i === previews.length && photos.length < 6) {
                return (
                  <button
                    key={i}
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl bg-white border border-dashed border-gray-300 flex items-center justify-center cursor-pointer text-2xl text-gray-400"
                  >
                    +
                  </button>
                )
              }
              return (
                <div key={i} className="aspect-square rounded-xl bg-gray-100 border border-gray-200" />
              )
            })}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            onChange={handlePhotoSelect}
            className="hidden"
          />
        </div>

        {/* Progress bar */}
        <div>
          <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                background: progress >= 100 ? '#16a34a' : '#2563eb'
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-gray-500">{photos.length} of {MIN_PHOTOS} photos uploaded</span>
            <span className="text-xs font-semibold" style={{ color: progress >= 100 ? '#16a34a' : '#2563eb' }}>
              {progress}%
            </span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Condition notes
          </p>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Describe property condition, any visible damage, violations, or issues..."
            rows={5}
            className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white outline-none resize-none leading-relaxed"
          />
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || uploading}
          className="w-full py-3.5 rounded-xl text-white text-sm font-semibold disabled:cursor-not-allowed transition-colors"
          style={{ background: canSubmit && !uploading ? '#2563eb' : '#94a3b8' }}
        >
          {uploading ? 'Submitting...' : 'Submit completed task'}
        </button>

      </div>
    </div>
  )
}

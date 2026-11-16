import { useState } from 'react'
import { ArrowUpRight, FolderGit2, Play, Video } from 'lucide-react'

export interface ProjectItemData {
  title: string
  category: string
  description?: string
  result?: string
  imageUrl?: string
  externalLink?: string
  githubUrl?: string
  techStack?: string[]
}

interface ProjectCardProps {
  project: ProjectItemData
  variant?: 'card' | 'compact'
  className?: string
}

function GithubIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  )
}

export function isVideoMedia(url?: string): boolean {
  if (!url) return false
  const clean = url.split('?')[0].toLowerCase()
  return (
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.ogg') ||
    clean.endsWith('.mov') ||
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    url.includes('vimeo.com') ||
    url.includes('loom.com')
  )
}

export function getVideoEmbedUrl(url: string): string | null {
  if (!url) return null

  // YouTube
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)
  if (ytMatch) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }

  // Loom
  const loomMatch = url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/)
  if (loomMatch) {
    return `https://www.loom.com/embed/${loomMatch[1]}`
  }

  return null
}

export function parseProjectLinks(
  rawLink?: string,
  explicitGithub?: string,
  explicitTechStack?: string[]
): {
  liveUrl?: string
  githubUrl?: string
  techStack: string[]
} {
  let liveUrl = ''
  let githubUrl = explicitGithub || ''
  let techStack: string[] = explicitTechStack ? [...explicitTechStack] : []

  if (!rawLink) {
    return { liveUrl, githubUrl, techStack }
  }

  const trimmed = rawLink.trim()

  // JSON format support
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (parsed.live) liveUrl = parsed.live
      if (parsed.github) githubUrl = parsed.github
      if (Array.isArray(parsed.tech)) techStack = [...techStack, ...parsed.tech]
      return { liveUrl, githubUrl, techStack }
    } catch {
      // Continue to pipe check
    }
  }

  // Pipe separated format: "liveUrl | githubUrl | tech1, tech2"
  if (trimmed.includes('|')) {
    const parts = trimmed.split('|').map((p) => p.trim())
    for (const part of parts) {
      if (part.includes('github.com')) {
        githubUrl = githubUrl || part
      } else if (part.startsWith('http://') || part.startsWith('https://')) {
        liveUrl = liveUrl || part
      } else if (part.length > 0) {
        const tags = part.split(',').map((t) => t.trim()).filter(Boolean)
        techStack = [...techStack, ...tags]
      }
    }
    return { liveUrl, githubUrl, techStack }
  }

  // Single URL
  if (trimmed.includes('github.com')) {
    githubUrl = githubUrl || trimmed
  } else {
    liveUrl = trimmed
  }

  return { liveUrl, githubUrl, techStack }
}

export function ProjectCard({
  project,
  variant = 'card',
  className = '',
}: ProjectCardProps) {
  const { liveUrl, githubUrl, techStack } = parseProjectLinks(
    project.externalLink,
    project.githubUrl,
    project.techStack
  )

  const primaryLink = liveUrl || githubUrl || '#contact'
  const isExternal = Boolean(liveUrl || githubUrl)
  const isVideo = isVideoMedia(project.imageUrl)
  const embedUrl = isVideo && project.imageUrl ? getVideoEmbedUrl(project.imageUrl) : null
  const [isPlayingDirect, setIsPlayingDirect] = useState(false)

  if (variant === 'compact') {
    return (
      <a
        href={primaryLink}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className={`group flex items-center justify-between gap-3.5 p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] transition-all ${className}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-card-subtle)] flex items-center justify-center">
            {isVideo ? (
              <div className="flex h-full w-full items-center justify-center bg-stone-900 text-emerald-400">
                <Video className="h-5 w-5" />
              </div>
            ) : project.imageUrl ? (
              <img
                src={project.imageUrl}
                alt={project.title}
                className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <FolderGit2 className="h-5 w-5 text-[var(--text-muted)]" />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-emerald-500 transition-colors">
              {project.title}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                {project.category}
              </span>
              {project.result ? (
                <>
                  <span className="text-[var(--border-color)]">·</span>
                  <span className="text-xs text-[var(--text-secondary)] truncate">
                    {project.result}
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="shrink-0 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </a>
    )
  }

  return (
    <div
      className={`group flex flex-col justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 sm:p-5 hover:border-[var(--text-muted)] transition-all ${className}`}
    >
      <div className="space-y-4">
        {/* Project Media: Photo OR Video */}
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-card-subtle)]">
          {isVideo && project.imageUrl ? (
            embedUrl ? (
              <iframe
                src={embedUrl}
                title={project.title}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="relative h-full w-full group/video bg-black flex items-center justify-center">
                <video
                  src={project.imageUrl}
                  controls
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                  onPlay={() => setIsPlayingDirect(true)}
                  onPause={() => setIsPlayingDirect(false)}
                />
                {!isPlayingDirect && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/90 text-white shadow-lg backdrop-blur">
                      <Play className="h-4 w-4 fill-white ml-0.5" />
                    </div>
                  </div>
                )}
              </div>
            )
          ) : project.imageUrl ? (
            <img
              src={project.imageUrl}
              alt={project.title}
              className="h-full w-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <FolderGit2 className="h-8 w-8 text-[var(--text-muted)] opacity-50" />
            </div>
          )}

          {/* Category Tag Overlay */}
          <div className="absolute top-2.5 left-2.5 pointer-events-none">
            <span className="rounded-md border border-[var(--border-color)] bg-[var(--bg-card)]/90 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--text-primary)] backdrop-blur">
              {project.category}
            </span>
          </div>

          {isVideo && (
            <div className="absolute top-2.5 right-2.5 pointer-events-none">
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-950/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-400 backdrop-blur">
                <Video className="h-3 w-3" />
                <span>Video</span>
              </span>
            </div>
          )}
        </div>

        {/* Project Details */}
        <div className="space-y-2">
          <h3 className="text-base font-semibold tracking-tight text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors">
            {project.title}
          </h3>
          {project.description ? (
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">
              {project.description}
            </p>
          ) : null}

          {/* Tech Stack Pills */}
          {techStack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-md border border-[var(--border-color)] bg-[var(--bg-card-subtle)] px-2 py-0.5 font-mono text-[10px] text-[var(--text-secondary)]"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results and Action Links */}
      <div className="mt-4 pt-3.5 border-t border-[var(--border-color)] flex items-center justify-between gap-3 text-xs">
        {project.result ? (
          <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-medium truncate">
            {project.result}
          </span>
        ) : (
          <span className="text-[var(--text-muted)] font-mono text-[11px]">Own Project</span>
        )}

        <div className="flex items-center gap-2.5 shrink-0">
          {githubUrl ? (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-1.5 py-0.5 rounded border border-transparent hover:border-[var(--border-color)]"
              title="View Source Code"
            >
              <GithubIcon className="h-3 w-3" />
              <span>Code</span>
            </a>
          ) : null}

          {liveUrl ? (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-1.5 py-0.5 rounded border border-transparent hover:border-[var(--border-color)]"
              title="Open Live Preview"
            >
              <span>Demo</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  )
}

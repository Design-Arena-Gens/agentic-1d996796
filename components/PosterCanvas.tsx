'use client'

import { useEffect, useRef, useState } from 'react'

interface PosterCanvasProps {
  productImage: string
  posterData: any
  template: string
}

export default function PosterCanvas({ productImage, posterData, template }: PosterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!canvasRef.current || !productImage || !posterData) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 1080
    canvas.height = 1350

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // Draw background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)

      switch (template) {
        case 'modern':
          gradient.addColorStop(0, '#667eea')
          gradient.addColorStop(1, '#764ba2')
          break
        case 'minimal':
          gradient.addColorStop(0, '#ffffff')
          gradient.addColorStop(1, '#f7fafc')
          break
        case 'vibrant':
          gradient.addColorStop(0, '#FF6B6B')
          gradient.addColorStop(1, '#FFE66D')
          break
        case 'elegant':
          gradient.addColorStop(0, '#2C3E50')
          gradient.addColorStop(1, '#34495E')
          break
        case 'bold':
          gradient.addColorStop(0, '#FF0080')
          gradient.addColorStop(1, '#7928CA')
          break
        default:
          gradient.addColorStop(0, '#667eea')
          gradient.addColorStop(1, '#764ba2')
      }

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw product image
      const imgAspect = img.width / img.height
      const imgWidth = 800
      const imgHeight = imgWidth / imgAspect
      const imgX = (canvas.width - imgWidth) / 2
      const imgY = 150

      // Add shadow for product image
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
      ctx.shadowBlur = 20
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 10

      // Draw rounded rectangle for image
      const borderRadius = 20
      ctx.beginPath()
      ctx.moveTo(imgX + borderRadius, imgY)
      ctx.lineTo(imgX + imgWidth - borderRadius, imgY)
      ctx.quadraticCurveTo(imgX + imgWidth, imgY, imgX + imgWidth, imgY + borderRadius)
      ctx.lineTo(imgX + imgWidth, imgY + imgHeight - borderRadius)
      ctx.quadraticCurveTo(imgX + imgWidth, imgY + imgHeight, imgX + imgWidth - borderRadius, imgY + imgHeight)
      ctx.lineTo(imgX + borderRadius, imgY + imgHeight)
      ctx.quadraticCurveTo(imgX, imgY + imgHeight, imgX, imgY + imgHeight - borderRadius)
      ctx.lineTo(imgX, imgY + borderRadius)
      ctx.quadraticCurveTo(imgX, imgY, imgX + borderRadius, imgY)
      ctx.closePath()
      ctx.fillStyle = 'white'
      ctx.fill()

      ctx.save()
      ctx.clip()
      ctx.drawImage(img, imgX + 10, imgY + 10, imgWidth - 20, imgHeight - 20)
      ctx.restore()

      // Reset shadow
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      // Draw headline
      const textColor = template === 'minimal' ? '#1a202c' : '#ffffff'
      ctx.fillStyle = textColor
      ctx.font = 'bold 72px Arial, sans-serif'
      ctx.textAlign = 'center'

      const headline = posterData.headline || 'Amazing Product'
      wrapText(ctx, headline, canvas.width / 2, imgY + imgHeight + 100, 950, 90)

      // Draw tagline
      ctx.font = '36px Arial, sans-serif'
      const tagline = posterData.tagline || 'Get yours today!'
      wrapText(ctx, tagline, canvas.width / 2, imgY + imgHeight + 250, 950, 50)

      // Draw CTA button
      const buttonY = imgY + imgHeight + 350
      const buttonWidth = 400
      const buttonHeight = 80
      const buttonX = (canvas.width - buttonWidth) / 2

      ctx.fillStyle = template === 'minimal' ? '#667eea' : '#ffffff'
      roundRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, 40)
      ctx.fill()

      ctx.fillStyle = template === 'minimal' ? '#ffffff' : '#667eea'
      ctx.font = 'bold 32px Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(posterData.cta || 'Shop Now', canvas.width / 2, buttonY + 52)

      setIsReady(true)
    }
    img.src = productImage
  }, [productImage, posterData, template])

  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) => {
    const words = text.split(' ')
    let line = ''
    let currentY = y

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' '
      const metrics = ctx.measureText(testLine)
      const testWidth = metrics.width

      if (testWidth > maxWidth && i > 0) {
        ctx.fillText(line, x, currentY)
        line = words[i] + ' '
        currentY += lineHeight
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, x, currentY)
  }

  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  }

  const downloadPoster = () => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = 'ad-poster.png'
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  return (
    <div className="space-y-4">
      <div className="relative poster-canvas rounded-xl overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-auto border-4 border-gray-200 rounded-xl"
        />
      </div>

      {isReady && (
        <button
          onClick={downloadPoster}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
        >
          Download Poster
        </button>
      )}
    </div>
  )
}

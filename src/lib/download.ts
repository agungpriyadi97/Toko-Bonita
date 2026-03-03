/**
 * Download a file from a URL and trigger browser download
 */
export async function downloadFileFromUrl(url: string, filename: string): Promise<boolean> {
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.status}`)
    }
    
    const blob = await response.blob()
    const blobUrl = window.URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    window.URL.revokeObjectURL(blobUrl)
    
    return true
  } catch (error) {
    console.error('Download error:', error)
    return false
  }
}

const GUIDE_KEY = 'guide_seen'
export function hasSeenGuide(): boolean {
    return localStorage.getItem(GUIDE_KEY) === 'true'
}
export function markGuideAsSeen(): void {
    localStorage.setItem(GUIDE_KEY, 'true')
}
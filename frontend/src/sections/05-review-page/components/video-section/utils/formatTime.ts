export const formatTime = (time: number): string => {
  const m = Math.floor(time / 60)
  const s = Math.floor(time % 60)
  const ms = Math.floor((time % 1) * 1000)
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")},${ms.toString().padStart(3, "0")}`
}

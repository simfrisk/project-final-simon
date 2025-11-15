export const unFormatTime = (formattedTime: string): number => {
  // Handle both old format (MM:SS) and new format (MM:SS,mmm)
  const [timePart, msPart] = formattedTime.split(",")
  const [m, s] = timePart.split(":").map(Number)
  const ms = msPart ? Number(msPart) / 1000 : 0
  return m * 60 + s + ms
}

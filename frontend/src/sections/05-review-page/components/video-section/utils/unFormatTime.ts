export const unFormatTime = (formattedTime: string): number => {
  const [m, s] = formattedTime.split(":").map(Number)
  return m * 60 + s
}

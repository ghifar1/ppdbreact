export { cn } from "cn"

/** "Ahmad Fauzi Rahman" -> "AF" */
export function initials(name) {
    return (name ?? '?').split(' ').filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase()
}

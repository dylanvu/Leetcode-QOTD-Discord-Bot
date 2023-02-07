/**
 * Define the problem object for a leetcode problem
 */
export interface Problem {
    id: string,
    title: string,
    titleSlug: string,
    difficulty: "Hard" | "Medium" | "Easy",
    paid: boolean,
    url: string
}

/**
 * Define filtering options for questions
 */
export interface FilterOptions {
    difficulty: "Hard" | "Medium" | "Easy",
    paid: boolean
}
import { difficultyOptions } from "../types/types"
/**
 * Define the problem object for a leetcode problem
 */
export interface Problem {
    id: string,
    title: string,
    titleSlug: string,
    difficulty: difficultyOptions,
    paid: boolean,
    url: string
}

/**
 * Define filtering options for questions
 * @param {difficultyOptions} difficulty question difficulty.  "Hard" | "Medium" | "Easy"
 * @param {boolean} paid whether the question should be paid or not.
 */
export interface FilterOptions {
    difficulty: difficultyOptions,
    paid: boolean
}
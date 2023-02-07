// import axios for API calls to the leetcode website
import Axios from "axios";
import { Problem } from "./interfaces";

const leetcodeApiUrl = "https://leetcode.com/api/problems/all/";
const leetcodeProblemUrlBase = "https://leetcode.com/problems/"

/**
 * API call to get all questions, no filtering
 * @returns 
 */
export async function getAllProblems(): Promise<Problem[]> {
    // make api request for problems
    const res = await Axios.get(leetcodeApiUrl);

    const allProblems = res.data.stat_status_pairs;

    // parse through all problems and create a list
    // TODO: create interface for problem
    return allProblems.map((problem: any): Problem => {
        const stat = problem.stat;
        const id = stat.question_id;
        const title = stat.question__title;
        const slug = stat.question__title_slug;
        const url = `${leetcodeProblemUrlBase}${slug}/`; // ex: https://leetcode.com/problems/two-sum/
        const difficulty: number = problem.difficulty.level;
        const paid = problem.paid_only;

        const strDifficulty = difficulty === 3 ? 'Hard' : difficulty === 2 ? 'Medium' : 'Easy';

        // create the object
        return {
            id: id,
            title: title,
            url: url,
            titleSlug: slug,
            difficulty: strDifficulty,
            paid: paid
        }
    });
}
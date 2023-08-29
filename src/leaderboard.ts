import Axios from "axios";
import { Profile } from "../interfaces/interfaces";
import * as cheerio from "cheerio";

export async function getLeetcodeProfile(leetcodeUsername: string): Promise<Profile | null> {
    // make api request for problems
    let res;
    try {
        res = await Axios.get(`https://leetcode.com/${leetcodeUsername}`);
    } catch (error) {
        if (Axios.isAxiosError(error)) {
            const jsonError: any = error.toJSON();
            if (jsonError.status === 404) {
                console.error(`Could not find leetcode profile for ${leetcodeUsername}`);
            }
        }
        return null;
    }

    // parse the html now
    let profileObject = {
        username: leetcodeUsername,
        easy: 0,
        medium: 0,
        hard: 0
    }
    const $ = cheerio.load(res.data);

    // get all the rows of the table that has difficulty, number completed, and beats %
    // example: Easy    20/711  Beats 51.9 %
    const problemFlextable = $('div[class="flex w-full items-end text-xs"]');
    for (const problem of problemFlextable) {
        // this kind of helped: https://blog.callumsteele.com/scraping-web-page-with-nodejs-and-cheerio/
        // https://cheerio.js.org/docs/basics/selecting
        const $difficulty = cheerio.load(problem)
        // get the difficulty by querying the div that has the right class
        const difficultySelector = $difficulty('div[class="w-[53px] text-label-3 dark:text-dark-label-3"]');
        const difficulty = cheerio.load(difficultySelector[0]).text();

        // query the span to get the number completed
        const completedSelector = $difficulty('span[class="mr-[5px] text-base font-medium leading-[20px] text-label-1 dark:text-dark-label-1"]');
        const completed = cheerio.load(completedSelector[0]).text();
        const completedInt = parseInt(completed);

        switch (difficulty.toLowerCase()) {
            case "easy":
                profileObject.easy = completedInt;
                break;
            case "medium":
                profileObject.medium = completedInt;
                break;
            case "hard":
                profileObject.hard = completedInt;
                break;
        }
    }
    console.log(profileObject);
    return profileObject;
}
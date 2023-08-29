import Axios from "axios";
import { Profile } from "../interfaces/interfaces";

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
    console.log(res.data)
    return {
        username: leetcodeUsername,
        easy: 0,
        medium: 0,
        hard: 0
    }
}

getLeetcodeProfile("dylanvu9");
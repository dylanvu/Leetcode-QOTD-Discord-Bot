/**
 * Returns a random integer between 0 and max (inclusive)
 * @param {number} max
 */
export function getRandomInt(max: number) {
    return Math.floor(Math.random() * (max + 1));
}
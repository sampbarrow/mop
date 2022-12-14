import { flow } from "fp-ts/function";
import { exec, map, Mapper } from ".";
import { combineArray } from "./combine";

/**
 * A union between a type and an array of the type.
 */
export type ArrayOrElement<T> = T | T[]

/**
 * Converts an array or element to an array.
 */
export function arrayOrElement<T>(value: ArrayOrElement<T>) {
    if (Array.isArray(value)) {
        return value
    }
    return [value]
}

/**
 * Regex from a string.
 */
export function regexFromString(regex: string) {
    const main = regex.match(/\/(.+)\/.*/)?.[1]
    if (main === undefined) {
        return
    }
    return new RegExp(main, regex.match(/\/.+\/(.*)/)?.[1])
}

/**
 * Applies a mapper to each element of an array. This does NOT append anything to the error path. For internal use only. Used for multiple traversals.
 */
export function loop<I, O>(mapper: (index: number) => Mapper<I, O>) {
    return flow(
        map((input: I[]) => input.map((value, index) => exec(value, mapper(index)))),
        combineArray()
    )
}

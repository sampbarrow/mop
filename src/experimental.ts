import { separate } from "fp-ts/Array"
import { flow, pipe } from "fp-ts/function"
import { ErrorFactory, MapError, buildError, typed } from "."
import { Mapper, Result } from "./base"
import { chain, failure, flat, flatMap, map, mapFail, of, orElse, success } from "./core"
import { exec } from "./exec"
import { loop } from "./internal"
import { path } from "./path"
import { on2 } from "./tuples"
import { cast } from "./types"

/**
 * Transforms each key of an object using a mapper. This is not type safe. We recommend using a map instead.
 */
export function onEachKey<I, O, K extends string | number>(mapper: (key: K) => Mapper<I, O>) {
    return flow(
        typed<Record<K, I>>,
        map(Object.entries),
        cast<(readonly [K, I])[]>,
        loop(() => chain(value => on2(flow(mapper(value[0]), path(value[0]))))),
        map(Object.fromEntries),
        cast<Record<K, O>>,
    )
}

export const tryAll = <I, O>(mappers: Mapper<I, O>[], error: ErrorFactory<[I, readonly MapError[]]>) => flatMap((input: I) => {
    const results = mappers.map(_ => _(of(input)))
    const separated = separate(results)
    const first = separated.right.at(0)
    if (first === undefined) {
        return failure(buildError(error, [input, separated.left.flat()]))
    }
    return success(first as O)
})

/**
 * Tries two mappers, just needs one to succeed.
 */
export const tryBoth = <I, A, B>(a: Mapper<I, A>, b: Mapper<I, B>, error: ErrorFactory<[I, readonly MapError[]]>) => chain((value: I) => {
    return flow(
        a,
        orElse(ae => exec(value, flow(b, mapFail(be => [...ae, ...be])))),
        mapFail(errors => buildError(error, [value, errors]))
    )
})
export const tryDetour = <I, A, B, C>(a: Mapper<I, A>, detour: Mapper<A, C>, b: Mapper<I, B>) => chain((input: I) => {
    return flow(
        a,
        map(flow(of, detour)),
        orElse(() => pipe(input, of, b, of)),
        typed<Result<C | B>>,
        flat()
    )
})

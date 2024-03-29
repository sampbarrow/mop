# Mop

A functional validation and transformation library, based on fp-ts.

The purpose of this library is to allow for advanced and flexible validation chains.

The core of the library is:

### MapError

An error object, consisting of a path, message and value. An example error object would look like this:

```
{
    path: ["field", "subField"],
    error: "This string must be at least 8 characters long",
    value: "6chars"
}
```

### Result&lt;T&gt;

The result of a transformation. Is either a value, or an array of MapError(s). This is just a shorthand for Either&lt;MapError[], T&gt;

### Mapper&lt;I, O&gt;

A function that transforms a Result&lt;I&gt; into a Result&lt;O&gt;

## Installation

## Usage

More examples to come.

```typescript

import { flow } from "fp-ts/function"
import * as M from "mop"

// An object mapper accepts keys and sub-mappers.
const schema = M.object({
    number: flow(M.isNumber(), M.gt(5)),
    // The flow function is from fp-ts and is used for chaining mappers.
    list: flow(
        // We want this array to have between 2 and 4 elements.
        M.minElem(2),
        M.maxElem(4),
        // This allows us to map each element of the array using a different mapper based on the index.
        M.arrayByIndex(index => {
            // For the first element of the array, we want the string to start with 
            "FIRST".
            if (index === 0) {
                return M.object({
                    id: flow(M.nonBlankString(), M.startsWith("FIRST"))
                })
            }
            // For the other elements, we don't care, as long as it's a non-blank string.
            else {
                return M.object({
                    id: flow(M.nonBlankString())
                })
            }
        })
    )
})

const value = {
    number: 5,
    list: [
        {
            id: "FIRST"
        },
        {
            id: "SECOND"
        },
    ]
}
const results = M.exec(value, schema)

if (M.isSuccess(results)) {
    console.log(value)
}

```

## License

[MIT](https://choosealicense.com/licenses/mit/)

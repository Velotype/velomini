// deno-lint-ignore-file no-explicit-any

import {
    // Debugging access
    __vtAppMetadata,

    // Interfaces
    type Mountable,
    type TypeConstructor,
    type Type,

    // Engine types
    type BasicTypes,
    type RenderableElements,

    // Core types
    type FunctionComponent,
    Component,
    type EmptyAttrs,
    type IdAttr,
    type ChildrenAttr,
    type StylePassthroughAttrs,

    // TSX integration
    setAttrsOnElement,
    h,
    f,
    getComponent,

    // DOM Manipulation
    replaceElement,
} from "../tsx-mini/tsx-mini.ts"

export {
    // Debugging access
    __vtAppMetadata,

    // Interfaces
    type Mountable,
    type TypeConstructor,
    type Type,

    // Engine types
    type BasicTypes,
    type RenderableElements,

    // Core types
    type FunctionComponent,
    Component,
    type EmptyAttrs,
    type IdAttr,
    type ChildrenAttr,
    type StylePassthroughAttrs,

    // TSX integration
    setAttrsOnElement,
    h,
    f,
    getComponent,

    // DOM Manipulation
    replaceElement,
}

/**
 * Create an element with a tag, set it's attributes using attrs, then append children
 * 
 * ```tsx
 * <tag attrOne={} attrTwo={}>{children}</tag>
 * ```
 */
export function jsx(tag: any, attrs: any, key?: string | undefined): RenderableElements {
    // Pull children out of attrs
    const children = attrs.children
    delete attrs.children

    // Reattach key into attrs if defined
    if (key !== undefined) {
        attrs.key = key
    }
    return h(tag, attrs, children)
}

/**
 * Create an element with a tag, set it's attributes using attrs, then append children
 * 
 * ```tsx
 * <tag attrOne={} attrTwo={}>{children}</tag>
 * ```
 * 
 * Note: Velotype does not distinguish between static and dynamic children arrays so jsx and jsxs are identical
 */
export const jsxs: (tag: any, attrs: any, key?: string | undefined) => RenderableElements = jsx

/**
 * Create an fragment `<></>` (which just propagates an array of children[])
 */
export const Fragment: (_attrs: Readonly<any> | null, ...children: RenderableElements[]) => RenderableElements[] = f

// Export the JSX namespace for JSX type checking
import type { JSXInternal } from "../jsx-types/jsx-types.d.ts"
export type { JSXInternal as JSX }

// deno-lint-ignore-file no-unused-vars no-explicit-any

/** Basic primitives that are renderable directly */
export type BasicTypes = string | bigint | number | boolean

/** Type used to represent a constructor function for a Class */
export type TypeConstructor<T> = new (...args: any[]) => T

/** Type used to represent abstract Class passing */
export interface Type<T> extends TypeConstructor<T>{}

/** Valid child objects of an Element */
export type RenderableElements = BasicTypes | Component<any> | HTMLElement | Text | RenderableElements[] | null | undefined | void

/** Type used to represent that no Attrs are accepted for a Component */
export type EmptyAttrs = Record<string | number | symbol, never>

/** Type used to represent pass-through id to an underlying Element of a Component */
export type IdAttr = {
    /** An id to pass-through to the underlying Element of this Component */
    id?: string
}

/** Type used to represent that children are accepted by a Component */
export type ChildrenAttr = {
    /** A collection of RenderableElements to place as children of this Component */
    children?: RenderableElements
}

/** Type used to represent pass-through style controls by a Component to an underlying Element */
export type StylePassthroughAttrs = {
    /** A string of CSS class names to pass-through to the underlying Element of this Component */
    class?: string
    /** CSS styles to pass-through to the underlying Element of this Component */
    style?: any
}

/** Style display:contents; */
const displayContents = {style: 'display:contents;'}

/** Style display:none; */
const displayNone = {style: 'display:none;'}

/** String "div" */
const divTag = 'div'

/** Checks if somthing is an instanceof any of the BasicTypes (string, bigint, number, boolean) */
function instanceOfBasicTypes(something: any): something is BasicTypes {
    if (typeof something === 'string' || typeof something === 'bigint' || typeof something === 'number' || typeof something === 'boolean') {
        return true
    }
    return false
}

/** Map of DOM keys to Velotype Component references */
const domReferences: Map<string, Component<any>> = new Map<string, Component<any>>()

/** The next key to use for DOM bindings */
let domNextKey: bigint = 1n

/** Attribute name to use for DOM -> Component bindings */
const domKeyName = "vk"

/**
 * App Metadata
 * 
 * Stateful storage of various stuffs, this is a Velotype internal object
 * DO NOT USE OR MANPULATE, for debugging only
 */
export const __vtAppMetadata = {
    // ------- For Velotype Core -------
    /** Key name for DOM bindings */
    domKeyName: domKeyName,
    /** Map of DOM keys to Velotype Component references */
    domReferences: domReferences,
}

/**
 * Appends children to an HTMLElement (unwraps Arrays and wraps BasicTypes in TextNodes)
 * 
 * @param parent HTMLElement to append to
 * @param child Children to append
 */
function appendChild(parent: HTMLElement, child: RenderableElements) {
    if (Array.isArray(child)) {
        // Recurse over arrays
        for (let i = 0; i < child.length; i++) {
            appendChild(parent, child[i])
        }
    } else {
        let element: any = undefined
        if (instanceOfBasicTypes(child)) {
            // BasicTypes get converted into TextNodes
            element = document.createTextNode(child.toString())
        } else if (child instanceof Component) {
            // Get Component reference from the vtKey
            const component = domReferences.get(child.vtKey)
            if (component) {
                element = component.element
            }
        } else if ((child instanceof HTMLElement) || (child instanceof Text)) {
            element = child
        }
        // If we were able to resolve the element, then append it to the parent
        if (element) {
            parent.appendChild(element)
        }
    }
}

/**
 * A Velotype Function Component that can be used in .tsx files to render HTML Components.
 */
export type FunctionComponent<AttrsType> = (attrs: Readonly<AttrsType>, children: RenderableElements[]) => RenderableElements

/**
 * Represents a Component that is mountable / unmountable
 */
export interface Mountable {
    /**
     * Mount is called just after a Component is attached to the DOM
     */
    mount: () => void

    /**
     * Unmount is called just before a Component is removed from the DOM
     */
    unmount: () => void
}

/**
 * A Velotype Class Component that can be used in .tsx files to render HTML Components.
 */
export abstract class Component<AttrsType> implements Mountable {

    /** constructor gets attrs and children */
    constructor(attrs: Readonly<AttrsType>, children: RenderableElements[]){}

    /**
     * Render is called when this Comonent needs to be materialized into Elements.
     * To be implemented by a specific Component that extends Component
     * @param {Readonly<AttrsType>} attrs The attrs for this Component
     * @param {ChildrenTypes[]} children Any children of this Component
     */
    abstract render(attrs: Readonly<AttrsType>, children: RenderableElements[]): RenderableElements

    /**
     * Mount is called just after this Component is attached to the DOM.
     * 
     * May be overriden by a specific Component that extends Component
     */
    mount(): void {}

    /**
     * Unmount is called just before this Component is removed from the DOM.
     * 
     * May be overriden by a specific Component that extends Component
     */
    unmount(): void {}

    /**
     * Trigger re-rendering of this Comonent and all child Components.
     * This will unmount and delete all child Components, then call
     * this.render() and consequently new and mount a fresh set of child Components.
     * 
     * This is set by Velotype Core on Component construction and is not overridable
     */
    refresh(){}

    /**
     * A unique key per instance of each Component.
     * 
     * This is read-only and set by Velotype Core on Component construction and is not overridable
     */
    vtKey: string = ""

    /**
     * A reference to this Component's HTMLElement
     */
    element?: HTMLElement
}

/**
 * Replace an element with a newElement
 * 
 * Note: this will detect if the element hasFocus and will set newElement.focus() if needed
 */
export function replaceElement(element: HTMLElement | undefined, newElement: HTMLElement): HTMLElement {
    if (element) {
        const isFocused = document.hasFocus() ? document.activeElement == element : false
        unmountComponentElementChildren(element)
        element.replaceWith(newElement)
        mountComponentElementChildren(newElement)
        if (isFocused) {
            newElement.focus()
        }
    }
    return newElement
}

/**
 * Mount the children of this element
 */
function mountComponentElementChildren(element: Element) {
    if (element instanceof HTMLElement) {
        for (let i = 0; i < element.children.length; i++) {
            const child = element.children[i]
            mountComponentElementChildren(child)
            const key = child.getAttribute(domKeyName)
            if (key) {
                const component = domReferences.get(key)
                if (component) {
                    // Mount Component
                    component.mount()
                }
            }
        }
    }
}

/**
 * Unmount the children of this element
 */
function unmountComponentElementChildren(element: Element) {
    if (element instanceof HTMLElement) {
        for (let i = 0; i < element.children.length; i++) {
            const child = element.children[i]
            unmountComponentElementChildren(child)
            const key = child.getAttribute(domKeyName)
            if (key) {
                const component = domReferences.get(key)
                if (component) {
                    // Unmount Component and release the Component's vtKey
                    component.unmount()
                    domReferences.delete(component.vtKey)
                }
            }
        }
    }
}

/**
 * If a render operation returns a Component as a result of
 * render then it needs to be wrapped in another HTMLElement for rendering to work properly
 * 
 * @param element The raw rendered element
 * @returns The original element or a wrapped element (or a hidden element if element is falsey)
 */
function wrapElementIfNeeded(element: RenderableElements): HTMLElement {
    // Check for falsey
    if (!element) {
        return h(divTag,displayNone) as HTMLDivElement
    }
    // If a Component returns a Component or RenderObject as a result of render
    // then it needs to be wrapped in another HTMLElement for rendering to work properly
    if (instanceOfBasicTypes(element) || (element instanceof Component) || (element instanceof Text) || Array.isArray(element) || element.hasAttribute(domKeyName)) {
        return h(divTag,displayContents,element) as HTMLDivElement
    }
    return element
}

/**
 * Render a Component into an HTMLElement
 */
function componentRender(component: Component<any>, attrs: Readonly<any>, children: RenderableElements[]) {
    const element: HTMLElement = wrapElementIfNeeded(component.render(attrs, children))
    element.setAttribute(domKeyName, component.vtKey)
    return element
}

/**
 * Sets attributes on an element
 * 
 * Resolves: eventListeners, style object, and processes boolean values
 * 
 * eventListeners support `<div onClick:{()=>{alert()}} />`
 * 
 * Boolean values are set as empty attributes when true and unset when false
 */
export function setAttrsOnElement(element: HTMLElement, attrs: Readonly<any>) {
    for (const [name, value] of Object.entries(attrs || {})) {
        if (name.startsWith('on') && name.toLowerCase() in window) {
            // Special handling for event listener attributes
            // Example attrs: {onClick: ()=>{}}
            element.addEventListener(name.toLowerCase().substring(2) as keyof HTMLElementEventMap, value as (this: HTMLElement, ev: Event | UIEvent | WheelEvent) => any)
        } else if (name == "style" && value instanceof Object) {
            // Special handling for style object
            for (const key of Object.keys(value)) {
                const keyValue = value[key]
                if (keyValue == null) {
                    element.style[key as any] = ""
                } else {
                    // Note: any is used here because "keyof typeof element.style" clashes with "length" and "parentRule" being readonly
                    element.style[key as any] = keyValue
                }
            }
        } else if (typeof value == "boolean") {
            // Boolean true gets set to empty string, boolean false does not get set
            if (value) {
                element.setAttribute(name, "")
            }
        } else if (value || value == "") {
            // Regular string-based attribute
            element.setAttribute(name, value.toString())
        }
    }
}

/**
 * Create an element with a tag, set it's attributes using attrs, then append children
 * 
 * ```tsx
 * <tag attrOne={} attrTwo={}>{children}</tag>
 * ```
 */
export function h(tag: Type<Component<any>> | FunctionComponent<any> | string, attrs: Readonly<any> | null, ...children: RenderableElements[]): RenderableElements {
    const notNullAttrs = attrs || {}
    if (typeof tag === 'string') {
        // Base HTML Element
        const element = document.createElement(tag)
        setAttrsOnElement(element, notNullAttrs)
        // Append children
        appendChild(element, children)
        return element
    } else if (tag.prototype instanceof Component) {
        const component = new (tag as Type<Component<any>>)(notNullAttrs, children)
        
        // Assign this Component's componentKey
        const componentKey = String(domNextKey)
        domNextKey++
        domReferences.set(componentKey, component)
        component.vtKey = componentKey

        component.element = componentRender(component, notNullAttrs, children)
        component.refresh = () => {
            component.element = replaceElement(component.element, componentRender(component, notNullAttrs, children))
        }
        return component.element
    } else if (typeof tag === 'function') {
        // Function Component
        return (tag as FunctionComponent<any>)(notNullAttrs, children)
    }

    // Fallback case
    console.error("Invalid tag", tag, notNullAttrs, children)
    return h("div",{style:"display:none;"})
}

/**
 * Short style tsx createElement
 * 
 * Create an element with a tag, set it's attributes using attrs, then append children
 * 
 * ```tsx
 * <tag attrOne={} attrTwo={}>{children}</tag>
 * ```
 */
export {h as createElement}

/**
 * Create a fragment `<></>` (which just propagates an array of `children[]`)
 */
function createFragment(_attrs: Readonly<any> | null, ...children: RenderableElements[]): RenderableElements[] {
    return children
}

/**
 * Short style tsx createFragment
 * 
 * Create a fragment `<></>` (which just propagates an array of `children[]`)
 */
export {createFragment as f}

/**
 * Get the js class object of a constructed Component
 * 
 * Usage:
 * 
 * ```tsx
 * class ComplexComponent extends Component<EmptyAttrs> {
 *     override render() {
 *         return <div>This is a complex Component</div>
 *     }
 *     someMethod() {
 *         console.log("ComplexComponent method called")
 *     }
 * }
 * 
 * //Somewhere else
 * const foo = getComponent(<ComplexComponent/>)
 * foo.someMethod()
 * 
 * //Can then be used in tsx directly:
 * return <div>{foo}</div>
 * ```
 */
export function getComponent<T>(componentElement: RenderableElements[] | HTMLElement | BasicTypes | null): T {
    if (!componentElement || componentElement instanceof Text || instanceOfBasicTypes(componentElement) || Array.isArray(componentElement)) {
        // Invalid case
        console.error("Invalid element", componentElement)
        return null as T
    }
    const component = domReferences.get(componentElement.getAttribute(domKeyName)||"")
    if (component) {
        return component as T
    } else {
        // Invalid case
        console.error("Invalid element", componentElement)
        return null as T
    }
}

/** Basic JSX types */
export declare namespace h {
    /** JSX namespace */
    export namespace JSX {
        /** JSX types for elements and their accepted attributes, in Micro just set to any */
        interface IntrinsicElements {
            /** Allow all attributes for all elements */
            [elementName: string]: any
        }
    }
}

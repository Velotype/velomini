/// <reference lib="deno.ns" />

import { afterAll, beforeAll, describe, it } from "jsr:@std/testing/bdd"
import { fail, assertEquals } from "jsr:@std/assert"

import {App} from "jsr:@velotype/veloserver"

import { launch } from "jsr:@astral/astral"
import type { Browser, ElementHandle, Page } from "jsr:@astral/astral"
import { startAppServer } from "./base_server.ts"

const server_port = 3000
const baseUrl = `http://localhost:${server_port}`


describe('basic component rendering', () => {
    let server: App
    let browser: Browser
    let page: Page

    beforeAll(async () => {
        server = await startAppServer(server_port)
        browser = await launch({
            headless: true,
            args: ['--no-sandbox']
        })
        page = await browser.newPage()
        await page.setViewportSize({ width: 400, height: 200 })
    })
    afterAll(async () => {
        await page?.close()
        await browser?.close()
        await server?.close('End basic tests')
    })

    const itWrap = (name: string, module: string, selector: string, testFn: (selection: ElementHandle) => void | Promise<void>) => {
        it({name,
            fn: async () => {
                try {
                    await page.goto(`${baseUrl}/${module}`, {waitUntil: 'networkidle2'})
                    const selection = await page.waitForSelector(selector)
                    if (selection) {
                        await testFn(selection)
                    } else {
                        fail(`ERROR: Selector not found: ${selector}`)
                    }
                } catch (e) {
                    console.log("Exception",e)
                    fail("ERROR: Thrown exception")
                }
            }
        })
    }
    type TestVariation = {
        selector: string
        text?: string
        html?: string
        attributes?: {
            name: string
            value: string
        }[]
    }
    const testVariations = async (setOfVariations: TestVariation[]) => {
        for (const variant of setOfVariations) {
            console.log("testing variant:", variant)
            const selection = await page.waitForSelector(variant.selector)
            if (selection) {
                if (variant.text) {
                    assertEquals(await selection.innerText(),variant.text)
                }
                if (variant.html) {
                    assertEquals(await selection.innerHTML(),variant.html)
                }
                if (variant.attributes) {
                    for (const attribute of variant.attributes) {
                        assertEquals(await selection.getAttribute(attribute.name),attribute.value)
                    }
                }
            } else {
                fail(`ERROR: Selector not found: #${variant}`)
            }
        }
    }

    itWrap("set of basic-div tests", "basic-div", "#hello-div", async (_pageLoadSelection: ElementHandle) => {
        let selection: ElementHandle
        selection = await page.waitForSelector("#boolean-attribute-default-true")
        assertEquals(await selection.getAttribute("disabled"),"")

        selection = await page.waitForSelector("#boolean-attribute-explicit-true")
        assertEquals(await selection.getAttribute("disabled"),"")

        selection = await page.waitForSelector("#boolean-attribute-explicit-false")
        assertEquals(await selection.getAttribute("disabled"),null)

        const setOfVariations = [
            {selector: "#hello-div", html: "Hello Velotype!"},

            {selector: "#style-string", attributes: [{name: "style", value: "display:flex;margin-top:4px;"}]},
            {selector: "#style-object", attributes: [{name: "style", value: "display: flex; margin-top: 4px;"}]},
        ]
        await testVariations(setOfVariations)
    })

    itWrap("set of return-type tests", "return-types", "#component-return-void", async (_pageLoadSelection: ElementHandle) => {
        const setOfVariations = [
            {selector: "#component-return-void div", attributes: [{name: "style", value: "display:none;"}]},
            {selector: "#component-return-null div", attributes: [{name: "style", value: "display:none;"}]},
            {selector: "#component-return-undefined div", attributes: [{name: "style", value: "display:none;"}]},

            {selector: "#component-return-text div", attributes: [{name: "style", value: "display:contents;"}], html: "test text"},

            {selector: "#component-return-boolean div", attributes: [{name: "style", value: "display:contents;"}], html: "true"},
            {selector: "#component-return-number div", attributes: [{name: "style", value: "display:contents;"}], html: "1"},
            {selector: "#component-return-string div", attributes: [{name: "style", value: "display:contents;"}], html: "test string"},
            {selector: "#component-return-bigint div", attributes: [{name: "style", value: "display:contents;"}], html: "1"},

            {selector: "#component-return-array div", attributes: [{name: "style", value: "display:contents;"}], html: "<div>1</div><span>2</span>3456false"},

            {selector: "#component-return-component div", attributes: [{name: "style", value: "display:contents;"}], text: "test string"},

            {selector: "#component-return-html-element div", attributes: [{name: "style", value: "display:inline-block;"}]},
        ]
        await testVariations(setOfVariations)
    })

    itWrap("set of attrs-types tests", "attrs-types", "#component-children-string", async (_pageLoadSelection: ElementHandle) => {
        const setOfVariations = [
            {selector: "#component-children-string div", text: "string"},
            {selector: "#component-children-number div", text: "1"},
            {selector: "#component-children-html span", text: "span"},

            {selector: "#component-only-children-string div", text: "string"},
            {selector: "#component-only-children-number div", text: "1"},
            {selector: "#component-only-children-html span", text: "span"},

            {selector: "#component-children-attr-string div", text: "string"},
            {selector: "#component-children-attr-number div", text: "1"},
            {selector: "#component-children-attr-html span", text: "span"},

            {selector: "#component-with-id", text: "1"},
            {selector: "#component-with-style-pass-through", attributes: [{name: "class", value: "component-class custom-class"},{name: "style", value: "margin-top: 5px;"}]},
            {selector: "#component-with-style-override-base", attributes: [{name: "class", value: "component-class custom-class"},{name: "style", value: "margin-top: 3px;"}]},
            {selector: "#component-with-style-override-custom", attributes: [{name: "class", value: "component-class custom-class"},{name: "style", value: "margin-top: 5px;"}]},
        ]
        await testVariations(setOfVariations)
    })

    itWrap("set of event-triggers tests", "event-triggers", "#div-toggle-one-layer-refresh", async (_pageLoadSelection: ElementHandle) => {
        const setOfVariations = ["div-toggle-one-layer-refresh", "div-toggle-two-layers-refresh", "div-toggle-same-layer-refresh",
            "div-toggle-one-layer-replace-child", "div-toggle-two-layers-replace-child", "div-toggle-same-layer-replace-child",
            "button-toggle-one-layer-refresh button", "button-toggle-two-layers-refresh button", "button-toggle-same-layer-refresh button",
            "button-toggle-one-layer-replace-child button", "button-toggle-two-layers-replace-child button", "button-toggle-same-layer-replace-child button"
        ]
        for (const variant of setOfVariations) {
            console.log("testing variant:", variant)
            let selection = await page.waitForSelector(`#${variant}`)
            if (selection) {
                assertEquals(await selection.innerText(),"Close")
                await selection.click()
                selection = await page.waitForSelector(`#${variant}`)
                assertEquals(await selection.innerText(),"Open")
                await selection.click()
                selection = await page.waitForSelector(`#${variant}`)
                assertEquals(await selection.innerText(),"Close")
            } else {
                fail(`ERROR: Selector not found: #${variant}`)
            }
        }
    })

})

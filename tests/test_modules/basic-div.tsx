// deno-lint-ignore-file jsx-boolean-value
import {replaceElement, Component} from "jsr:@velotype/velomini"
import type {EmptyAttrs} from "jsr:@velotype/velomini"

class BasicDivTest extends Component<EmptyAttrs> {
    override render() {
        return <div>
            <div id="hello-div">Hello Velotype!</div>
            <hr/>
            <div id="style-string" style="display:flex;margin-top:4px;">style string</div>
            <div id="style-object" style={{display:"flex", marginTop:"4px"}}>style object</div>
            <hr/>
            <button id="boolean-attribute-default-true" type="button" disabled>boolean attribute default true</button>
            <button id="boolean-attribute-explicit-true" type="button" disabled={true}>boolean attribute explicit true</button>
            <button id="boolean-attribute-explicit-false" type="button" disabled={false}>boolean attribute explicit false</button>
        </div>
    }
}

// Place on the page
replaceElement(document.getElementById("main-page"),<BasicDivTest/>)

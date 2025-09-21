import {replaceElement, Component} from "jsr:@velotype/velomini"
import type {EmptyAttrs} from "jsr:@velotype/velomini"

class ComponentReturnUndefined extends Component<EmptyAttrs> {
    override render() {
        return undefined
    }
}

class ComponentReturnVoid extends Component<EmptyAttrs> {
    override render() {
    }
}

class ComponentReturnNull extends Component<EmptyAttrs> {
    override render() {
        return null
    }
}

class ComponentReturnBoolean extends Component<EmptyAttrs> {
    override render() {
        return true
    }
}

class ComponentReturnNumber extends Component<EmptyAttrs> {
    override render() {
        return 1
    }
}

class ComponentReturnString extends Component<EmptyAttrs> {
    override render() {
        return "test string"
    }
}

class ComponentReturnBigint extends Component<EmptyAttrs> {
    override render() {
        return 1n
    }
}

class ComponentReturnText extends Component<EmptyAttrs> {
    override render() {
        return document.createTextNode("test text")
    }
}

class ComponentReturnArray extends Component<EmptyAttrs> {
    override render() {
        return [<div>1</div>,<span>2</span>,"3",4,[5],6n,false]
    }
}

class ComponentReturnComponent extends Component<EmptyAttrs> {
    override render() {
        return <ComponentReturnString/>
    }
}

class ComponentReturnHTMLElement extends Component<EmptyAttrs> {
    override render() {
        return <div style="display:inline-block;">html</div>
    }
}

class ReturnTypesTest extends Component<EmptyAttrs> {
    override render() {
        return <div>
            <div id="component-return-void"><ComponentReturnVoid/></div>
            <div id="component-return-undefined"><ComponentReturnUndefined/></div>
            <div id="component-return-null"><ComponentReturnNull/></div>
            <hr/>
            <div id="component-return-text"><ComponentReturnText/></div>
            <hr/>
            <div id="component-return-boolean"><ComponentReturnBoolean/></div>
            <div id="component-return-number"><ComponentReturnNumber/></div>
            <div id="component-return-string"><ComponentReturnString/></div>
            <div id="component-return-bigint"><ComponentReturnBigint/></div>
            <hr/>
            <div id="component-return-array"><ComponentReturnArray/></div>
            <hr/>
            <div id="component-return-component"><ComponentReturnComponent/></div>
            <hr/>
            <div id="component-return-html-element"><ComponentReturnHTMLElement/></div>
        </div>
    }
}

// Place on the page
replaceElement(document.getElementById("main-page"),<ReturnTypesTest/>)

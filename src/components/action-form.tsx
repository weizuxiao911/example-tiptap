import './action-form.css'
import { Node } from "@tiptap/pm/model"
import { Editor, NodeViewContent, NodeViewWrapper } from "@tiptap/react"
import { useEffect } from "react"

export type ActionProps = {
    editor: Editor,
    node: Node
    [key: string]: any
}

const ActionForm = (props: ActionProps) => {

    useEffect(() => {

    }, [props?.node])

    const setValue = (key: string, value: string) => {
        (props.node as any).attrs[key] = value
    }

    return <NodeViewWrapper>
        <div className="action-form">
            <div className='line'>
                <p>标题：<input defaultValue={props?.node?.attrs?.title} onChange={(e) => setValue('title', e?.target?.value)} /></p>
            </div>
            <div className='line'>
                <p>描述：<input defaultValue={props?.node?.attrs?.describe} onChange={(e) => setValue('describe', e?.target?.value)} /></p>
            </div>
            <pre>
                <NodeViewContent as="code" />
            </pre>
            <button onClick={() => {
                props?.editor?.chain().focus().setHardBreak().run()
            }}>运行</button>
        </div>
    </NodeViewWrapper>
}

export default ActionForm
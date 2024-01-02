import './style.scss'
import { EditorContent, useEditor } from "@tiptap/react"
import { editorProps, extensions } from "./config"

const json = {
    type: 'doc',
    content: [
        {
            type: 'action',
            attrs: {
                title: 'title',
                describe: 'describe'
            },
        }
    ]
}

export const Editor = () => {

    const editor = useEditor({
        extensions,
        editorProps,
        autofocus: true,
        content: ''
    })

    return <>
        <button onClick={() => { console.log(editor?.getJSON())}}>获取json数据</button>
        <button onClick={() => { console.log(editor?.getHTML()) }}>获取html数据</button>
        <EditorContent className="editor" editor={editor} />
    </>

}

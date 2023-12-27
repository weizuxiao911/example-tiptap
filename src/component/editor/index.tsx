import { BubbleMenu, EditorContent, useEditor } from "@tiptap/react"
import { editorProps } from "./props"
import { editorExtensions } from "./extensions"
import './index.css'

export const Editor = () => {

    const editor = useEditor({
        extensions: [...editorExtensions],
        editorProps: { ...editorProps },
        editable: true,
        autofocus: false,
        content: '',
    })

    return <> {editor && <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
        <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'is-active' : ''}
        >
            bold
        </button>
        <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'is-active' : ''}
        >
            italic
        </button>
        <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'is-active' : ''}
        >
            strike
        </button >
    </BubbleMenu >}
        <EditorContent editor={editor} />
    </>

}
import { EditorProps, EditorView } from "@tiptap/pm/view"
import { Slice } from "@tiptap/pm/model"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import SlashCommand from "../extensions/slash-command"
import DragAndDrop from "../extensions/drag-and-drop"
import CustomKeyboardShortcuts from "../extensions/keyboard-shortcuts"
import Action from "../extensions/action"

export const extensions = [
    StarterKit,
    Action,
    Placeholder.configure({
        placeholder: ({ node }: any) => {
            if (node.type.name === 'paragraph') {
                return `输入“/”可唤起工具面板...`
            }
            return ''
        },
    }),
    SlashCommand,
    DragAndDrop,
    CustomKeyboardShortcuts,
]

export const editorProps: EditorProps = {
    handlePaste: (view: EditorView, event: ClipboardEvent) => {
        if (
            event.clipboardData &&
            event.clipboardData.files &&
            event.clipboardData.files[0]
        ) {
            event.preventDefault();
            const file = event.clipboardData.files[0];
            const pos = view.state.selection.from;
            // startImageUpload(file, view, pos);
            return true;
        }
        console.log('paste')
        return false;
    },

    handleDrop: (view: EditorView, event: DragEvent, slice: Slice, moved: boolean) => {
        if (
            !moved &&
            event.dataTransfer &&
            event.dataTransfer.files &&
            event.dataTransfer.files[0]
        ) {
            event.preventDefault();
            const file = event.dataTransfer.files[0];
            const coordinates = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
            });
            // here we deduct 1 from the pos or else the image will create an extra node
            // startImageUpload(file, view, coordinates?.pos || 0 - 1);
            return true;
        }
        console.log('drop')
        return false;
    },
}
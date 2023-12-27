import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from '@tiptap/extension-placeholder'
import { SlashCommand } from "../../extensions/slash-command";
import BubbleMenu from "@tiptap/extension-bubble-menu";

export const editorExtensions = [
    StarterKit,
    Placeholder.configure({
        placeholder: ({ node }: any) => {
            if (node.type.name === 'heading') {
                return `H${node?.attrs?.level}...`
            }
            if (node.type.name === 'paragraph') {
                return `输入“/”唤起工具面板...`
            }
            return ''
        },
    }),
    BubbleMenu.configure({
        shouldShow: ({ editor, view, state, oldState, from, to }) => {
            // only show the bubble menu for images and links
            return editor.isActive('image') || editor.isActive('link')
        },
    }),
    SlashCommand,
]
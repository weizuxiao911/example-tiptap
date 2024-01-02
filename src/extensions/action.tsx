import { mergeAttributes, Node, textblockTypeInputRule } from '@tiptap/core'
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state'
import { PasteRule, ReactNodeViewRenderer } from "@tiptap/react"
import ActionForm from '../components/action-form'
import { EditorView } from '@tiptap/pm/view';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        action: {
            setAction: (attributes?: {
                title: string;
                describe: string;
                content: string
            }) => ReturnType;
        };
    }
}

export const backtickInputRegex = /^```action[\s\n]$/
export const tildeInputRegex = /^~~~action[\s\n]$/

const Action = Node.create({
    name: 'action',
    content: 'text*',
    group: 'block',
    code: true,
    /** json数据回显 */
    addAttributes() {
        return {
            title: {
                default: '',
            },
            describe: {
                default: ''
            },
        }
    },
    /** html数据回显 */
    parseHTML() {
        return [
            {
                tag: 'action',
                preserveWhitespace: 'full',
            },
        ]
    },
    /** editor.getHtml()需要 */
    renderHTML({ node, HTMLAttributes }) {
        return [
            'action',
            mergeAttributes(node.attrs, HTMLAttributes)
        ]
    },
    /** 加载react组件 */
    addNodeView() {
        return ReactNodeViewRenderer(ActionForm);
    },

    addCommands() {
        return {
            setAction:
                attributes => ({ commands }) => {
                    return commands.setNode(this.name, attributes)
                },
        }
    },

    addInputRules() {
        return [
            textblockTypeInputRule({
                find: backtickInputRegex,
                type: this.type,
                getAttributes: match => ({
                    language: match[1],
                }),
            }),
            textblockTypeInputRule({
                find: tildeInputRegex,
                type: this.type,
                getAttributes: match => ({
                    language: match[1],
                }),
            }),
        ]
    },

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('actionHandler'),
                props: {
                    handlePaste: (view, event) => {
                        if (!event.clipboardData) {
                            return false
                        }
                        if (this.editor.isActive(this.type.name)) {
                            return false
                        }
                        const text = event.clipboardData.getData('text/plain')
                        console.log(text)
                        const { tr } = view.state
                        tr.replaceSelectionWith(this.type.create({}))
                        tr.setMeta('paste', true)
                        view.dispatch(tr)
                        return true
                    }
                }
            })
        ]
    }
})

export default Action

import './slash-command.css'
import { Editor, Extension, Range } from "@tiptap/core"
import { ReactRenderer } from "@tiptap/react"
import Suggestion from "@tiptap/suggestion"
import { ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import tippy from "tippy.js"
import { Code, Heading1, Heading2, Heading3, Heading4, Heading5, List, ListOrdered, Text, TextQuote, } from "lucide-react"
import { Plugin } from '@tiptap/pm/state'
import { EditorView } from '@tiptap/pm/view'

/** 默认指令 */
const char = '/'

/** 示例菜单项 */
const menus = [
    {
        title: "标题 1",
        description: "",
        searchTerms: ["title", 'h1'],
        icon: <Heading1 size={18} />,
        command: ({ editor, range }: CommandProps) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .setNode("heading", { level: 1 })
                .run();
        },
    },
    {
        title: "标题 2",
        description: "",
        searchTerms: ["title", "h2"],
        icon: <Heading2 size={18} />,
        command: ({ editor, range }: CommandProps) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .setNode("heading", { level: 2 })
                .run();
        },
    },
    {
        title: "标题 3",
        description: "",
        searchTerms: ["title", "h3"],
        icon: <Heading3 size={18} />,
        command: ({ editor, range }: CommandProps) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .setNode("heading", { level: 3 })
                .run();
        },
    },
    {
        title: "标题 4",
        description: "",
        searchTerms: ["title", "h4"],
        icon: <Heading4 size={18} />,
        command: ({ editor, range }: CommandProps) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .setNode("heading", { level: 4 })
                .run();
        },
    },
    {
        title: "标题 5",
        description: "",
        searchTerms: ["title", "h5"],
        icon: <Heading5 size={18} />,
        command: ({ editor, range }: CommandProps) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .setNode("heading", { level: 5 })
                .run();
        },
    },
    {
        title: "段落文本",
        description: "",
        searchTerms: ["p", 'paragraph', 'text'],
        icon: <Text size={18} />,
        command: ({ editor, range }: CommandProps) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .toggleNode("paragraph", "paragraph")
                .run();
        },
    },
    {
        title: "无序列表",
        description: "",
        searchTerms: ["unordered", "point"],
        icon: <List size={18} />,
        command: ({ editor, range }: CommandProps) => {
            editor.chain().focus().deleteRange(range).toggleBulletList().run();
        },
    },
    {
        title: "有序列表",
        description: "",
        searchTerms: ["ordered"],
        icon: <ListOrdered size={18} />,
        command: ({ editor, range }: CommandProps) => {
            editor.chain().focus().deleteRange(range).toggleOrderedList().run();
        },
    },
    {
        title: "引用",
        description: "",
        searchTerms: ["blockquote"],
        icon: <TextQuote size={18} />,
        command: ({ editor, range }: CommandProps) =>
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .toggleNode("paragraph", "paragraph")
                .toggleBlockquote()
                .run(),
    },
    {
        title: "代码块",
        description: "",
        searchTerms: ["codeblock"],
        icon: <Code size={18} />,
        command: ({ editor, range }: CommandProps) =>
            editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
    },
]

/** 选中处理 */
const command = ({
    editor, range, props
}: { editor: Editor; range: Range; props: any }) => {
    props.command({ editor, range })
}

/** 加载组件 */
const render = () => {
    let component: ReactRenderer | null = null
    let popup: any | null = null

    /** 斜杠菜单 */
    const SlashCommandMenus = ({ items, command, editor, range }: {
        items: MenuItemProps[]; command: any; editor: any; range: any;
    }) => {
        const [selectedIndex, setSelectedIndex] = useState(0)

        const selectItem = useCallback(
            (index: number) => {
                const item = items[index]
                item && command(item)
            },
            [command, editor, items]
        )

        useEffect(() => {
            const keyCodes = ["ArrowUp", "ArrowDown", "Enter"]
            const onKeyDown = (e: KeyboardEvent) => {
                if (keyCodes.includes(e?.code)) {
                    e.preventDefault()
                    if (e.code === "ArrowUp") {
                        setSelectedIndex((selectedIndex + items?.length - 1) % items?.length ?? 1)
                        return true
                    }
                    if (e.code === "ArrowDown") {
                        setSelectedIndex((selectedIndex + 1) % items?.length ?? 1)
                        return true
                    }
                    if (e.code === "Enter") {
                        selectItem(selectedIndex)
                        return true
                    }
                    return false
                }
            }
            document.addEventListener("keydown", onKeyDown)
            return () => {
                document.removeEventListener('keydown', onKeyDown)
            }
        }, [selectedIndex, setSelectedIndex])

        useEffect(() => {
            setSelectedIndex(0)
        }, [items])

        const container = useRef<HTMLDivElement>(null)

        useLayoutEffect(() => {
            const _container = container?.current
            const item = _container?.children[selectedIndex] as HTMLElement
            item && _container && updateScrollView(_container!, item)
        }, [selectedIndex])

        return items?.length > 0 ? (
            <div id="slash-command" className="slash-command" ref={container}>
                {items?.map((item: MenuItemProps, index: number) => {
                    return <div key={index} className={`item ${index === selectedIndex ? 'active' : ''}`} onClick={() => { selectItem(index) }}>
                        <div className="icon">
                            {item.icon}
                        </div>
                        <div className="content">
                            <div className="title">{item.title}</div>
                            <div className="description">{item.description}</div>
                        </div>
                    </div>
                })}
            </div>
        ) : null
    }

    return {
        onStart: (props: { editor: Editor; clientRect: DOMRect }) => {
            component = new ReactRenderer(SlashCommandMenus, {
                props,
                editor: props.editor,
            });
            // @ts-ignore
            popup = tippy("body", {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
            })
        },
        onUpdate: (props: { editor: Editor; clientRect: DOMRect }) => {
            component?.updateProps(props);
            popup && popup[0].setProps({
                getReferenceClientRect: props.clientRect,
            });
        },
        onKeyDown: (props: { event: KeyboardEvent }) => {
            if (props.event.key === "Escape") {
                popup?.[0].hide();
                return true;
            }
            // @ts-ignore
            return component?.ref?.onKeyDown(props);
        },
        onExit: () => {
            popup?.[0].destroy()
            component?.destroy()
        }
    }
}

/** 属性 */
export interface CommandProps {
    editor: Editor;
    range: Range;
}

/** 菜单项 */
export type MenuItemProps = {
    title: string
    description: string
    icon: ReactNode,
    command: ({ editor, range }: CommandProps) => void
}

/** 滚动条处理 */
export const updateScrollView = (container: HTMLElement, item: HTMLElement) => {
    const containerHeight = container.offsetHeight;
    const itemHeight = item ? item.offsetHeight : 0;

    const top = item.offsetTop;
    const bottom = top + itemHeight;

    if (top < container.scrollTop) {
        container.scrollTop -= container.scrollTop - top + 5;
    } else if (bottom > containerHeight + container.scrollTop) {
        container.scrollTop += bottom - containerHeight - container.scrollTop + 5;
    }
}

/** 键盘事件 */
const KeyboardEvent = (): Plugin => {
    return new Plugin({
        props: {
            handleDOMEvents: {
                keydown: (view: EditorView, event: KeyboardEvent) => {
                    if (["ArrowUp", "ArrowDown", "Enter"].includes(event.key)) {
                        const slashCommand = document.querySelector("#slash-command");
                        if (slashCommand) {
                            return true;
                        }
                    }
                }
            },
        }
    })
}

/** 斜杠指令 */
const SlashCommand = Extension.create({
    // 组件名称
    name: 'SlashCommand',

    // 添加属性
    addOptions() {
        return {
            char,
            menus: [],
            command,
            render,
            items: ({ query, plan }: { query: string, plan: number }) => {
                return menus?.filter((item: any) => {
                    if (typeof query === "string" && query.length > 0) {
                        const search = query.toLowerCase();
                        return (
                            item.title.toLowerCase().includes(search) ||
                            item.description.toLowerCase().includes(search) ||
                            (item.searchTerms &&
                                item.searchTerms.some((term: string) => term.includes(search)))
                        );
                    }
                    return true;
                })
            }
        }
    },

    // 注册组件
    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options,
            }),
            KeyboardEvent()
        ]
    },
})

export default SlashCommand
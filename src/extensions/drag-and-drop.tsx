import './drag-and-drop.css'
import { NodeSelection, Plugin } from "@tiptap/pm/state"
import { Extension } from "@tiptap/core"
import { Editor } from "@tiptap/core"
// @ts-ignore
import { __serializeForClipboard, EditorView } from "@tiptap/pm/view"

const DragAndDropHnadle = (options: DragAndDropProps): Plugin => {

    const absoluteRect = (node: Element) => {
        const data = node.getBoundingClientRect();
        return {
            top: data.top,
            left: data.left,
            width: data.width,
        };
    }

    const nodeDOMAtCoords = (coords: { x: number; y: number }) => {
        return document
            .elementsFromPoint(coords.x, coords.y)
            .find(
                (elem: Element) =>
                    elem.parentElement?.matches?.(".ProseMirror") ||
                    elem.matches(
                        [
                            "li",
                            "p:not(:first-child)",
                            "pre",
                            "blockquote",
                            "h1, h2, h3, h4, h5, h6",
                        ].join(", ")
                    )
            );
    }

    const nodePosAtDOM = (node: Element, view: EditorView) => {
        const boundingRect = node.getBoundingClientRect();

        return view.posAtCoords({
            left: boundingRect.left + 1,
            top: boundingRect.top + 1,
        })?.inside;
    }

    const handleDragStart = (view: EditorView, event: DragEvent) => {
        view.focus();

        if (!event.dataTransfer) return;

        const node = nodeDOMAtCoords({
            x: event.clientX + options?.size,
            y: event.clientY,
        });

        if (!(node instanceof Element)) return;

        const nodePos = nodePosAtDOM(node, view);
        if (nodePos == null || nodePos < 0) return;

        view.dispatch(
            view.state.tr.setSelection(NodeSelection.create(view.state.doc, nodePos))
        );

        const slice = view.state.selection.content();
        const { dom, text } = __serializeForClipboard(view, slice);

        event.dataTransfer.clearData();
        event.dataTransfer.setData("text/html", dom.innerHTML);
        event.dataTransfer.setData("text/plain", text);
        event.dataTransfer.effectAllowed = "copyMove";

        event.dataTransfer.setDragImage(node, 0, 0);

        view.dragging = { slice, move: event.ctrlKey };
    }

    const handleClick = (view: EditorView, event: MouseEvent) => {
        view.focus();

        view.dom.classList.remove("dragging");

        const node = nodeDOMAtCoords({
            x: event.clientX + options.size,
            y: event.clientY,
        });

        if (!(node instanceof Element)) return;

        const nodePos = nodePosAtDOM(node, view);
        if (!nodePos) return;

        view.dispatch(
            view.state.tr.setSelection(NodeSelection.create(view.state.doc, nodePos))
        );
    }

    const hideDragHandle = () => {
        if (element) {
            element.classList.add("hidden");
        }
    }

    const showDragHandle = () => {
        if (element) {
            element.classList.remove("hidden");
        }
    }

    const mousemove = (view: EditorView, event: MouseEvent) => {
        if (!view.editable) {
            return;
        }

        const node = nodeDOMAtCoords({
            x: event.clientX + options.size,
            y: event.clientY,
        });

        if (!(node instanceof Element) || node.matches("ul, ol, code")) {
            hideDragHandle();
            return;
        }

        const compStyle = window.getComputedStyle(node);
        const lineHeight = parseInt(compStyle.lineHeight, 10);
        const paddingTop = parseInt(compStyle.paddingTop, 10);

        const rect = absoluteRect(node);

        rect.top -= 1
        // Li markers
        if (node.matches("ul:not([data-type=taskList]) li, ol li")) {
            rect.left -= options.size;
        }
        rect.width = options.size;

        if (!element) return;

        element.style.left = `${rect.left - rect.width}px`;
        element.style.top = `${rect.top}px`;
        showDragHandle();
    }

    const keydown = (view: EditorView, event: KeyboardEvent) => {
        hideDragHandle();
    }
    
    const mousewheel = () => {
        hideDragHandle();
    }
    
    const dragstart = (view: EditorView, event: DragEvent) => {
        view.dom.classList.add("dragging");
    }
    
    const drop = (view: EditorView, event: DragEvent) => {
        view.dom.classList.remove("dragging");
    }
    
    const dragend = (view: EditorView, event: DragEvent) => {
        view.dom.classList.remove("dragging");
    }

    const destroy = () => {
        element?.remove?.();
        element = null;
    }

    let element: HTMLElement | null = null;

    return new Plugin({
        view: (view: EditorView) => {
            element = document.createElement("div")
            element.draggable = true
            element.dataset.dragHandle = ""
            element.classList.add("drag-handle")
            element.addEventListener("dragstart", (e: DragEvent) => {
                handleDragStart(view, e)
            })
            element.addEventListener('click', (e: MouseEvent) => {
                handleClick(view, e);
            })
            hideDragHandle()
            view?.dom?.parentElement?.appendChild(element)
            return {
                destroy
            }
        },
        props: {
            handleDOMEvents: {
                mousemove,
                keydown,
                mousewheel,
                dragstart,
                drop,
                dragend,
            },
        }
    })
}

export type DragAndDropProps = {
    editor: Editor,
    size: number
}

/** 拖拽组件 */
const DragAndDrop = Extension.create({
    // 组件名称
    name: 'DragAndDrop',

    // 定义属性
    addOptions() {
        return {
            size: 24
        }
    },

    // 注册组件
    addProseMirrorPlugins() {
        return [
            DragAndDropHnadle({
                editor: this.editor,
                ...this.options
            })
        ]
    },
})

export default DragAndDrop
import type {Fragment, Node as ProseMirrorNode, Slice} from '@tiptap/pm/model'

// Plain text for the clipboard. ProseMirror's default puts blank lines between every block and
// drops list markers, so a copied bullet list would lose its structure outside the editor.
export function serializeSliceAsText(slice: Slice): string {
	return blocksToText(slice.content).trim()
}

function blocksToText(fragment: Fragment): string {
	const blocks: string[] = []
	fragment.forEach(node => {
		blocks.push(blockToText(node))
	})
	return blocks.join('\n\n')
}

function blockToText(node: ProseMirrorNode): string {
	if (node.type.name === 'bulletList' || node.type.name === 'orderedList' || node.type.name === 'taskList') {
		return listToText(node)
	}

	if (node.isTextblock) {
		return node.textContent
	}

	if (node.isLeaf) {
		return node.textContent
	}

	return blocksToText(node.content)
}

function listToText(list: ProseMirrorNode): string {
	const items: string[] = []
	let index = 1
	list.forEach(item => {
		let marker = '- '
		if (list.type.name === 'orderedList') {
			marker = `${index}. `
		} else if (list.type.name === 'taskList') {
			marker = item.attrs.checked ? '- [x] ' : '- [ ] '
		}
		index++

		const body = blocksToText(item.content)
			.split('\n')
			.map((line, lineIndex) => lineIndex === 0 ? line : `  ${line}`)
			.join('\n')
		items.push(marker + body)
	})
	return items.join('\n')
}

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Undo, Redo } from 'lucide-react';
import { Button } from '@/components/ui/button';
export function RichEditor({value,onChange}:{value:string;onChange:(value:string)=>void}){
 const editor=useEditor({extensions:[StarterKit],content:value,immediatelyRender:false,onUpdate:({editor})=>onChange(editor.getHTML())});
 if(!editor)return <div className="min-h-40 rounded-md border bg-muted"/>;
 const tools=[{icon:Bold,label:'عريض',run:()=>editor.chain().focus().toggleBold().run()},{icon:Italic,label:'مائل',run:()=>editor.chain().focus().toggleItalic().run()},{icon:List,label:'قائمة نقطية',run:()=>editor.chain().focus().toggleBulletList().run()},{icon:ListOrdered,label:'قائمة مرقمة',run:()=>editor.chain().focus().toggleOrderedList().run()},{icon:Undo,label:'تراجع',run:()=>editor.chain().focus().undo().run()},{icon:Redo,label:'إعادة',run:()=>editor.chain().focus().redo().run()}];
 return <div className="overflow-hidden rounded-md border bg-card"><div className="flex flex-wrap gap-1 border-b p-2">{tools.map(t=><Button key={t.label} type="button" size="icon" variant="ghost" title={t.label} aria-label={t.label} onClick={t.run}><t.icon/></Button>)}</div><EditorContent editor={editor} className="admin-editor"/></div>;
}
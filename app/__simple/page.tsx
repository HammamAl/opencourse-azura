"use client";

import { useState } from "react";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";

export default function CreatePostPage() {
  const [title, setTitle] = useState("");

  const handleSave = async (content: string) => {
    const response = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content, // This is JSON string
      }),
    });

    if (response.ok) {
      alert("Saved!");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <input
        type="text"
        placeholder="Title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-2xl mb-4 p-2 border rounded"
      />
      
      <SimpleEditor
        // onSave={handleSave}
        placeholder="Start writing..."
      />
    </div>
  );
}

// // 2. Edit existing content
// export default function EditPostPage({ params }: { params: { id: string } }) {
//   const [post, setPost] = useState(null)

//   useEffect(() => {
//     fetch(`/api/posts/${params.id}`)
//       .then(res => res.json())
//       .then(setPost)
//   }, [params.id])

//   const handleSave = async (content: string) => {
//     await fetch(`/api/posts/${params.id}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ content }),
//     })
//   }

//   if (!post) return <div>Loading...</div>

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       <h1>{post.title}</h1>
//       <SimpleEditor
//         initialContent={post.content} // JSON string from DB
//         onSave={handleSave}
//       />
//     </div>
//   )
// }

// // 3. Read-only view
// export default function ViewPostPage({ params }: { params: { id: string } }) {
//   const [post, setPost] = useState(null)

//   useEffect(() => {
//     fetch(`/api/posts/${params.id}`)
//       .then(res => res.json())
//       .then(setPost)
//   }, [params.id])

//   if (!post) return <div>Loading...</div>

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       <h1>{post.title}</h1>
//       <SimpleEditor
//         initialContent={post.content}
//         readOnly={true}
//       />
//     </div>
//   )
// }

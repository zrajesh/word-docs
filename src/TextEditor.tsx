import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { io } from "socket.io-client";

import Quill from "quill";
import "quill/dist/quill.snow.css";

const TOOLBAR_OPTIONS = [
    ['bold', 'italic', 'underline', 'strike'],     
    ['image', 'blockquote', 'code-block'],
      
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],  
    [{ 'direction': 'rtl' }], 

    [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

    [{ 'color': [] }, { 'background': [] }], 
    [{ 'font': [] }],
    [{ 'align': [] }],

    ['clean']
];

const TextEditor = () => {
    const params = useParams();
    const { id: documentId } = params;

    const [socket, setSocket] = useState<any>();
    const [quill, setQuill] = useState<Quill>();

    useEffect(() => {
        const soc = io("http://localhost:3001");        
        setSocket(soc);

        return () => {
            soc.disconnect();
        }
    }, []);

    useEffect(() => {
        if (socket == null || quill == null) return;

        quill?.on("text-change", (delta, oldDelta, source) => {
            if (source !== 'user') return;
            socket?.emit("send-changes", delta)
        })
        return () => {
            quill?.off("text-change", (delta, oldDelta, source) => {
                if (source !== 'user') return;
                socket?.emit("send-changes", delta)
            })
        }
    }, [socket, quill]);

    useEffect(() => {
        if (socket == null || quill == null) return;

        socket.once("load-document", (document: any) => {
            quill.setContents(document);
            quill.enable();
        });
        socket.emit("get-document", documentId);
    }, [socket, quill, documentId]);

    useEffect(() => {
        if (socket == null || quill == null) return;

        socket.on("receive-changes", (delta: any) => {
            quill.updateContents(delta);
        })
        return () => {
            socket.off("receive-changes", (delta: any) => {
                quill.updateContents(delta);
            })
        }
    }, [socket, quill]);

    const editorRef = useCallback((editorContainer: HTMLDivElement) => {
        if (editorContainer === null) return;
        editorContainer.innerHTML = "";
        const editor = document.createElement("div");
        editorContainer.append(editor);
        const ql = new Quill(editor, { 
            theme: "snow",
            modules: { toolbar: TOOLBAR_OPTIONS }
        });
        ql.disable();
        ql.setText("Loading...")
        setQuill(ql);
    }, []);
    return (
        <div id="quillEditor" ref={editorRef}></div>
    );
};

export default TextEditor;
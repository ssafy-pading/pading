import { useState, useRef, useEffect } from 'react';
import Editor from "@monaco-editor/react";
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { MonacoBinding } from 'y-monaco';


// Yjs와 WebRTC 연결 설정
const ydoc = new Y.Doc();
const provider = new WebrtcProvider('monaco-room', ydoc);
const type = ydoc.getText('monaco');


function IdeEditor() {
    const editorRef = useRef(null);
    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
    
        // Yjs와 Monaco 연결
        const doc = new Y.Doc();
        const provider = new WebrtcProvider("test-room", doc);
        const type = doc.getText("monaco");
        const binding = new MonacoBinding(type, editorRef.current.getModel(), new Set([editorRef.current]), provider.awareness);
        console.log(provider.awareness);
      };
    return (
        <div>
            <Editor
            height="90vh"
            width="100%"
            theme={"vs-dark"}
            onMount={handleEditorDidMount} // Editor 초기화
          />
        </div>
    )
}

export default IdeEditor
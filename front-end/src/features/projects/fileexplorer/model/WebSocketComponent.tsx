import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from 'react-router-dom';
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { FileNode, FileType } from "../type/directoryTypes";
import Folder from "../widgets/Folder";

interface TreeNode {
  id: number;
  name: string;
  type: string;
  children: TreeNode[];
  parent: string;
}

const WebSocketComponent: React.FC = () => {
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [treeData, setTreeData] = useState<FileNode | null>(null);
  const nodesMapRef = useRef(new Map<number, TreeNode>());
  const clientRef = useRef<Client | null>(null);

  const [inputPath, setInputPath] = useState("");

  const { groupId } = useParams();
  const { projectId } = useParams();
  const url = "https://api-dev.pair-coding.site";
  const access = localStorage.getItem("accessToken");

  const idCounter = useRef(1);
  const generateUniqueId = () => {
    idCounter.current += 1;
    return idCounter.current;
  };

  const buildTreeFromMap = useCallback((): FileNode | null => {
    const map = nodesMapRef.current;
    const rootNode = map.get(1);
    if (!rootNode) return null;
    const buildNode = (node: TreeNode): FileNode => ({
      id: node.id,
      name: node.name,
      type: node.type as FileType,
      parent: node.parent,
      children: node.children.map((child) => {
        const childNode = map.get(child.id);
        if (!childNode) throw new Error(`Child node not found: ${child.id}`);
        return buildNode(childNode);
      }),
    });
    return buildNode(rootNode);
  }, []);

  const getNodeByPath = useCallback((path: string): TreeNode | undefined => {
    const nodes = Array.from(nodesMapRef.current.values());
    return nodes.find((node) => {
      if (node.name === "/" && path === "/") return true;
      if ((node.parent === "" || node.parent === "/") && path === `/${node.name}`)
        return true;
      return path === `${node.parent}/${node.name}`;
    });
  }, []);

  const updateNodesMapWithList = useCallback(
    (data: {
      action: string;
      path: string;
      children: { type: string; name: string }[];
    }) => {
      console.log("Updating nodes map with data:", data);
      const parentPath = data.path.startsWith("/") ? data.path : `/${data.path}`;
      const parentNode = getNodeByPath(parentPath);
      if (!parentNode) {
        console.error("Parent node not found for path:", data.path);
        return;
      }
      parentNode.children.forEach((child) => {
        nodesMapRef.current.delete(child.id);
      });
      parentNode.children = data.children.map((child) => {
        const newNode: TreeNode = {
          id: generateUniqueId(),
          name: child.name,
          type: child.type,
          children: [],
          parent: data.path,
        };
        nodesMapRef.current.set(newNode.id, newNode);
        return newNode;
      });
      console.log("Updated nodes map:", Array.from(nodesMapRef.current.entries()));
      setTreeData(buildTreeFromMap());
    },
    [buildTreeFromMap, getNodeByPath]
  );

  const sendActionRequest = useCallback(
    (action: "LIST" | "CREATE" | "DELETE" | "RENAME", payload: any) => {
      if (!clientRef.current || !clientRef.current.connected) {
        console.error("STOMP client is not connected");
        return;
      }
      const destination = `/pub/groups/${groupId}/projects/${projectId}/directory/${action.toLowerCase()}`;
      console.log("Sending request:", { destination, action, payload });
      clientRef.current.publish({
        destination,
        headers: { Authorization: `Bearer ${access}` },
        body: JSON.stringify({ action, ...payload }),
      });
    },
    [groupId, projectId, access]
  );

  useEffect(() => {
    const initialNode: TreeNode = {
      id: 1,
      name: "/",
      type: "DIRECTORY",
      children: [],
      parent: "",
    };
    nodesMapRef.current.set(1, initialNode);
    setTreeData(buildTreeFromMap());
  }, [buildTreeFromMap]);

  const initialWebSocket = useCallback(() => {
    const socket = new SockJS(`${url}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: {
        Authorization: `Bearer ${access}`,
      },
      onConnect: () => {
        console.log("WebSocket connected");
        clientRef.current = client;
        setStompClient(client);
        const topic = `/sub/groups/${groupId}/projects/${projectId}/directory`;
        client.subscribe(topic, (message) => {
          try {
            const data = JSON.parse(message.body);
            console.log("Received message:", data);
            if (data.action === "LIST") {
              updateNodesMapWithList(data);
            }
          } catch (error) {
            console.error("Message parsing error:", error);
          }
        });
        setTimeout(() => {
          sendActionRequest("LIST", { path: "/" });
        }, 500);
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"]);
      },
      onWebSocketClose: () => {
        console.warn("WebSocket connection closed");
        clientRef.current = null;
      },
    });
    client.activate();
  }, [groupId, projectId, access, sendActionRequest, updateNodesMapWithList]);

  const handleNodeSelect = useCallback((nodeId: number) => {
    setSelectedId(nodeId);
  }, []);

  useEffect(()=>{
    initialWebSocket();
    return ()=>{
      clientRef.current?.deactivate();
    }
  }, [])

  const handleRefresh = () => {
    initialWebSocket();
  };

  const checkDuplicateName = useCallback((path: string, newName: string): boolean => {
    const parentNode = getNodeByPath(path);
    if (!parentNode) return false;
  
    return parentNode.children.some(child => child.name === newName);
  }, [getNodeByPath]);

  return (
    <div>
      <div>
        {/* <button onClick={handleRefresh}>새로고침</button> 새로고침 후 3번째 depth 부터 데이터 렌더링이 안 됨*/}
      </div>
      {treeData ? (
        <Folder
          explorerData={treeData}
          selectedId={selectedId}
          sendActionRequest={sendActionRequest}
          handleNodeSelect={handleNodeSelect}
          checkDuplicateName={checkDuplicateName}
        />
      ) : (
        <div>Loading directory data...</div>
      )}
    </div>
  );
};

export default WebSocketComponent;

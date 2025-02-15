import React, { useEffect, useState, ChangeEvent, FormEvent, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import paperPlane from '/src/assets/paper-plane 1.svg';
import profileImage from "../../../../../assets/profile_image.png";
import { getChatMessages } from '../../../../../shared/apis/chatApi';
// import { useUser } from '../context/userContext';

// redux 초기 import 
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserInfo } from '../../../../../app/redux/user';
import type { RootState, AppDispatch } from '../../../../../app/redux/store';


interface ChatMessage {
  id: string;
  userId: number;
  username: string;
  content: string;
  createdAt: string;
}

interface ChatRoom {
  isChatOpen: boolean;
  onOpenStateChange: (state: boolean) => void;
}

const ChatRoom: React.FC<ChatRoom> = ({ isChatOpen, onOpenStateChange }) => {
  const [chatList, setChatList] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState<string>('');
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const stompClientRef = useRef<Client | null>(null);

  const extractParams = (): {  groupId: number; projectId: number; } | null => {
    const path = window.location.pathname; // e.g., "/project/8/1"
    const match = path.match(/\/project\/(\d+)\/(\d+)/);

    if (match) {
      const groupId = parseInt(match[1], 10);
      const projectId = parseInt(match[2], 10);
      return { groupId, projectId };
    }

    return null;
  };

  const params = extractParams();

  // redux dispatch, 유저 객체 사용
  const dispatch = useDispatch<AppDispatch>();
  const { user, status } = useSelector((state: RootState) => state.user);


  // 스크롤을 맨 아래로 이동시키는 함수
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };
  

  // 유저 정보 확인
  useEffect(() => {
    if (!user && status === 'idle') {
      dispatch(fetchUserInfo()); // 유저 정보가 없으면 fetchUserInfo 호출
    }
  }, [dispatch, user, status]);


  // STOMP 클라이언트 연결 설정 (컴포넌트 마운트 시 실행)
  useEffect(() => {
    const socket = new SockJS(`${import.meta.env.VITE_APP_API_BASE_URL}/ws`);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      // debug: (str) => {
      //   console.log(str);
      // },
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      reconnectDelay: 5000,
      onConnect: async () => {
        stompClient.subscribe(`/sub/chat/${params?.projectId}`, (messageData) => {
          const newChat: ChatMessage = JSON.parse(messageData.body);
          setChatList((prev) => {
            const updated = [...prev, newChat];
            return updated.sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          });
        });

        try {
          if(params){
            const messageList = await getChatMessages(params?.groupId, params?.projectId);
            const sorted = messageList.sort(
              (a, b) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            setChatList(sorted);
          }
        } catch (error) {
          console.error('Error loading previous messages:', error);
        }
      },
      onStompError: (frame) => {
        console.error('STOMP 에러', frame);
      },
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      stompClient.deactivate();
    };
  }, []);


  // chatList 변경 시 스크롤 이동
  useEffect(() => {
    scrollToBottom();
  }, [chatList]);


  // 채팅 전송 함수
  const handleSendChat = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!message.trim()) return;

    const myNewChat = {
      userId: user?.id,
      username: user?.name,
      content: message,
    };

    stompClientRef.current?.publish({
      destination: `/pub/chat/${params?.projectId}`,
      body: JSON.stringify(myNewChat),
    });

    setMessage('');
  };

  const handleMessageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setMessage(e.target.value);
  };

  const toggleState = () => {
    onOpenStateChange(!isChatOpen);
  };

  return (
    <div className="flex flex-col h-full bg-[#212426] text-white">
      <div className={`${isChatOpen ? '': 'hidden'} h-[30px] bg-[#2F3336] flex items-center justify-between font-bold text-white text-xs px-4`}>
        Chat
        {isChatOpen ? <button onClick={toggleState}>▼</button> : null}
      </div>
      {/* 메시지 목록 영역 */}
      <div
        className={`${isChatOpen ? '': 'hidden'} flex-1 overflow-y-auto p-1 flex flex-col space-y-4`}
        ref={chatContainerRef}
      >
        {chatList.map((chat) => {
          const isMe = chat.userId === user?.id;
          return (
            <div
              key={chat.id}
              className={`flex items-start w-full ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              {!isMe && (
                <img src={profileImage} className="w-5 h-5 rounded-full mr-2 " alt="profile" />
              )}
              <div
                className={`max-w-[10vw] px-3 py-[0.3rem] rounded-lg ${
                  isMe ? 'bg-[#3B82F6] ml-5' : 'bg-[#273654] mr-5'
                } text-white`}
              >
                <div className="w-full break-all whitespace-pre-wrap text-xs">
                  {chat.content}
                </div>
              </div>
              {isMe && (
                <img src={profileImage} className="w-5 h-5 rounded-full ml-2" alt="profile" />
              )}
            </div>
          );
        })}
      </div>

      {/* 채팅 입력창 + 전송 버튼 */}
      <div className="w-full h-[50px] bg-[#26292B]">
        <form onSubmit={isChatOpen ? handleSendChat : (e) => { e.preventDefault(); toggleState(); }} className="flex w-full justify-between px-1.5 py-2">
          <div className={`${isChatOpen ? '': 'hidden'} mx-1`}>
            <input
              type="text"
              name="message"
              value={message}
              onChange={handleMessageChange}
              placeholder="메시지 입력"
              className="flex-1 w-[22vh] rounded-lg px-2 py-1 text-sm text-white bg-[#273654] focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
            />
          </div>
          <div className={`${isChatOpen ? 'hidden': ''} font-bold text-white text-md pl-1.5`}>Chat</div>
          <div className="ml-1">
            <button
              type="submit"
              className="bg-[#3B82F6] hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              <img src={paperPlane} alt="send" className="w-[16px] h-[16px]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;

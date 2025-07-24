import React, { useEffect } from 'react';
import PersonalizedChatPage from './PersonalizedChatPage';

const FreeChatRedirectPage: React.FC = () => {
  useEffect(() => {
    // 更新页面标题
    document.title = '个性化对话 - 神仙朋友';
    
    // 可以在这里添加一些重定向逻辑或提示
    console.log('free-chat页面已重定向到个性化对话');
  }, []);

  return (
    <div>
      <PersonalizedChatPage />
    </div>
  );
};

export default FreeChatRedirectPage; 
import PersonalizedChatPage from './PersonalizedChatPage';

const FreeChatRedirectPage: React.FC = () => {
  useEffect(() => {
    // 更新页面标题
    document.title = '个性化对话 - 神仙朋友';
    
    // 可以在这里添加一些重定向逻辑或提示
    console.log('free-chat页面已重定向到个性化对话');
  }, []);

  return (
    <div>
      <PersonalizedChatPage />
    </div>
  );
};

export default FreeChatRedirectPage; 
import 'react';

type ChatCardProps = {
    chat: string
    sender: string
};

const ChatCard = (props: ChatCardProps) => {
    const { chat, sender } = props;
    return (
        <div className='cell bg-gray-800 p-2 m-1 rounded-md hover:bg-gray-500'>
            {sender}:
            {chat}
        </div>
    );
}

export default ChatCard;


/// <reference path="jquery.chatjs.adapter.servertypes.ts"/>

// Documentation: http://www.chatjs.net/Docs/AboutTheAdapters.html
// represents the communication channel between ChatJS and the server
interface IAdapter {
    // called when the adapter is initialized
    init: (done:() => void) => void;

    // functions called by the server, to contact the client
    client: IClientAdapter;

    // functions called by the client, to contact the server
    server: IServerAdapter;
}

// functions called by the server, to contact the client
interface IClientAdapter {

    // adds a handler to the messagesChanged event
    onMessagesChanged(handler:(message:ChatMessageInfo) => void): void;

    // adds a handler to the typingSignalReceived event
    onTypingSignalReceived(handler:(typingSignal:ChatTypingSignalInfo) => void): void;

    // adds a handler to the userListChanged event
    onUserListChanged(handler:(userListData:ChatUserListChangedInfo) => void): void;

    // triggers a messagesChanged event
    // all event handlers must be called
    triggerMessagesChanged(message:ChatMessageInfo): void;

    // triggers a typingSignalReceived event
    // all event handlers must be called
    triggerTypingSignalReceived(typingSignal:ChatTypingSignalInfo): void;

    // triggers a userListChanged event
    // all event handlers must be called
    triggerUserListChanged(userListData:ChatUserListChangedInfo): void;
}

// functions called by the client, to contact the server
interface IServerAdapter {

    // sends a message to a room, conversation or user
    sendMessage(roomId:number, conversationId:number, otherUserId:number, messageText:string, clientGuid:string, done:() => void): void;

    // sends a typing signal to a room, conversation or user
    sendTypingSignal(roomId:number, conversationId:number, userToId:number, done:() => void): void;

    // gets the message history from a room, conversation or user
    getMessageHistory(roomId:number, conversationId:number, otherUserId:number, done:(messages:Array<ChatMessageInfo>) => void): void;

    // gets the given user info
    getUserInfo(userId:number, done:(userInfo:ChatUserInfo) => void): void;

    // gets the user list in a room or conversation
    getUserList(roomId:number, conversationId:number, done:(userList:Array<ChatUserInfo>) => void): void;

    // enters the given room
    enterRoom(roomId:number, done:() => void): void;

    // leaves the given room
    leaveRoom(roomId:number, done:() => void): void;
}




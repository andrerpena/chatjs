/// <reference path="jquery.chatjs.adapter.ts" />

class DemoAdapterConstants {
    // Id of the current user (you)
    public static CURRENT_USER_ID: number = 1;
    // Id of the other user (Echobot)
    public static ECHOBOT_USER_ID:number = 2;
    // Id of the default room
    public static DEFAULT_ROOM_ID:number = 1;
    // time until Echobot starts typing
    public static ECHOBOT_TYPING_DELAY = 1000;
    // time until Echobot sends the message back
    public static ECHOBOT_REPLY_DELAY = 3000;
}

class DemoClientAdapter implements IClientAdapter {
    constructor(){
        this.messagesChangedHandlers = [];
        this.typingSignalReceivedHandlers = [];
        this.userListChangedHandlers = [];
    }

    // adds a handler to the messagesChanged event
    onMessagesChanged(handler: (message: ChatMessageInfo) => void): void {
        this.messagesChangedHandlers.push(handler);
    }

    // adds a handler to the typingSignalReceived event
    onTypingSignalReceived(handler: (typingSignal: ChatTypingSignalInfo) => void): void {
        this.typingSignalReceivedHandlers.push(handler);
    }

    // adds a handler to the userListChanged event
    onUserListChanged(handler: (userListData: ChatUserListChangedInfo) => void): void {
        this.userListChangedHandlers.push(handler);
    }

    triggerMessagesChanged(message:ChatMessageInfo):void {
        for (var i = 0; i < this.messagesChangedHandlers.length; i++)
            this.messagesChangedHandlers[i](message);
    }

    triggerTypingSignalReceived(typingSignal:ChatTypingSignalInfo):void {
        for (var i = 0; i < this.typingSignalReceivedHandlers.length; i++)
            this.typingSignalReceivedHandlers[i](typingSignal);
    }

    triggerUserListChanged(userListChangedInfo:ChatUserListChangedInfo):void {
        for (var i = 0; i < this.userListChangedHandlers.length; i++)
            this.userListChangedHandlers[i](userListChangedInfo);
    }

    // event handlers
    messagesChangedHandlers: Array<(message: ChatMessageInfo) => void>;
    typingSignalReceivedHandlers: Array<(typingSignal: ChatTypingSignalInfo) => void>;
    userListChangedHandlers: Array<(userListData: ChatUserListChangedInfo) => void>;
}

class DemoServerAdapter implements IServerAdapter {
    constructor(clientAdapter: IClientAdapter) {

        this.clientAdapter = clientAdapter;

        // configuring users
        var myUser = new ChatUserInfo();
        myUser.Id = DemoAdapterConstants.CURRENT_USER_ID;
        myUser.RoomId = DemoAdapterConstants.DEFAULT_ROOM_ID;
        myUser.Name = "André Pena"
        myUser.Email = "andrerpena@gmail.com";
        myUser.ProfilePictureUrl = "http://www.gravatar.com/avatar/574700aef74b21d386ba1250b77d20c6.jpg";
        myUser.Status = UserStatusType.Online;

        // Echobot is the guy that will repeat everything you say
        var echoBotUser = new ChatUserInfo();
        echoBotUser.Id = DemoAdapterConstants.ECHOBOT_USER_ID;
        echoBotUser.RoomId = DemoAdapterConstants.DEFAULT_ROOM_ID;
        echoBotUser.Name = "Echobot";
        echoBotUser.Email = "echobot1984@gmail.com";
        echoBotUser.ProfilePictureUrl = "http://www.gravatar.com/avatar/4ec6b20c5fed48b6b01e88161c0a3e20.jpg";
        echoBotUser.Status = UserStatusType.Online;

        // adds the users in the global user list
        this.users = new Array<ChatUserInfo>();
        this.users.push(myUser);
        this.users.push(echoBotUser);

        // configuring rooms
        var defaultRoom = new ChatRoomInfo();
        defaultRoom.Id = 1;
        defaultRoom.Name = "Default Room";
        defaultRoom.UsersOnline = this.users.length;

        this.rooms = new Array<ChatRoomInfo>();
        this.rooms.push(defaultRoom);

        // configuring client to return every event to me
        this.clientAdapter.onMessagesChanged( (message:ChatMessageInfo) => function(){

        });
    }

    sendMessage(roomId:number, conversationId:number, otherUserId:number, messageText:string, clientGuid:string, done:() => void):void {
        console.log("DemoServerAdapter: sendMessage");

        // we have to send the current message to the current user first
        // in chatjs, when you send a message to someone, the same message bounces back to the user
        // just so that all browser windows are synchronized
        var bounceMessage = new ChatMessageInfo();
        bounceMessage.UserFromId = DemoAdapterConstants.CURRENT_USER_ID; // It will from our user
        bounceMessage.UserToId = DemoAdapterConstants.ECHOBOT_USER_ID; // ... to the Echobot
        bounceMessage.RoomId = roomId;
        bounceMessage.ConversationId = conversationId;
        bounceMessage.Message = messageText;
        bounceMessage.ClientGuid = clientGuid;

        setTimeout(() => {
            this.clientAdapter.triggerMessagesChanged(bounceMessage);
        }, 300);


        // now let's send a message as if it was from the Echobot
        setTimeout(() => {

            this.getUserInfo(otherUserId, (echobotUserInfo) => {

                var typingSignal = new ChatTypingSignalInfo();
                typingSignal.ConversationId = conversationId;
                typingSignal.RoomId = roomId;
                typingSignal.UserFrom = echobotUserInfo;


                // if it's not a private message, the echo message will be to the current user
                if(!roomId && !conversationId)
                    typingSignal.UserToId = DemoAdapterConstants.CURRENT_USER_ID;

                this.clientAdapter.triggerTypingSignalReceived(typingSignal);

                setTimeout(() => {

                    // if otherUserId is not null, this is a private message
                    // if roomId is not null, this is a message to a room
                    // if conversationId is not null, this is a message to a conversation (group of people talking as if it was a room)

                    var echoMessage =  new ChatMessageInfo();
                    echoMessage.UserFromId = DemoAdapterConstants.ECHOBOT_USER_ID; // It will be from Echobot
                    echoMessage.RoomId = roomId;
                    echoMessage.ConversationId = conversationId;
                    echoMessage.Message = "You said: " +  messageText;

                    // if it's not a private message, the echo message will be to the current user
                    if(!roomId && !conversationId)
                        echoMessage.UserToId = DemoAdapterConstants.CURRENT_USER_ID;

                    // this will send a message to the user 1 (you) as if it was from user 2 (Echobot)
                    this.clientAdapter.triggerMessagesChanged(echoMessage);

                }, DemoAdapterConstants.ECHOBOT_REPLY_DELAY);


            });

        }, DemoAdapterConstants.ECHOBOT_TYPING_DELAY);
    }

    sendTypingSignal(roomId:number, conversationId:number, userToId:number, done:() => void):void {
        console.log("DemoServerAdapter: sendTypingSignal");
    }

    getMessageHistory(roomId:number, conversationId:number, otherUserId:number, done:(p1:Array<ChatMessageInfo>)=>void):void {
        console.log("DemoServerAdapter: getMessageHistory");
        done([]);
    }

    getUserInfo(userId:number, done:(p1:ChatUserInfo)=>void):void {
        console.log("DemoServerAdapter: getUserInfo");
        var user:ChatUserInfo = null;
        for (var i:number = 0; i < this.users.length; i++) {
            if (this.users[i].Id == userId) {
                user = this.users[i];
                break;
            }
        }
        if (user == null)
            throw "User doesn't exit. User id: " + userId;
        done(user);
    }

    getUserList(roomId:number, conversationId:number, done:(p1:Array<ChatUserInfo>)=>void):void {
        console.log("DemoServerAdapter: getUserList");
        if(roomId == DemoAdapterConstants.DEFAULT_ROOM_ID)
        {
            done(this.users);
            return;
        }
        throw "The given room or conversation is not supported by the demo adapter";
    }

    enterRoom(roomId:number, done:()=>void):void {
        console.log("DemoServerAdapter: enterRoom");

        if(roomId != DemoAdapterConstants.DEFAULT_ROOM_ID)
            throw "Only the default room is supported in the demo adapter";

        var userListChangedInfo = new ChatUserListChangedInfo();
        userListChangedInfo.RoomId =DemoAdapterConstants.DEFAULT_ROOM_ID;
        userListChangedInfo.UserList = this.users;

        this.clientAdapter.triggerUserListChanged(userListChangedInfo);
    }

    leaveRoom(roomId:number, done:()=>void):void {
        console.log("DemoServerAdapter: leaveRoom");
    }

    // gets the given user from the user list
    getUserById(userId: number):ChatUserInfo {
        for(var i = 0; i < this.users.length ;i++)
        {
            if(this.users[i].Id == userId)
            return this.users[i];
        }
        throw "Could not find the given user";
    }

    // the client adapter
    clientAdapter: IClientAdapter;

    // list of users
    users:Array<ChatUserInfo>;

    // list of rooms
    rooms:Array<ChatRoomInfo>;
}

class DemoAdapter implements IAdapter {
    // called when the adapter is initialized
    init(done:() => void):void {
        this.client = new DemoClientAdapter();
        this.server = new DemoServerAdapter(this.client);
        done();
    }

    // functions called by the server, to contact the client
    client:IClientAdapter;

    // functions called by the client, to contact the server
    server:IServerAdapter;
}